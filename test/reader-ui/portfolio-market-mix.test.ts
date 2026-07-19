import { describe, expect, it } from 'vitest'

import { calculateMarketMix } from '../../packages/reader-ui/src/views/PortfolioView'

describe('calculateMarketMix', () => {
  it('calculates weights from market values converted to the base currency', () => {
    const marketMix = calculateMarketMix(
      [
        {
          subject: 'Asset:Equity:US:AAPL',
          marketValue: { amount: 1000, currency: 'USD' },
          cost: null,
          pnlInMarketCurrency: null,
          pnl: null,
        },
        {
          subject: 'Asset:Equity:CN:600519',
          marketValue: { amount: 7250, currency: 'CNY' },
          cost: null,
          pnlInMarketCurrency: null,
          pnl: null,
        },
      ],
      'USD',
      { CNY: 7.25 },
    )

    expect(marketMix.total).toBe(2000)
    expect(marketMix.values.map((value) => (value.amount / marketMix.total) * 100)).toEqual([
      50, 50,
    ])
    expect(marketMix.unconvertedCurrencies).toEqual([])
  })

  it('excludes values without an FX rate instead of mixing nominal currencies', () => {
    const marketMix = calculateMarketMix(
      [
        {
          subject: 'Asset:Equity:US:AAPL',
          marketValue: { amount: 1000, currency: 'USD' },
          cost: null,
          pnlInMarketCurrency: null,
          pnl: null,
        },
        {
          subject: 'Asset:Equity:JP:7203',
          marketValue: { amount: 100000, currency: 'JPY' },
          cost: null,
          pnlInMarketCurrency: null,
          pnl: null,
        },
      ],
      'USD',
      {},
    )

    expect(marketMix.total).toBe(1000)
    expect(marketMix.values).toHaveLength(1)
    expect(marketMix.unconvertedCurrencies).toEqual(['JPY'])
  })
})
