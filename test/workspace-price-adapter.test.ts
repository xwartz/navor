import { buildPricePlan, createWorkspacePriceAdapter, resolveYahooSymbol } from '@navor/adapters'
import { parseNavor } from '@navor/core'
import { describe, expect, it } from 'vitest'

import { createYahooSparkFetch } from './adapters/yahoo-spark-fixture'

describe('createWorkspacePriceAdapter', () => {
  it('uses workspace static prices before attempting Yahoo Finance', async () => {
    const ast = parseNavor(`2026-01-02 open Asset:Crypto:BTC "Bitcoin"
  symbol: BTC
  account: Account:Crypto
  market: Crypto
  currency: USD
`).ast
    const adapter = createWorkspacePriceAdapter({
      ast,
      config: {
        staticPrices: {
          'Asset:Crypto:BTC': {
            amount: 100000,
            currency: 'USD',
            asOf: '2026-07-08T00:00:00Z',
          },
        },
      },
      fetch: async () => {
        throw new Error('Network should not be called when static prices exist.')
      },
    })

    const result = await adapter.fetchPrices(['Asset:Crypto:BTC'])

    expect(result.prices).toEqual([
      {
        subject: 'Asset:Crypto:BTC',
        price: { amount: 100000, currency: 'USD' },
        provider: 'WorkspaceStaticPrices',
        asOf: '2026-07-08T00:00:00Z',
      },
    ])
    expect(result.failures ?? []).toEqual([])
  })

  it('fetches Yahoo Finance quotes when no static price is configured', async () => {
    const ast = parseNavor(`2026-01-02 open Asset:Equity:US:NVDA "NVIDIA"
  symbol: NVDA
  account: Account:US
  market: US
  currency: USD
`).ast
    const adapter = createWorkspacePriceAdapter({
      ast,
      fetch: createYahooSparkFetch(123.45),
    })

    const result = await adapter.fetchPrices(['Asset:Equity:US:NVDA'])

    expect(result.prices[0]).toMatchObject({
      subject: 'Asset:Equity:US:NVDA',
      price: { amount: 123.45, currency: 'USD' },
      provider: 'YahooFinance',
    })
  })
})

describe('resolveYahooSymbol', () => {
  it('maps crypto symbols to Yahoo tickers and honors symbol overrides', () => {
    expect(
      resolveYahooSymbol({
        subject: 'Asset:Crypto:BTC',
        symbol: 'BTC',
        market: 'Crypto',
        type: 'Crypto',
        currency: 'USD',
      }),
    ).toBe('BTC-USD')
    expect(
      resolveYahooSymbol({
        subject: 'Asset:Equity:HK:0700',
        symbol: '0700.HK',
        market: 'HK',
        type: 'Stock',
        currency: 'HKD',
        symbolMap: { 'Asset:Equity:HK:0700': '0700.HK' },
      }),
    ).toBe('0700.HK')
  })
})

describe('buildPricePlan', () => {
  it('gives the static compiler and workspace adapter the same quote eligibility', () => {
    const ast = parseNavor(`2026-01-02 open Asset:Crypto:BTC "Bitcoin"
  symbol: BTC
  market: Crypto
  currency: USD
`).ast

    expect(buildPricePlan(ast)).toEqual([
      {
        subject: 'Asset:Crypto:BTC',
        symbol: 'BTC',
        yahooSymbol: 'BTC-USD',
      },
    ])
  })
})
