import {
  generateAllocation,
  generateDrift,
  generateMarketView,
  generatePlanViews,
  parseNavor,
} from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('generateDrift', () => {
  it('computes target, actual, and drift status from plan and market values', () => {
    const source = `2026-01-01 option Portfolio:Core "Base settings"
  base_currency: USD

2026-01-01 open Account:Crypto "Digital assets"
  target: 100%

2026-01-02 open Asset:Crypto:BTC "Bitcoin"
  symbol: BTC
  account: Account:Crypto
  target: 100%

2026-04-03 plan Asset:Crypto:BTC "Current target"
  target: 30%
  min: 25%
  max: 35%

2026-01-03 plan Asset:Crypto:BTC "Historical target"
  target: 25%
  min: 20%
  max: 30%

2026-03-02 txn Asset:Crypto:BTC "Buy BTC"
  Assets:Crypto:BTC       0.10 BTC @ 90,000 USD
  Assets:Cash:USD        -9,000 USD
`

    const ast = parseNavor(source).ast
    const allocation = generateAllocation(ast)
    const plan = generatePlanViews(ast)
    const market = generateMarketView(ast, {
      prices: [
        {
          subject: 'Asset:Crypto:BTC',
          price: { amount: 100000, currency: 'USD' },
          provider: 'Fixture',
          asOf: '2026-07-08T00:00:00Z',
        },
      ],
    })
    const drift = generateDrift({
      allocation,
      market,
      plan,
      baseCurrency: 'USD',
    })

    expect(drift.totalMarketValue).toEqual({ amount: 10000, currency: 'USD' })
    expect(drift.entries[0]).toMatchObject({
      subject: 'Asset:Crypto:BTC',
      targetWeight: 30,
      actualWeight: 100,
      drift: 70,
      status: 'above_max',
      planMin: 25,
      planMax: 35,
    })
  })

  it('converts multi-currency market values into base currency totals using fx rates', () => {
    const source = `2026-01-01 option Portfolio:Core "Base settings"
  base_currency: USD
  fx_rates: CNY=7.25, HKD=7.80

2026-01-01 open Account:US "US"
  target: 50%

2026-01-01 open Account:CN "CN"
  target: 50%

2026-01-02 open Asset:Equity:US:AAPL "Apple"
  account: Account:US
  target: 50%

2026-01-02 open Asset:Equity:CN:600519 "Moutai"
  account: Account:CN
  target: 50%
`

    const ast = parseNavor(source).ast
    const allocation = generateAllocation(ast)
    const plan = generatePlanViews(ast)
    const market = generateMarketView(ast, {
      prices: [
        {
          subject: 'Asset:Equity:US:AAPL',
          price: { amount: 100, currency: 'USD' },
          provider: 'Fixture',
          asOf: '2026-07-08T00:00:00Z',
        },
        {
          subject: 'Asset:Equity:CN:600519',
          price: { amount: 725, currency: 'CNY' },
          provider: 'Fixture',
          asOf: '2026-07-08T00:00:00Z',
        },
      ],
      portfolio: {
        transactions: [],
        holdings: [
          {
            asset: 'Asset:Equity:US:AAPL',
            commodity: 'AAPL',
            quantity: 10,
            cost: { amount: 900, currency: 'USD' },
          },
          {
            asset: 'Asset:Equity:CN:600519',
            commodity: '600519',
            quantity: 10,
            cost: { amount: 7250, currency: 'CNY' },
          },
        ],
        cash: [],
        income: [],
        expenses: [],
        realizedPnl: [],
        diagnostics: [],
      },
    })
    const drift = generateDrift({
      allocation,
      market,
      plan,
      baseCurrency: 'USD',
      fxRates: { CNY: 7.25, HKD: 7.8 },
    })

    expect(drift.totalMarketValue).toEqual({ amount: 2000, currency: 'USD' })
    expect(drift.entries.find((entry) => entry.subject === 'Asset:Equity:US:AAPL')).toMatchObject({
      marketValueInBase: { amount: 1000, currency: 'USD' },
      actualWeight: 50,
    })
    expect(drift.entries.find((entry) => entry.subject === 'Asset:Equity:CN:600519')).toMatchObject(
      {
        marketValueInBase: { amount: 1000, currency: 'USD' },
        actualWeight: 50,
      },
    )
  })
})
