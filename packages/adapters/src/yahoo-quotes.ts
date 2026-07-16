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
  /** Max in-flight Yahoo chart requests. Cloudflare egress is rate-limited; keep this low. */
  concurrency?: number
  /** Retries after a 429 (not counting the first attempt). */
  maxRetriesOn429?: number
  sleep?: (ms: number) => Promise<void>
}

const DEFAULT_CONCURRENCY = 1
const DEFAULT_MAX_RETRIES_ON_429 = 2
const RETRY_BASE_DELAY_MS = 250

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
  const concurrency = Math.max(1, resolved.concurrency ?? DEFAULT_CONCURRENCY)
  const maxRetriesOn429 = resolved.maxRetriesOn429 ?? DEFAULT_MAX_RETRIES_ON_429
  const sleep = resolved.sleep ?? defaultSleep

  const quotes = new Map<string, YahooQuoteResult>()
  const failures: YahooQuoteFailure[] = []
  let nextIndex = 0

  async function worker() {
    while (nextIndex < symbols.length) {
      const index = nextIndex
      nextIndex += 1
      const symbol = symbols[index]

      if (!symbol) {
        continue
      }

      try {
        const quote = await fetchYahooQuoteInternal(symbol, fetchFn, maxRetriesOn429, sleep)
        quotes.set(symbol, quote)
      } catch (error) {
        failures.push({
          symbol,
          message: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, symbols.length) }, () => worker())
  await Promise.all(workers)

  return { quotes, failures }
}

async function fetchYahooQuoteInternal(
  symbol: string,
  fetchFn: typeof fetch,
  maxRetriesOn429: number,
  sleep: (ms: number) => Promise<void>,
) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
  let attempt = 0

  while (true) {
    const response = await fetchFn(url)

    if (response.status === 429 && attempt < maxRetriesOn429) {
      attempt += 1
      await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
      continue
    }

    if (!response.ok) {
      throw new Error(`Yahoo Finance request failed with ${response.status}.`)
    }

    const payload = (await response.json()) as YahooChartResponse
    const result = payload.chart?.result?.[0]
    const price = result?.meta?.regularMarketPrice
    const currency = result?.meta?.currency
    const asOfSeconds = result?.meta?.regularMarketTime

    if (price === undefined || !currency || !asOfSeconds) {
      throw new Error(`Yahoo Finance returned no quote for "${symbol}".`)
    }

    return {
      price: { amount: price, currency },
      asOf: new Date(asOfSeconds * 1000).toISOString(),
    }
  }
}

function defaultSleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number
        currency?: string
        regularMarketTime?: number
      }
    }>
  }
}
