/**
 * Regression: Cloudflare Yahoo Finance 429s and subrequest limits on large portfolios.
 *
 * Uses batched spark requests (not per-symbol chart fetches) so a 30+ symbol
 * portfolio stays within Worker subrequest limits and Yahoo rate limits.
 */
import { handlePriceProxyRequest } from '@navor/adapters'
import { describe, expect, it } from 'vitest'

import { createYahooSparkFetch } from './yahoo-spark-fixture'

const ENTRIES = [
  { subject: 'Asset:Equity:US:NVDA', yahooSymbol: 'NVDA' },
  { subject: 'Asset:Equity:US:AAPL', yahooSymbol: 'AAPL' },
  { subject: 'Asset:Equity:US:MSFT', yahooSymbol: 'MSFT' },
  { subject: 'Asset:Equity:US:GOOGL', yahooSymbol: 'GOOGL' },
  { subject: 'Asset:Equity:US:TSLA', yahooSymbol: 'TSLA' },
  { subject: 'Asset:Equity:US:AMZN', yahooSymbol: 'AMZN' },
]

describe('yahoo quote batching under rate limits', () => {
  it('fetches multi-symbol proxy requests in a single Yahoo batch', async () => {
    let fetchCount = 0
    const fetchFn: typeof fetch = async (input, init) => {
      fetchCount += 1
      return createYahooSparkFetch()(input, init)
    }

    const response = await handlePriceProxyRequest(
      new Request('http://localhost/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: ENTRIES }),
      }),
      { cacheTtlMs: 0, fetch: fetchFn },
    )

    const payload = (await response.json()) as {
      prices: unknown[]
      failures: Array<{ subject: string; provider: string; message: string }>
    }

    const failures429 = payload.failures.filter((failure) =>
      failure.message.includes('Yahoo Finance request failed with 429.'),
    )

    expect(failures429).toEqual([])
    expect(payload.prices).toHaveLength(ENTRIES.length)
    expect(fetchCount).toBe(1)
  })

  it('chunks large portfolios into at most two Yahoo batch requests', async () => {
    const symbols = Array.from({ length: 34 }, (_, index) => `SYM${index}`)
    const entries = symbols.map((symbol, index) => ({
      subject: `Asset:Equity:US:${index}`,
      yahooSymbol: symbol,
    }))
    let fetchCount = 0
    const fetchFn: typeof fetch = async (input, init) => {
      fetchCount += 1
      return createYahooSparkFetch()(input, init)
    }

    const response = await handlePriceProxyRequest(
      new Request('http://localhost/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      }),
      { cacheTtlMs: 0, fetch: fetchFn },
    )

    const payload = (await response.json()) as {
      prices: unknown[]
      failures: unknown[]
    }

    expect(payload.failures).toEqual([])
    expect(payload.prices).toHaveLength(entries.length)
    expect(fetchCount).toBe(2)
  })
})
