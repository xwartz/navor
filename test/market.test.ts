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
        pnl: { amount: 1000, currency: 'USD' },
      },
    ])
  })
})
