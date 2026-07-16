/**
 * Regression: Yahoo Finance 429s and subrequest limits on large portfolios.
 *
 * Uses batched spark requests only (no per-symbol chart fallback) so a 30+ symbol
 * portfolio stays within rate limits and Worker subrequest budgets.
 */
import { handlePriceProxyRequest } from '@navor/adapters'
import { describe, expect, it } from 'vitest'

import {
  createYahooSpark429Fetch,
  createYahooSpark429UntilSizeFetch,
  createYahooSparkFetch,
} from './yahoo-spark-fixture'

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

    expect(payload.failures).toEqual([])
    expect(payload.prices).toHaveLength(ENTRIES.length)
    expect(fetchCount).toBe(1)
  })

  it('retries spark batches on 429 without chart fallback', async () => {
    const sparkFetch = createYahooSpark429Fetch(1)
    let fetchCount = 0
    const fetchFn: typeof fetch = async (input, init) => {
      fetchCount += 1
      return sparkFetch(input, init)
    }

    const response = await handlePriceProxyRequest(
      new Request('http://localhost/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: ENTRIES }),
      }),
      { cacheTtlMs: 0, fetch: fetchFn, batchDelayMs: 0, sleep: async () => undefined },
    )

    const payload = (await response.json()) as {
      prices: unknown[]
      failures: Array<{ message: string }>
    }

    expect(payload.failures).toEqual([])
    expect(payload.prices).toHaveLength(ENTRIES.length)
    expect(fetchCount).toBe(2)
  })

  it('chunks large portfolios into two Yahoo batch requests', async () => {
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
      { cacheTtlMs: 0, fetch: fetchFn, batchDelayMs: 0 },
    )

    const payload = (await response.json()) as {
      prices: unknown[]
      failures: unknown[]
    }

    expect(payload.failures).toEqual([])
    expect(payload.prices).toHaveLength(entries.length)
    expect(fetchCount).toBe(2)
  })

  it('splits oversized spark batches after 429 into smaller successful requests', async () => {
    const entries = Array.from({ length: 15 }, (_, index) => ({
      subject: `Asset:Equity:US:SYM${index}`,
      yahooSymbol: `SYM${index}`,
    }))
    const sparkFetch = createYahooSpark429UntilSizeFetch(10)
    let fetchCount = 0
    const fetchFn: typeof fetch = async (input, init) => {
      fetchCount += 1
      return sparkFetch(input, init)
    }

    const response = await handlePriceProxyRequest(
      new Request('http://localhost/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      }),
      {
        cacheTtlMs: 0,
        fetch: fetchFn,
        batchDelayMs: 0,
        sleep: async () => undefined,
      },
    )

    const payload = (await response.json()) as {
      prices: unknown[]
      failures: unknown[]
    }

    expect(payload.failures).toEqual([])
    expect(payload.prices).toHaveLength(entries.length)
    expect(fetchCount).toBeGreaterThan(1)
    expect(fetchCount).toBeLessThanOrEqual(8)
  })
})
