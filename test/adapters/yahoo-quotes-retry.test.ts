import { fetchYahooQuotes } from '@navor/adapters'
import { describe, expect, it } from 'vitest'

import { createYahooSpark429Fetch } from './yahoo-spark-fixture'

describe('fetchYahooQuotes 429 retry', () => {
  it('retries a spark 429 batch and succeeds', async () => {
    const sparkFetch = createYahooSpark429Fetch(1)
    let attempts = 0

    const result = await fetchYahooQuotes(['NVDA', 'AAPL'], {
      maxRetriesOn429: 2,
      batchDelayMs: 0,
      sleep: async () => undefined,
      fetch: async (input, init) => {
        attempts += 1
        return sparkFetch(input, init)
      },
    })

    expect(attempts).toBe(2)
    expect(result.failures).toEqual([])
    expect(result.quotes.size).toBe(2)
  })
})
