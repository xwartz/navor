import { generateAllocation, parseNavor } from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('generateAllocation', () => {
  it('computes Account allocation, Asset allocation, and Derived Portfolio Weight', () => {
    const source = `2026-01-01 capital Portfolio:Core "Initial investable capital"
  amount: 100,000 USD

2026-01-01 open Account:US "US equities"
  target: 50%
  budget: 50,000 USD

2026-01-01 open Account:Crypto "Digital assets"
  target: 30%
  budget: 30,000 USD

2026-01-01 open Account:HKA "HK and A shares"
  target: 20%
  budget: 20,000 USD

2026-01-02 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US
  target: 25%

2026-01-02 open Asset:Crypto:BTC "Bitcoin"
  account: Account:Crypto
  target: 70%

2026-01-02 open Asset:Equity:HK:0700 "Tencent"
  account: Account:HKA
  target: 30%
`

    const parsed = parseNavor(source)
    const allocation = generateAllocation(parsed.ast)

    expect(parsed.diagnostics).toEqual([])
    expect(allocation.diagnostics).toEqual([])
    expect(allocation.capital).toEqual({
      amount: 100000,
      currency: 'USD',
      subject: 'Portfolio:Core',
    })
    expect(allocation.accounts).toEqual([
      {
        subject: 'Account:US',
        title: 'US equities',
        target: 50,
        total: null,
        budget: { amount: 50000, currency: 'USD' },
        baseAmount: { amount: 50000, currency: 'USD' },
        allocatedPercent: null,
      },
      {
        subject: 'Account:Crypto',
        title: 'Digital assets',
        target: 30,
        total: null,
        budget: { amount: 30000, currency: 'USD' },
        baseAmount: { amount: 30000, currency: 'USD' },
        allocatedPercent: null,
      },
      {
        subject: 'Account:HKA',
        title: 'HK and A shares',
        target: 20,
        total: null,
        budget: { amount: 20000, currency: 'USD' },
        baseAmount: { amount: 20000, currency: 'USD' },
        allocatedPercent: null,
      },
    ])
    expect(allocation.assets).toEqual([
      {
        subject: 'Asset:Equity:US:NVDA',
        title: 'NVIDIA',
        account: 'Account:US',
        target: 25,
        targetAmount: { amount: 12500, currency: 'USD' },
        derivedPortfolioWeight: 12.5,
      },
      {
        subject: 'Asset:Crypto:BTC',
        title: 'Bitcoin',
        account: 'Account:Crypto',
        target: 70,
        targetAmount: { amount: 21000, currency: 'USD' },
        derivedPortfolioWeight: 21,
      },
      {
        subject: 'Asset:Equity:HK:0700',
        title: 'Tencent',
        account: 'Account:HKA',
        target: 30,
        targetAmount: { amount: 6000, currency: 'USD' },
        derivedPortfolioWeight: 6,
      },
    ])
  })

  it('derives target amount from Account total when budget is absent', () => {
    const source = `2026-01-01 open Account:Crypto "Digital assets"
  target: 30%
  total: 250,000 USD

2026-01-02 open Asset:Crypto:BTC "Bitcoin"
  account: Account:Crypto
  target: 46%
`

    const allocation = generateAllocation(parseNavor(source).ast)

    expect(allocation.assets).toEqual([
      {
        subject: 'Asset:Crypto:BTC',
        title: 'Bitcoin',
        account: 'Account:Crypto',
        target: 46,
        targetAmount: { amount: 115000, currency: 'USD' },
        derivedPortfolioWeight: 13.8,
      },
    ])
  })

  it('retains stablecoin budgets with four-letter currency codes', () => {
    const source = `2026-01-01 open Account:Crypto "Digital assets"
  budget: 25,000 USDT

2026-01-02 open Asset:Crypto:BTC "Bitcoin"
  account: Account:Crypto
  target: 20%
`

    const allocation = generateAllocation(parseNavor(source).ast)

    expect(allocation.accounts).toMatchObject([
      { subject: 'Account:Crypto', budget: { amount: 25000, currency: 'USDT' } },
    ])
    expect(allocation.assets).toMatchObject([
      { subject: 'Asset:Crypto:BTC', targetAmount: { amount: 5000, currency: 'USDT' } },
    ])
  })

  it('derives target amount from capital when Account has only target percent', () => {
    const source = `2026-01-01 capital Portfolio:Core "Initial investable capital"
  amount: 100,000 USD

2026-01-01 open Account:US "US equities"
  target: 50%

2026-01-02 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US
  target: 25%
`

    const allocation = generateAllocation(parseNavor(source).ast)

    expect(allocation.assets).toEqual([
      {
        subject: 'Asset:Equity:US:NVDA',
        title: 'NVIDIA',
        account: 'Account:US',
        target: 25,
        targetAmount: { amount: 12500, currency: 'USD' },
        derivedPortfolioWeight: 12.5,
      },
    ])
  })

  it('derives Account baseAmount from capital and market FX when budget/total are absent', () => {
    const source = `2026-01-01 capital Portfolio:Example "Initial investable capital"
  amount: 1,000,000 USD

2026-01-01 option Portfolio:Example "Base settings"
  base_currency: USD
  fx_rates: CNY=7.00, HKD=7.84

2026-01-01 open Account:CN "A 股账户"
  market: CN
  target: 15%

2026-01-01 open Account:US "美股账户"
  market: US
  target: 25%
`

    const allocation = generateAllocation(parseNavor(source).ast, {
      baseCurrency: 'USD',
      fxRates: { CNY: 7, HKD: 7.84 },
    })

    expect(allocation.accounts.find((account) => account.subject === 'Account:CN')).toMatchObject({
      baseAmount: { amount: 1_050_000, currency: 'CNY' },
    })
    expect(allocation.accounts.find((account) => account.subject === 'Account:US')).toMatchObject({
      baseAmount: { amount: 250_000, currency: 'USD' },
    })
  })

  it('converts capital-derived Account bases into market currency with FX rates', () => {
    const source = `2026-01-01 capital Portfolio:Example "Initial investable capital"
  amount: 1,000,000 USD

2026-01-01 option Portfolio:Example "Base settings"
  base_currency: USD
  fx_rates: CNY=7.00, HKD=7.84

2026-01-01 open Account:CN "A 股账户"
  market: CN
  target: 15%

2026-01-02 open Asset:Equity:CN:600900 "长江电力"
  account: Account:CN
  target: 5%
`

    const allocation = generateAllocation(parseNavor(source).ast, {
      baseCurrency: 'USD',
      fxRates: { CNY: 7, HKD: 7.84 },
    })

    expect(allocation.assets).toEqual([
      {
        subject: 'Asset:Equity:CN:600900',
        title: '长江电力',
        account: 'Account:CN',
        target: 5,
        targetAmount: { amount: 52500, currency: 'CNY' },
        derivedPortfolioWeight: 0.75,
      },
    ])
  })

  it('warns when allocation_value is present', () => {
    const source = `2026-01-01 open Account:Crypto "Digital assets"
  target: 30%
  total: 30,000 USD

2026-01-02 open Asset:Crypto:BTC "Bitcoin"
  account: Account:Crypto
  target: 70%
  allocation_value: 21,000 USD
`

    const allocation = generateAllocation(parseNavor(source).ast)

    expect(allocation.assets[0]?.targetAmount).toEqual({ amount: 21000, currency: 'USD' })
    expect(allocation.diagnostics).toEqual([
      {
        line: 5,
        message:
          'allocation_value is deprecated and ignored; target amount is derived from Account budget or total and Asset target.',
      },
    ])
  })

  it('warns when an Asset references a missing Account', () => {
    const source = `2026-01-02 open Asset:Crypto:BTC "Bitcoin"
  account: Account:Crypto
  target: 70%
`

    const allocation = generateAllocation(parseNavor(source).ast)

    expect(allocation.assets).toEqual([
      {
        subject: 'Asset:Crypto:BTC',
        title: 'Bitcoin',
        account: 'Account:Crypto',
        target: 70,
        targetAmount: null,
        derivedPortfolioWeight: null,
      },
    ])
    expect(allocation.diagnostics).toEqual([
      {
        line: 1,
        message: 'Asset "Asset:Crypto:BTC" references missing Account "Account:Crypto".',
      },
    ])
  })

  it('warns when Account targets or Asset targets exceed 100%', () => {
    const source = `2026-01-01 open Account:US "US equities"
  target: 70%

2026-01-01 open Account:Crypto "Digital assets"
  target: 40%

2026-01-02 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US
  target: 60%

2026-01-02 open Asset:Equity:US:AAPL "Apple"
  account: Account:US
  target: 50%
`

    const allocation = generateAllocation(parseNavor(source).ast)

    expect(allocation.diagnostics).toEqual([
      {
        line: 1,
        message: 'Account targets total 110%, which exceeds 100%.',
      },
      {
        line: 7,
        message: 'Asset targets for Account "Account:US" total 110%, which exceeds 100%.',
      },
    ])
  })
})
