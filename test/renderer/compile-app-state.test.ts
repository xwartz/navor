import { compileNavorWorkspace } from '@navor/renderer'
import { describe, expect, it } from 'vitest'

describe('compileNavorWorkspace', () => {
  it('preserves configured FX rates in renderer state', async () => {
    const state = await compileNavorWorkspace('example', {
      fetchLivePrices: false,
      today: '2026-07-10',
    })

    expect(state.drift.baseCurrency).toBe('USD')
    expect(state.drift.fxRates).toEqual({ CNY: 7, HKD: 7.84 })
    expect(state.drift.unconvertedCurrencies).toEqual([])
  })

  it('compiles a Navor Workspace into one serializable renderer app state', async () => {
    const state = await compileNavorWorkspace('fixtures/core', {
      today: '2026-07-08',
      prices: [
        {
          subject: 'Asset:Crypto:BTC',
          price: { amount: 100000, currency: 'USD' },
          provider: 'Fixture',
          asOf: '2026-07-08T00:00:00Z',
        },
      ],
    })

    expect(state.workspace.files).toHaveLength(7)
    expect(state.workspace.diagnostics).toEqual([])
    expect(
      state.dashboard.assets.find((asset) => asset.subject === 'Asset:Crypto:BTC'),
    ).toMatchObject({
      target: 46,
      derivedPortfolioWeight: 13.8,
    })
    expect(state.dashboard.assets).toHaveLength(34)
    expect(state.portfolio.holdings).toHaveLength(13)
    const btcHolding = state.portfolio.holdings.find(
      (holding) => holding.asset === 'Asset:Crypto:BTC',
    )
    expect(btcHolding).toMatchObject({
      asset: 'Asset:Crypto:BTC',
      commodity: 'BTC',
      quantity: 0.45114488,
      cost: { currency: 'USD' },
    })
    expect(btcHolding?.cost?.amount).toBeCloseTo(7000, 4)
    expect(state.knowledge.research).toHaveLength(2)
    expect(state.process.watchlist).toEqual([])
    expect(state.market.portfolioValues).toHaveLength(1)
    expect(state.market.portfolioValues[0]).toMatchObject({
      subject: 'Asset:Crypto:BTC',
      marketValue: { currency: 'USD' },
      cost: { currency: 'USD' },
      pnl: { currency: 'USD' },
    })
    expect(state.market.portfolioValues[0]?.marketValue.amount).toBeCloseTo(45114.488, 3)
    expect(state.market.portfolioValues[0]?.cost?.amount).toBeCloseTo(7000, 4)
    expect(state.market.portfolioValues[0]?.pnl?.amount).toBeCloseTo(38114.488, 3)
    expect(state.enrichment.prices).toEqual(
      expect.arrayContaining([
        {
          subject: 'Asset:Crypto:BTC',
          provider: 'Fixture',
          asOf: '2026-07-08T00:00:00Z',
          status: 'fresh',
        },
      ]),
    )
    expect(state.priceManifest.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subject: 'Asset:Crypto:BTC',
        }),
      ]),
    )
    expect(state.plan.entries.map((entry) => entry.subject)).toContain('Asset:Crypto:BTC')
    expect(state.drift.entries.find((entry) => entry.subject === 'Asset:Crypto:BTC')).toMatchObject(
      {
        targetWeight: 25,
        status: 'above_max',
      },
    )
    expect(() => JSON.stringify(state)).not.toThrow()
  })
})
