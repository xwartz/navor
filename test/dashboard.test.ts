import { generateDashboard, parseNavor } from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('generateDashboard', () => {
  it('combines allocation, portfolio, thesis review, watchlist, and recent transactions', () => {
    const source = `2026-01-01 capital Portfolio:Core "Initial investable capital"
  amount: 100,000 USD

2026-01-01 open Account:Crypto "Digital assets"
  target: 30%
  total: 30,000 USD
  budget: 30,000 USD

2026-01-02 open Asset:Crypto:BTC "Bitcoin"
  account: Account:Crypto
  target: 70%
  status: Active

2026-01-02 open Asset:Crypto:ETH "Ethereum"
  account: Account:Crypto
  target: 30%
  status: Watch
  watch_reason: Waiting for valuation

2026-02-11 thesis Asset:Crypto:BTC "Digital reserve asset"
  status: Active
  review_by: 2026-05-11

2026-03-02 txn Asset:Crypto:BTC "First BTC tranche"
  Assets:Crypto:BTC       0.10 BTC @ 90,000 USD
  Assets:Cash:USD        -9,000 USD
`

    const dashboard = generateDashboard(parseNavor(source).ast, { today: '2026-06-01' })

    expect(dashboard.capital).toEqual({
      amount: 100000,
      currency: 'USD',
      subject: 'Portfolio:Core',
    })
    expect(dashboard.cash).toEqual([{ currency: 'USD', amount: -9000 }])
    expect(dashboard.accounts).toEqual([
      {
        subject: 'Account:Crypto',
        title: 'Digital assets',
        target: 30,
        total: { amount: 30000, currency: 'USD' },
        budget: { amount: 30000, currency: 'USD' },
        baseAmount: { amount: 30000, currency: 'USD' },
        allocatedPercent: null,
      },
    ])
    expect(dashboard.assets).toEqual([
      {
        subject: 'Asset:Crypto:BTC',
        title: 'Bitcoin',
        account: 'Account:Crypto',
        target: 70,
        targetAmount: { amount: 21000, currency: 'USD' },
        derivedPortfolioWeight: 21,
      },
      {
        subject: 'Asset:Crypto:ETH',
        title: 'Ethereum',
        account: 'Account:Crypto',
        target: 30,
        targetAmount: { amount: 9000, currency: 'USD' },
        derivedPortfolioWeight: 9,
      },
    ])
    expect(dashboard.holdings).toEqual([
      {
        asset: 'Asset:Crypto:BTC',
        commodity: 'BTC',
        quantity: 0.1,
        cost: { amount: 9000, currency: 'USD' },
      },
    ])
    expect(dashboard.pendingReviews).toEqual([
      {
        subject: 'Asset:Crypto:BTC',
        title: 'Digital reserve asset',
        reviewBy: '2026-05-11',
      },
    ])
    expect(dashboard.accountExecutions).toMatchObject([
      {
        subject: 'Account:Crypto',
        targetAmount: { amount: 30000, currency: 'USD' },
        investedCost: [{ amount: 9000, currency: 'USD' }],
        investedPercent: 30,
        remainingBudget: { amount: 21000, currency: 'USD' },
      },
    ])
    expect(
      dashboard.assetExecutions.find((asset) => asset.subject === 'Asset:Crypto:BTC'),
    ).toMatchObject({
      subject: 'Asset:Crypto:BTC',
      targetAmount: { amount: 21000, currency: 'USD' },
      investedCost: { amount: 9000, currency: 'USD' },
      investedPercent: 42.857142857142854,
      remainingBudget: { amount: 12000, currency: 'USD' },
      status: 'building',
    })
    expect(dashboard.actionInbox).toEqual([
      {
        id: 'review_due:Asset:Crypto:BTC:2026-05-11',
        type: 'review_due',
        severity: 'high',
        category: 'process_due',
        priorityScore: 701,
        reason: {
          kind: 'review_due',
          overdueDays: 21,
          impactPercent: null,
        },
        impactAmount: null,
        impactPercent: null,
        subject: 'Asset:Crypto:BTC',
        title: 'Digital reserve asset',
        message: 'Review due 2026-05-11.',
        action: 'Review thesis',
        date: '2026-05-11',
      },
    ])
    expect(dashboard.watchlist).toEqual([
      {
        subject: 'Asset:Crypto:ETH',
        title: 'Ethereum',
        account: 'Account:Crypto',
        watchReason: 'Waiting for valuation',
      },
    ])
    expect(dashboard.recentTransactions).toEqual([
      {
        date: '2026-03-02',
        subject: 'Asset:Crypto:BTC',
        title: 'First BTC tranche',
      },
    ])
  })

  it('derives invested percent from transactions instead of asset metadata', () => {
    const source = `2026-01-01 open Account:Crypto "Digital assets"
  target: 30%
  total: 30,000 USD

2026-01-02 open Asset:Crypto:BTC "Bitcoin"
  account: Account:Crypto
  target: 70%
  invested_percent: 99%

2026-03-02 txn Asset:Crypto:BTC "First BTC tranche"
  Assets:Crypto:BTC       0.10 BTC @ 90,000 USD
  Assets:Cash:USD        -9,000 USD
`

    const dashboard = generateDashboard(parseNavor(source).ast)

    expect(
      dashboard.assetExecutions.find((asset) => asset.subject === 'Asset:Crypto:BTC'),
    ).toMatchObject({
      investedCost: { amount: 9000, currency: 'USD' },
      investedPercent: 42.857142857142854,
    })
  })

  it('flags execution when target and invested cost currencies differ', () => {
    const source = `2026-01-01 open Account:HKA "HK allocation"
  target: 50%
  total: 500,000 CNY

2026-01-02 open Asset:Equity:HK:2097 "蜜雪冰城"
  account: Account:HKA
  target: 5%

2026-02-02 txn Asset:Equity:HK:2097 "HK allocation test buy"
  Assets:Equity:HK:2097 273.4375 2097.HK @ 256.00 HKD
  Assets:Cash:HKD       -70,000 HKD
`

    const dashboard = generateDashboard(parseNavor(source).ast)

    expect(
      dashboard.assetExecutions.find((asset) => asset.subject === 'Asset:Equity:HK:2097'),
    ).toMatchObject({
      investedCost: { amount: 70000, currency: 'HKD' },
      investedPercent: null,
      remainingBudget: null,
      status: 'currency_mismatch',
      targetAmount: { amount: 25000, currency: 'CNY' },
    })
    expect(dashboard.actionInbox).toContainEqual({
      id: 'currency_mismatch:Asset:Equity:HK:2097',
      type: 'currency_mismatch',
      severity: 'medium',
      category: 'data_integrity',
      priorityScore: 620,
      reason: {
        kind: 'currency_mismatch',
        impactPercent: null,
      },
      impactAmount: null,
      impactPercent: null,
      subject: 'Asset:Equity:HK:2097',
      title: '蜜雪冰城',
      message: '蜜雪冰城 target is in CNY but invested cost is in HKD.',
      action: 'Check currency conversion',
      date: null,
    })
  })

  it('does not flag currency mismatch when capital-derived targets use market FX', () => {
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

2026-03-09 txn Asset:Equity:CN:600900 "buy"
  Assets:Equity:CN:600900 239 600900.SS @ 27.45 CNY
  Assets:Cash:CNY        -6,566 CNY
`

    const dashboard = generateDashboard(parseNavor(source).ast)

    expect(
      dashboard.assetExecutions.find((asset) => asset.subject === 'Asset:Equity:CN:600900'),
    ).toMatchObject({
      investedCost: { amount: 6560.55, currency: 'CNY' },
      targetAmount: { amount: 52500, currency: 'CNY' },
      status: 'building',
    })
    expect(dashboard.actionInbox.filter((item) => item.type === 'currency_mismatch')).toEqual([])
  })

  it('ranks actions by policy risk, exposure, and urgency', () => {
    const source = `2026-01-01 open Account:Crypto "Digital assets"
  target: 100%
  total: 100,000 USD

2026-01-02 open Asset:Crypto:BTC "Bitcoin"
  account: Account:Crypto
  target: 100%

2026-02-11 thesis Asset:Crypto:BTC "Digital reserve asset"
  status: Active
  review_by: 2026-05-11

2026-03-02 txn Asset:Crypto:BTC "First BTC tranche"
  Assets:Crypto:BTC       0.10 BTC @ 90,000 USD
  Assets:Cash:USD        -9,000 USD
`

    const dashboard = generateDashboard(parseNavor(source).ast, {
      today: '2026-06-01',
      drift: {
        baseCurrency: 'USD',
        totalMarketValue: { amount: 9000, currency: 'USD' },
        fxRates: {},
        unconvertedCurrencies: [],
        diagnostics: [],
        entries: [
          {
            subject: 'Asset:Crypto:BTC',
            title: 'Bitcoin',
            targetWeight: 25,
            actualWeight: 100,
            drift: 75,
            status: 'above_max',
            marketValue: { amount: 9000, currency: 'USD' },
            marketValueInBase: { amount: 9000, currency: 'USD' },
            planMin: 20,
            planMax: 30,
          },
        ],
      },
      priceStates: [
        {
          subject: 'Asset:Crypto:BTC',
          provider: 'Yahoo Finance',
          asOf: '2026-06-01',
          status: 'failed',
        },
      ],
    })

    expect(dashboard.actionInbox.map((item) => item.type)).toEqual([
      'failed_price',
      'above_max',
      'review_due',
    ])
    expect(dashboard.actionInbox[0]).toMatchObject({
      category: 'data_integrity',
      priorityScore: 999,
      reason: { kind: 'failed_price', impactPercent: 100 },
      impactAmount: { amount: 9000, currency: 'USD' },
      impactPercent: 100,
    })
    expect(dashboard.actionInbox[1]).toMatchObject({
      category: 'investment_risk',
      priorityScore: 958,
      reason: { kind: 'above_max', drift: 75, impactPercent: 100 },
    })
  })
})
