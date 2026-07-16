import { fetchYahooQuotes } from '@navor/adapters'
import { describe, expect, it } from 'vitest'

import { createYahooSparkResponse } from './yahoo-spark-fixture'

describe('fetchYahooQuotes 429 retry', () => {
  it('retries a 429 batch and succeeds', async () => {
    let attempts = 0

    const result = await fetchYahooQuotes(['NVDA', 'AAPL'], {
      maxRetriesOn429: 2,
      sleep: async () => undefined,
      fetch: async () => {
        attempts += 1

        if (attempts === 1) {
          return new Response('Too Many Requests', { status: 429 })
        }

        return new Response(JSON.stringify(createYahooSparkResponse(['NVDA', 'AAPL'], 123.45)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    })

    expect(attempts).toBe(2)
    expect(result.failures).toEqual([])
    expect(result.quotes.size).toBe(2)
  })
})
