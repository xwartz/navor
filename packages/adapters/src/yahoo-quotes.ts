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
  /** Retries after a 429 (not counting the first attempt). */
  maxRetriesOn429?: number
  sleep?: (ms: number) => Promise<void>
}

const MAX_SPARK_BATCH_SIZE = 20
const DEFAULT_MAX_RETRIES_ON_429 = 2
const RETRY_BASE_DELAY_MS = 500

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
  const maxRetriesOn429 = resolved.maxRetriesOn429 ?? DEFAULT_MAX_RETRIES_ON_429
  const sleep = resolved.sleep ?? defaultSleep

  const quotes = new Map<string, YahooQuoteResult>()
  const failures: YahooQuoteFailure[] = []
  const uniqueSymbols = [...new Set(symbols)]

  for (let index = 0; index < uniqueSymbols.length; index += batchSize) {
    const batch = uniqueSymbols.slice(index, index + batchSize)

    try {
      const batchQuotes = await fetchYahooSparkBatch(batch, fetchFn, maxRetriesOn429, sleep)

      for (const [symbol, quote] of batchQuotes) {
        quotes.set(symbol, quote)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      for (const symbol of batch) {
        failures.push({ symbol, message })
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

async function fetchYahooSparkBatch(
  symbols: string[],
  fetchFn: typeof fetch,
  maxRetriesOn429: number,
  sleep: (ms: number) => Promise<void>,
) {
  const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${symbols.map(encodeURIComponent).join(',')}&range=1d&interval=1d`
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
