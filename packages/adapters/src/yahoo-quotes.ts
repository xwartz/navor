import type { MoneyAmount } from '@navor/core'

export interface YahooQuoteResult {
  price: MoneyAmount
  asOf: string
}

export interface YahooQuoteFailure {
  symbol: string
  message: string
}

export interface FetchYahooQuotesOptions {
  fetch?: typeof fetch
  /** Max symbols per Yahoo spark batch request (Yahoo rejects >20). */
  batchSize?: number
  /** Delay between spark batch requests. */
  batchDelayMs?: number
  /** Retries after a 429 on a spark batch (not counting the first attempt). */
  maxRetriesOn429?: number
  sleep?: (ms: number) => Promise<void>
}

const MAX_SPARK_BATCH_SIZE = 20
const DEFAULT_BATCH_DELAY_MS = 500
const DEFAULT_MAX_RETRIES_ON_429 = 2
const RETRY_BASE_DELAY_MS = 1500

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  Accept: 'application/json,text/plain,*/*',
}

export async function fetchYahooQuote(symbol: string, fetchFn: typeof fetch = fetch) {
  const fetched = await fetchYahooQuotes([symbol], { fetch: fetchFn })
  const quote = fetched.quotes.get(symbol)

  if (!quote) {
    const failure = fetched.failures.find((item) => item.symbol === symbol)
    throw new Error(failure?.message ?? `Yahoo Finance returned no quote for "${symbol}".`)
  }

  return quote
}

export async function fetchYahooQuotes(
  symbols: string[],
  options: FetchYahooQuotesOptions | typeof fetch = {},
) {
  const resolved = typeof options === 'function' ? { fetch: options } : options
  const fetchFn = resolved.fetch ?? fetch
  const batchSize = Math.max(
    1,
    Math.min(resolved.batchSize ?? MAX_SPARK_BATCH_SIZE, MAX_SPARK_BATCH_SIZE),
  )
  const uniqueSymbols = [...new Set(symbols)]
  const batchDelayMs = resolved.batchDelayMs ?? DEFAULT_BATCH_DELAY_MS
  const maxRetriesOn429 = resolved.maxRetriesOn429 ?? DEFAULT_MAX_RETRIES_ON_429
  const sleep = resolved.sleep ?? defaultSleep
  const yahooFetch = createYahooFetch(fetchFn)

  const quotes = new Map<string, YahooQuoteResult>()
  const failures: YahooQuoteFailure[] = []

  for (let index = 0; index < uniqueSymbols.length; index += batchSize) {
    if (index > 0) {
      await sleep(batchDelayMs)
    }

    const batch = uniqueSymbols.slice(index, index + batchSize)

    try {
      const batchQuotes = await fetchYahooSparkWithSplit(
        batch,
        yahooFetch,
        maxRetriesOn429,
        batchDelayMs,
        sleep,
      )

      for (const [symbol, quote] of batchQuotes) {
        quotes.set(symbol, quote)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      for (const symbol of batch) {
        if (!quotes.has(symbol)) {
          failures.push({ symbol, message })
        }
      }
    }
  }

  for (const symbol of uniqueSymbols) {
    if (quotes.has(symbol)) {
      continue
    }

    if (failures.some((failure) => failure.symbol === symbol)) {
      continue
    }

    failures.push({
      symbol,
      message: `Yahoo Finance returned no quote for "${symbol}".`,
    })
  }

  return { quotes, failures }
}

function createYahooFetch(fetchFn: typeof fetch) {
  return (url: string) =>
    fetchFn(url, {
      headers: YAHOO_HEADERS,
      cf: {
        cacheEverything: true,
        cacheTtl: 300,
        cacheTtlByStatus: {
          '200-299': 300,
          '404': 0,
          '429': 0,
          '500-599': 0,
        },
      },
    } as RequestInit)
}

async function fetchYahooSparkWithSplit(
  symbols: string[],
  yahooFetch: (url: string) => Promise<Response>,
  maxRetriesOn429: number,
  batchDelayMs: number,
  sleep: (ms: number) => Promise<void>,
): Promise<Map<string, YahooQuoteResult>> {
  if (symbols.length === 0) {
    return new Map()
  }

  try {
    return await fetchYahooSparkBatch(symbols, yahooFetch, maxRetriesOn429, sleep)
  } catch (error) {
    if (!isYahoo429(error) || symbols.length === 1) {
      throw error
    }

    const midpoint = Math.ceil(symbols.length / 2)
    const left = await fetchYahooSparkWithSplit(
      symbols.slice(0, midpoint),
      yahooFetch,
      maxRetriesOn429,
      batchDelayMs,
      sleep,
    )

    await sleep(batchDelayMs)

    const right = await fetchYahooSparkWithSplit(
      symbols.slice(midpoint),
      yahooFetch,
      maxRetriesOn429,
      batchDelayMs,
      sleep,
    )

    return new Map([...left, ...right])
  }
}

async function fetchYahooSparkBatch(
  symbols: string[],
  yahooFetch: (url: string) => Promise<Response>,
  maxRetriesOn429: number,
  sleep: (ms: number) => Promise<void>,
) {
  const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${symbols.map(encodeURIComponent).join(',')}&range=1d&interval=1d`
  let attempt = 0

  while (true) {
    const response = await yahooFetch(url)

    if (response.status === 429 && attempt < maxRetriesOn429) {
      attempt += 1
      await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
      continue
    }

    if (!response.ok) {
      throw new Error(`Yahoo Finance request failed with ${response.status}.`)
    }

    const payload = (await response.json()) as YahooSparkResponse
    const quotes = new Map<string, YahooQuoteResult>()

    for (const item of payload.spark?.result ?? []) {
      const symbol = item.symbol
      const meta = item.response?.[0]?.meta
      const price = meta?.regularMarketPrice
      const currency = meta?.currency
      const asOfSeconds = meta?.regularMarketTime

      if (!symbol || price === undefined || !currency || !asOfSeconds) {
        continue
      }

      quotes.set(symbol, {
        price: { amount: price, currency },
        asOf: new Date(asOfSeconds * 1000).toISOString(),
      })
    }

    return quotes
  }
}

function isYahoo429(error: unknown) {
  return error instanceof Error && error.message.includes('Yahoo Finance request failed with 429.')
}

function defaultSleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

interface YahooSparkResponse {
  spark?: {
    result?: Array<{
      symbol?: string
      response?: Array<{
        meta?: {
          regularMarketPrice?: number
          currency?: string
          regularMarketTime?: number
        }
      }>
    }>
  }
}
