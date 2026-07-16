/**
 * Regression: Cloudflare Yahoo Finance 429s from unbounded concurrent chart fetches.
 *
 * Models a provider that returns 429 when concurrent in-flight requests exceed 1
 * (shared Cloudflare egress often behaves this way). fetchYahooQuotes must keep
 * concurrency ≤ 1 so the proxy can succeed for a multi-symbol portfolio request.
 *
 * Run: pnpm exec vitest run test/adapters/yahoo-429-concurrency.test.ts
 */
import { handlePriceProxyRequest } from '@navor/adapters'
import { describe, expect, it } from 'vitest'

const ENTRIES = [
  { subject: 'Asset:Equity:US:NVDA', yahooSymbol: 'NVDA' },
  { subject: 'Asset:Equity:US:AAPL', yahooSymbol: 'AAPL' },
  { subject: 'Asset:Equity:US:MSFT', yahooSymbol: 'MSFT' },
  { subject: 'Asset:Equity:US:GOOGL', yahooSymbol: 'GOOGL' },
  { subject: 'Asset:Equity:US:TSLA', yahooSymbol: 'TSLA' },
  { subject: 'Asset:Equity:US:AMZN', yahooSymbol: 'AMZN' },
]

function createRateLimitedYahooFetch(maxConcurrent: number) {
  let inFlight = 0
  let peak = 0

  const fetchFn: typeof fetch = async () => {
    inFlight += 1
    peak = Math.max(peak, inFlight)

    await new Promise((resolve) => setTimeout(resolve, 20))

    const overLimit = inFlight > maxConcurrent
    inFlight -= 1

    if (overLimit) {
      return new Response('Too Many Requests', { status: 429 })
    }

    return new Response(
      JSON.stringify({
        chart: {
          result: [
            {
              meta: {
                regularMarketPrice: 100,
                currency: 'USD',
                regularMarketTime: 1_752_000_000,
              },
            },
          ],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return {
    fetchFn,
    peak: () => peak,
  }
}

describe('yahoo quote concurrency under rate limits', () => {
  it('fetches multi-symbol proxy requests without Yahoo 429 failures', async () => {
    const { fetchFn, peak } = createRateLimitedYahooFetch(1)

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
    expect(peak()).toBeLessThanOrEqual(1)
  })
})
