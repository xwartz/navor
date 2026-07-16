import { handlePriceProxyRequest } from '@navor/adapters'
import { applyLivePrices, compileNavorWorkspace } from '@navor/renderer'
import { describe, expect, it } from 'vitest'

import { createYahooSparkFetch } from '../adapters/yahoo-spark-fixture'

describe('applyLivePrices', () => {
  it('recomputes market, drift, and dashboard from proxy prices', async () => {
    const baseState = await compileNavorWorkspace('fixtures/core', {
      today: '2026-07-08',
      fetchLivePrices: false,
    })

    const enriched = applyLivePrices(
      baseState,
      {
        prices: [
          {
            subject: 'Asset:Crypto:BTC',
            price: { amount: 100000, currency: 'USD' },
            provider: 'FixtureProxy',
            asOf: '2026-07-08T00:00:00Z',
          },
        ],
      },
      { today: '2026-07-08' },
    )

    expect(enriched.market.portfolioValues).toHaveLength(1)
    expect(enriched.market.portfolioValues[0]?.marketValue.amount).toBeCloseTo(45114.488, 3)
    expect(
      enriched.drift.entries.find((entry) => entry.subject === 'Asset:Crypto:BTC'),
    ).toMatchObject({
      status: 'above_max',
    })
    expect(enriched.enrichment.prices).toEqual(
      expect.arrayContaining([
        {
          subject: 'Asset:Crypto:BTC',
          provider: 'FixtureProxy',
          asOf: '2026-07-08T00:00:00Z',
          status: 'fresh',
        },
      ]),
    )
  })
})

describe('handlePriceProxyRequest', () => {
  it('maps yahoo quotes back to subjects', async () => {
    const response = await handlePriceProxyRequest(
      new Request('http://localhost/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: [
            {
              subject: 'Asset:Crypto:BTC',
              yahooSymbol: 'BTC-USD',
            },
          ],
        }),
      }),
      {
        cacheTtlMs: 0,
        fetch: createYahooSparkFetch(100000),
      },
    )

    expect(response.status).toBe(200)

    const payload = (await response.json()) as {
      prices: Array<{ subject: string; price: { amount: number; currency: string }; asOf: string }>
      failures: unknown[]
    }

    expect(payload.failures).toEqual([])
    expect(payload.prices).toEqual([
      expect.objectContaining({
        subject: 'Asset:Crypto:BTC',
        price: { amount: 100000, currency: 'USD' },
        provider: 'YahooFinance',
        asOf: new Date(1_752_000_000 * 1000).toISOString(),
      }),
    ])
  })
})

describe('compileNavorWorkspace price manifest', () => {
  it('includes a manifest without fetching live prices by default', async () => {
    const state = await compileNavorWorkspace('fixtures/core', {
      today: '2026-07-08',
    })

    expect(state.priceManifest.livePricesPath).toBe('/api/prices')
    expect(state.priceManifest.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: 'Asset:Crypto:BTC',
          symbol: 'BTC',
          yahooSymbol: 'BTC-USD',
        }),
      ]),
    )
    expect(state.market.prices).toEqual([])
    expect(state.enrichment.prices.every((price) => price.status === 'missing')).toBe(true)
  })
})
