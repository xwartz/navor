import { fetchYahooQuotes } from '@navor/adapters'
import { describe, expect, it } from 'vitest'

describe('fetchYahooQuotes 429 retry', () => {
  it('retries a 429 and succeeds without raising concurrency', async () => {
    let attempts = 0
    let inFlight = 0
    let peak = 0

    const result = await fetchYahooQuotes(['NVDA', 'AAPL'], {
      concurrency: 1,
      maxRetriesOn429: 2,
      sleep: async () => undefined,
      fetch: async () => {
        inFlight += 1
        peak = Math.max(peak, inFlight)
        attempts += 1
        const attemptForSymbol = attempts
        inFlight -= 1

        if (attemptForSymbol === 1) {
          return new Response('Too Many Requests', { status: 429 })
        }

        return new Response(
          JSON.stringify({
            chart: {
              result: [
                {
                  meta: {
                    regularMarketPrice: 10 + attemptForSymbol,
                    currency: 'USD',
                    regularMarketTime: 1_752_000_000,
                  },
                },
              ],
            },
          }),
        )
      },
    })

    expect(peak).toBe(1)
    expect(result.failures).toEqual([])
    expect(result.quotes.size).toBe(2)
  })
})
