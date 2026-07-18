import { generateMarketView, parseNavor } from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('generateMarketView', () => {
  it('combines Navor market Research with fixture market data while preserving sources', () => {
    const source = `2026-01-02 open Asset:Crypto:BTC "Bitcoin"
  symbol: BTC
  account: Account:Crypto

2026-03-02 txn Asset:Crypto:BTC "First BTC tranche"
  Assets:Crypto:BTC       0.10 BTC @ 90,000 USD
  Assets:Cash:USD        -9,000 USD

2026-07-08 research Market:Crypto "ETF inflow remains strong"
  source: Market data
  tags: ETF,Flow
`

    const market = generateMarketView(parseNavor(source).ast, {
      prices: [
        {
          subject: 'Asset:Crypto:BTC',
          price: { amount: 100000, currency: 'USD' },
          provider: 'Fixture',
          asOf: '2026-07-08T00:00:00Z',
        },
      ],
    })

    expect(market.research).toEqual([
      {
        date: '2026-07-08',
        subject: 'Market:Crypto',
        title: 'ETF inflow remains strong',
        source: 'Market data',
        tags: ['ETF', 'Flow'],
      },
    ])
    expect(market.prices).toEqual([
      {
        subject: 'Asset:Crypto:BTC',
        price: { amount: 100000, currency: 'USD' },
        provider: 'Fixture',
        asOf: '2026-07-08T00:00:00Z',
        source: 'external',
      },
    ])
    expect(market.portfolioValues).toEqual([
      {
        subject: 'Asset:Crypto:BTC',
        marketValue: { amount: 10000, currency: 'USD' },
        cost: { amount: 9000, currency: 'USD' },
        pnlInMarketCurrency: { amount: 1000, currency: 'USD' },
        pnl: { amount: 1000, currency: 'USD' },
      },
    ])
  })

  it('calculates display PnL in the market currency while preserving base PnL', () => {
    const source = `2026-01-01 option Portfolio:Core "Base settings"
  base_currency: USD
  fx_rates: USDT=1

2026-01-02 open Asset:Crypto:BTC "Bitcoin"

2026-01-03 txn Asset:Crypto:BTC "Buy"
  Assets:Crypto:BTC 1 BTC @ 6,991.6 USDT
  Assets:Cash:USDT -6,991.6 USDT
`

    const market = generateMarketView(parseNavor(source).ast, {
      prices: [
        {
          subject: 'Asset:Crypto:BTC',
          price: { amount: 8443.929, currency: 'USD' },
          provider: 'Fixture',
          asOf: '2026-01-03T00:00:00Z',
        },
      ],
    })

    expect(market.portfolioValues[0]?.pnlInMarketCurrency?.currency).toBe('USD')
    expect(market.portfolioValues[0]?.pnlInMarketCurrency?.amount).toBeCloseTo(1452.329, 6)
    expect(market.portfolioValues[0]?.pnl?.currency).toBe('USD')
    expect(market.portfolioValues[0]?.pnl?.amount).toBeCloseTo(1452.329, 6)
  })

  it('converts cost into the market quote currency for position PnL', () => {
    const source = `2026-01-01 option Portfolio:Core "Base settings"
  base_currency: USD
  fx_rates: HKD=7.84

2026-01-02 open Asset:Equity:HK:2097 "Mixue"

2026-01-03 txn Asset:Equity:HK:2097 "Buy"
  Assets:Equity:HK:2097 300 2097 @ 266.3333333333 HKD
  Assets:Cash:HKD -79,900 HKD
`

    const market = generateMarketView(parseNavor(source).ast, {
      prices: [
        {
          subject: 'Asset:Equity:HK:2097',
          price: { amount: 214, currency: 'HKD' },
          provider: 'Fixture',
          asOf: '2026-01-03T00:00:00Z',
        },
      ],
    })

    expect(market.portfolioValues[0]?.pnlInMarketCurrency?.currency).toBe('HKD')
    expect(market.portfolioValues[0]?.pnlInMarketCurrency?.amount).toBeCloseTo(-15700, 6)
    expect(market.portfolioValues[0]?.pnl?.currency).toBe('USD')
    expect(market.portfolioValues[0]?.pnl?.amount).toBeCloseTo(-2002.5510204082, 6)
  })

  it('converts base-currency cost into a non-base market quote currency', () => {
    const source = `2026-01-01 option Portfolio:Core "Base settings"
  base_currency: USD
  fx_rates: HKD=7.8

2026-01-02 open Asset:Equity:HK:2097 "Mixue"

2026-01-03 txn Asset:Equity:HK:2097 "Buy"
  Assets:Equity:HK:2097 1 2097 @ 100 USD
  Assets:Cash:USD -100 USD
`

    const market = generateMarketView(parseNavor(source).ast, {
      prices: [
        {
          subject: 'Asset:Equity:HK:2097',
          price: { amount: 858, currency: 'HKD' },
          provider: 'Fixture',
          asOf: '2026-01-03T00:00:00Z',
        },
      ],
    })

    expect(market.portfolioValues[0]?.pnlInMarketCurrency).toEqual({
      amount: 78,
      currency: 'HKD',
    })
    expect(market.portfolioValues[0]?.pnl).toEqual({ amount: 10, currency: 'USD' })
  })

  it('does not calculate position PnL when the market quote currency has no FX rate', () => {
    const source = `2026-01-01 option Portfolio:Core "Base settings"
  base_currency: USD

2026-01-02 open Asset:Equity:HK:2097 "Mixue"

2026-01-03 txn Asset:Equity:HK:2097 "Buy"
  Assets:Equity:HK:2097 1 2097 @ 100 USD
  Assets:Cash:USD -100 USD
`

    const market = generateMarketView(parseNavor(source).ast, {
      prices: [
        {
          subject: 'Asset:Equity:HK:2097',
          price: { amount: 858, currency: 'HKD' },
          provider: 'Fixture',
          asOf: '2026-01-03T00:00:00Z',
        },
      ],
    })

    expect(market.portfolioValues[0]?.pnlInMarketCurrency).toBeNull()
    expect(market.portfolioValues[0]?.pnl).toBeNull()
  })
})
