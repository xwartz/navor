import type { MarketPrice } from '@navor/core'
import type { PriceAdapterFailure } from './types'

import { fetchYahooQuotes } from './yahoo-quotes'

export interface PriceProxyQuoteRequest {
  subject: string
  yahooSymbol: string
}

export interface PriceProxyRequestBody {
  entries: PriceProxyQuoteRequest[]
}

export interface PriceProxyResponseBody {
  prices: MarketPrice[]
  failures: PriceAdapterFailure[]
}

export interface PriceProxyHandlerOptions {
  fetch?: typeof fetch
  cacheTtlMs?: number
  batchDelayMs?: number
  sleep?: (ms: number) => Promise<void>
}

const SYMBOL_CACHE_PREFIX = 'https://navor-price-cache.invalid/symbol/'
const defaultCache = new Map<string, { expiresAt: number; quote: MarketPrice }>()

function getDefaultCache() {
  const cacheStorage = globalThis.caches as CacheStorage & {
    default?: Cache
  }

  return cacheStorage.default ?? null
}

export async function handlePriceProxyRequest(
  request: Request,
  options: PriceProxyHandlerOptions = {},
): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405)
  }

  let body: PriceProxyRequestBody

  try {
    body = (await request.json()) as PriceProxyRequestBody
  } catch {
    return jsonResponse({ error: 'Invalid JSON body.' }, 400)
  }

  if (!Array.isArray(body.entries) || body.entries.length === 0) {
    return jsonResponse({ error: 'Expected a non-empty entries array.' }, 400)
  }

  const fetchFn = options.fetch ?? fetch
  const cacheTtlMs = options.cacheTtlMs ?? 5 * 60_000
  const prices: MarketPrice[] = []
  const failures: PriceAdapterFailure[] = []
  const symbolsToFetch = new Set<string>()

  for (const entry of body.entries) {
    if (!entry.subject || !entry.yahooSymbol) {
      failures.push({
        subject: entry.subject ?? 'unknown',
        provider: 'PriceProxy',
        message: 'Missing subject or yahooSymbol.',
      })
      continue
    }

    const cached = await readSymbolCache(entry.yahooSymbol, cacheTtlMs)

    if (cached) {
      prices.push({
        ...cached,
        subject: entry.subject,
      })
      continue
    }

    symbolsToFetch.add(entry.yahooSymbol)
  }

  const fetched =
    symbolsToFetch.size > 0
      ? await fetchYahooQuotes([...symbolsToFetch], {
          fetch: fetchFn,
          batchDelayMs: options.batchDelayMs,
          sleep: options.sleep,
        })
      : { quotes: new Map(), failures: [] }

  for (const entry of body.entries) {
    if (!entry.subject || !entry.yahooSymbol) {
      continue
    }

    if (prices.some((price) => price.subject === entry.subject)) {
      continue
    }

    const quote = fetched.quotes.get(entry.yahooSymbol)

    if (quote) {
      const price: MarketPrice = {
        subject: entry.subject,
        price: quote.price,
        provider: 'Yahoo',
        asOf: quote.asOf,
      }
      prices.push(price)
      await writeSymbolCache(entry.yahooSymbol, cacheTtlMs, price)
      continue
    }

    const failure = fetched.failures.find((item) => item.symbol === entry.yahooSymbol)

    failures.push({
      subject: entry.subject,
      provider: 'Yahoo',
      message: failure?.message ?? `Yahoo Finance returned no quote for "${entry.yahooSymbol}".`,
    })
  }

  const payload: PriceProxyResponseBody = { prices, failures }

  return jsonResponse(payload, 200)
}

async function readSymbolCache(symbol: string, cacheTtlMs: number) {
  const memory = readMemoryCache(symbol, cacheTtlMs)

  if (memory) {
    return memory
  }

  if (typeof caches === 'undefined') {
    return null
  }

  const cache = getDefaultCache()

  if (!cache) {
    return null
  }

  try {
    const response = await cache.match(`${SYMBOL_CACHE_PREFIX}${encodeURIComponent(symbol)}`)

    if (!response) {
      return null
    }

    const cachedAt = Number(response.headers.get('x-cached-at') ?? '0')

    if (!cachedAt || Date.now() - cachedAt > cacheTtlMs) {
      return null
    }

    const quote = (await response.json()) as MarketPrice
    writeMemoryCache(symbol, cacheTtlMs, quote)
    return quote
  } catch {
    return null
  }
}

async function writeSymbolCache(symbol: string, cacheTtlMs: number, quote: MarketPrice) {
  writeMemoryCache(symbol, cacheTtlMs, quote)

  if (typeof caches === 'undefined') {
    return
  }

  const cache = getDefaultCache()

  if (!cache) {
    return
  }

  try {
    await cache.put(
      `${SYMBOL_CACHE_PREFIX}${encodeURIComponent(symbol)}`,
      new Response(JSON.stringify(quote), {
        headers: {
          'Content-Type': 'application/json',
          'x-cached-at': String(Date.now()),
        },
      }),
    )
  } catch {
    // Ignore cache write failures.
  }
}

function readMemoryCache(symbol: string, cacheTtlMs: number) {
  const entry = defaultCache.get(symbol)

  if (!entry || entry.expiresAt <= Date.now()) {
    defaultCache.delete(symbol)
    return null
  }

  if (cacheTtlMs <= 0) {
    return entry.quote
  }

  return entry.quote
}

function writeMemoryCache(symbol: string, cacheTtlMs: number, quote: MarketPrice) {
  defaultCache.set(symbol, {
    expiresAt: Date.now() + cacheTtlMs,
    quote,
  })
}

function jsonResponse(body: unknown, status: number) {
  return new Response(`${JSON.stringify(body)}\n`, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}
