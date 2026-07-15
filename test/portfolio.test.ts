import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  generatePortfolio,
  loadNavorWorkspace,
  parseNavor,
  validateNavorSemantics,
} from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('generatePortfolio', () => {
  it('aggregates Transactions into holdings, cash, income, and expenses', () => {
    const source = `2026-01-01 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US

2026-03-02 txn Asset:Equity:US:NVDA "First tranche"
  Assets:Equity:US:NVDA      10 NVDA @ 900 USD
  Assets:Cash:USD        -9,000 USD
  Expenses:Fee              1 USD

2026-06-20 txn Asset:Equity:US:NVDA "Trim after target exceeded"
  Assets:Equity:US:NVDA      -3 NVDA @ 1,250 USD
  Assets:Cash:USD          3,750 USD

2026-06-30 txn Asset:Equity:US:NVDA "Dividend"
  Assets:Cash:USD             50 USD
  Income:Dividend:NVDA       -50 USD
`

    const portfolio = generatePortfolio(parseNavor(source).ast)

    expect(portfolio.diagnostics).toEqual([])
    expect(portfolio.transactions).toEqual([
      {
        date: '2026-03-02',
        line: 4,
        postings: [
          {
            account: 'Assets:Equity:US:NVDA',
            commodity: 'NVDA',
            price: { amount: 900, currency: 'USD' },
            quantity: 10,
          },
          {
            account: 'Assets:Cash:USD',
            commodity: 'USD',
            price: null,
            quantity: -9000,
          },
          {
            account: 'Expenses:Fee',
            commodity: 'USD',
            price: null,
            quantity: 1,
          },
        ],
        subject: 'Asset:Equity:US:NVDA',
        title: 'First tranche',
      },
      {
        date: '2026-06-20',
        line: 9,
        postings: [
          {
            account: 'Assets:Equity:US:NVDA',
            commodity: 'NVDA',
            price: { amount: 1250, currency: 'USD' },
            quantity: -3,
          },
          {
            account: 'Assets:Cash:USD',
            commodity: 'USD',
            price: null,
            quantity: 3750,
          },
        ],
        subject: 'Asset:Equity:US:NVDA',
        title: 'Trim after target exceeded',
      },
      {
        date: '2026-06-30',
        line: 13,
        postings: [
          {
            account: 'Assets:Cash:USD',
            commodity: 'USD',
            price: null,
            quantity: 50,
          },
          {
            account: 'Income:Dividend:NVDA',
            commodity: 'USD',
            price: null,
            quantity: -50,
          },
        ],
        subject: 'Asset:Equity:US:NVDA',
        title: 'Dividend',
      },
    ])
    expect(portfolio.holdings).toEqual([
      {
        asset: 'Asset:Equity:US:NVDA',
        commodity: 'NVDA',
        quantity: 7,
        cost: { amount: 6300, currency: 'USD' },
      },
    ])
    expect(portfolio.realizedPnl).toEqual([
      {
        asset: 'Asset:Equity:US:NVDA',
        date: '2026-06-20',
        title: 'Trim after target exceeded',
        amount: { amount: 1050, currency: 'USD' },
      },
    ])
    expect(portfolio.cash).toEqual([{ currency: 'USD', amount: -5200 }])
    expect(portfolio.expenses).toEqual([{ account: 'Expenses:Fee', amount: 1, currency: 'USD' }])
    expect(portfolio.income).toEqual([
      { account: 'Income:Dividend:NVDA', amount: -50, currency: 'USD' },
    ])
  })

  it('processes Transactions by date across files regardless of path order', async () => {
    const root = await mkdtemp(join(tmpdir(), 'navor-portfolio-order-'))
    await writeFile(
      join(root, 'z-sells.nav'),
      `2026-01-01 open Asset:Crypto:BTC "Bitcoin"

2026-06-01 txn Asset:Crypto:BTC "Sell half"
  Assets:Crypto:BTC  -0.5 BTC @ 80,000 USD
  Assets:Cash:USD    40,000 USD
`,
    )
    await writeFile(
      join(root, 'a-buys.nav'),
      `2026-03-01 txn Asset:Crypto:BTC "Buy"
  Assets:Crypto:BTC   1 BTC @ 50,000 USD
  Assets:Cash:USD   -50,000 USD
`,
    )

    const workspace = await loadNavorWorkspace(root)
    const portfolio = generatePortfolio(workspace.ast)

    expect(portfolio.diagnostics).toEqual([])
    expect(portfolio.holdings).toEqual([
      {
        asset: 'Asset:Crypto:BTC',
        commodity: 'BTC',
        quantity: 0.5,
        cost: { amount: 25000, currency: 'USD' },
      },
    ])
    expect(portfolio.realizedPnl).toEqual([
      {
        asset: 'Asset:Crypto:BTC',
        date: '2026-06-01',
        title: 'Sell half',
        amount: { amount: 15000, currency: 'USD' },
      },
    ])
  })

  it('warns when Transactions reference unknown or closed Assets', () => {
    const source = `2026-01-01 open Asset:Crypto:BTC "Bitcoin"

2026-02-01 close Asset:Crypto:BTC "No longer managed"

2026-03-02 txn Asset:Crypto:ETH "Unknown asset buy"
  Assets:Crypto:ETH      1 ETH @ 3,000 USD
  Assets:Cash:USD   -3,000 USD

2026-04-01 txn Asset:Crypto:BTC "Closed asset buy"
  Assets:Crypto:BTC      0.1 BTC @ 90,000 USD
  Assets:Cash:USD   -9,000 USD
`

    const parsed = parseNavor(source)
    const portfolio = generatePortfolio(parsed.ast)

    expect(validateNavorSemantics(parsed.ast)).toEqual([
      {
        line: 5,
        message: 'Transaction references unknown Asset "Asset:Crypto:ETH".',
      },
    ])
    expect(portfolio.diagnostics).toEqual([
      {
        line: 9,
        message: 'Transaction appears after Asset "Asset:Crypto:BTC" was closed.',
      },
    ])
    expect(portfolio.realizedPnl).toEqual([])
  })

  it('processes same-day Transactions by file path and line order', async () => {
    const root = await mkdtemp(join(tmpdir(), 'navor-portfolio-same-day-'))
    await writeFile(
      join(root, 'a-first.nav'),
      `2026-01-01 open Asset:Crypto:BTC "Bitcoin"

2026-03-01 txn Asset:Crypto:BTC "Buy two"
  Assets:Crypto:BTC   2 BTC @ 50,000 USD
  Assets:Cash:USD   -100,000 USD
`,
    )
    await writeFile(
      join(root, 'b-second.nav'),
      `2026-03-01 txn Asset:Crypto:BTC "Sell one"
  Assets:Crypto:BTC  -1 BTC @ 80,000 USD
  Assets:Cash:USD    80,000 USD
`,
    )

    const workspace = await loadNavorWorkspace(root)
    const portfolio = generatePortfolio(workspace.ast)

    expect(portfolio.diagnostics).toEqual([])
    expect(portfolio.holdings).toEqual([
      {
        asset: 'Asset:Crypto:BTC',
        commodity: 'BTC',
        quantity: 1,
        cost: { amount: 50000, currency: 'USD' },
      },
    ])
    expect(portfolio.realizedPnl).toEqual([
      {
        asset: 'Asset:Crypto:BTC',
        date: '2026-03-01',
        title: 'Sell one',
        amount: { amount: 30000, currency: 'USD' },
      },
    ])
    expect(portfolio.cash).toEqual([{ currency: 'USD', amount: -20000 }])
  })

  it('applies partial fill and scales cash when a sell exceeds holdings', () => {
    const source = `2026-01-01 open Asset:Crypto:BTC "Bitcoin"

2026-03-01 txn Asset:Crypto:BTC "Buy three"
  Assets:Crypto:BTC   3 BTC @ 50,000 USD
  Assets:Cash:USD   -150,000 USD

2026-06-01 txn Asset:Crypto:BTC "Oversell attempt"
  Assets:Crypto:BTC  -5 BTC @ 80,000 USD
  Assets:Cash:USD   400,000 USD
`

    const portfolio = generatePortfolio(parseNavor(source).ast)

    expect(portfolio.diagnostics).toEqual([
      {
        line: 7,
        message: 'Sell quantity exceeds holdings for "Asset:Crypto:BTC". Applied partial fill.',
      },
    ])
    expect(portfolio.holdings).toEqual([])
    expect(portfolio.realizedPnl).toEqual([
      {
        asset: 'Asset:Crypto:BTC',
        date: '2026-06-01',
        title: 'Oversell attempt',
        amount: { amount: 90000, currency: 'USD' },
      },
    ])
    expect(portfolio.cash).toEqual([{ currency: 'USD', amount: 90000 }])
  })

  it('skips a sell Transaction with no holdings and leaves cash unchanged', () => {
    const source = `2026-01-01 open Asset:Crypto:BTC "Bitcoin"

2026-06-01 txn Asset:Crypto:BTC "Sell without holdings"
  Assets:Crypto:BTC  -1 BTC @ 80,000 USD
  Assets:Cash:USD    80,000 USD
`

    const portfolio = generatePortfolio(parseNavor(source).ast)

    expect(portfolio.diagnostics).toEqual([
      {
        line: 3,
        message: 'Sell exceeds holdings for "Asset:Crypto:BTC". Transaction skipped.',
      },
    ])
    expect(portfolio.holdings).toEqual([])
    expect(portfolio.realizedPnl).toEqual([])
    expect(portfolio.cash).toEqual([])
  })
})
