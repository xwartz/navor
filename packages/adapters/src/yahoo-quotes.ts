import type { MoneyAmount } from '@navor/core'

export interface YahooQuoteResult {
  price: MoneyAmount
  asOf: string
}

export interface YahooQuoteFailure {
  symbol: string
  message: string
}

export async function fetchYahooQuote(symbol: string, fetchFn: typeof fetch = fetch) {
  const fetched = await fetchYahooQuotes([symbol], fetchFn)
  const quote = fetched.quotes.get(symbol)

  if (!quote) {
    const failure = fetched.failures.find((item) => item.symbol === symbol)
    throw new Error(failure?.message ?? `Yahoo Finance returned no quote for "${symbol}".`)
  }

  return quote
}

export async function fetchYahooQuotes(symbols: string[], fetchFn: typeof fetch = fetch) {
  const quotes = new Map<string, YahooQuoteResult>()
  const failures: YahooQuoteFailure[] = []

  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const quote = await fetchYahooQuoteInternal(symbol, fetchFn)
        quotes.set(symbol, quote)
      } catch (error) {
        failures.push({
          symbol,
          message: error instanceof Error ? error.message : String(error),
        })
      }
    }),
  )

  return { quotes, failures }
}

async function fetchYahooQuoteInternal(symbol: string, fetchFn: typeof fetch) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
  const response = await fetchFn(url)

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
