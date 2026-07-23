import { parseNavor } from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('validateNavorSemantics', () => {
  it('flags Assets that reference unknown Accounts', async () => {
    const { validateNavorSemantics } = await import('@navor/core')
    const parsed = parseNavor(`2026-01-01 open Asset:Crypto:BTC "Bitcoin"
  account: Account:Missing
`)

    expect(validateNavorSemantics(parsed.ast)).toEqual([
      {
        line: 1,
        message: 'Asset "Asset:Crypto:BTC" references unknown Account "Account:Missing".',
      },
    ])
  })

  it('flags plan directives that reference unknown assets', async () => {
    const { validateNavorSemantics } = await import('@navor/core')
    const parsed = parseNavor(`2026-01-03 plan Asset:Crypto:ETH "Missing asset"
  target: 10%
`)

    expect(validateNavorSemantics(parsed.ast)).toEqual([
      {
        line: 1,
        message: 'Plan references unknown Asset "Asset:Crypto:ETH".',
      },
    ])
  })

  it('allows Account funding transactions without matching Asset subjects', async () => {
    const { validateNavorSemantics } = await import('@navor/core')
    const parsed = parseNavor(`2026-01-01 open Account:Crypto "Crypto"

2026-01-01 txn Account:Crypto "Deploy Crypto cash"
  Assets:Cash:USD        500,000 USD
  Equity:Capital        -500,000 USD
`)

    expect(validateNavorSemantics(parsed.ast)).toEqual([])
  })

  it('rejects Account transactions that include asset holdings', async () => {
    const { validateNavorSemantics } = await import('@navor/core')
    const parsed = parseNavor(`2026-01-01 open Account:Crypto "Crypto"
2026-01-01 open Asset:Crypto:BTC "Bitcoin"
  account: Account:Crypto

2026-01-02 txn Account:Crypto "Buy BTC under account"
  Assets:Crypto:BTC       1 BTC @ 90,000 USD
  Assets:Cash:USD   -90,000 USD
`)

    expect(validateNavorSemantics(parsed.ast)).toEqual([
      {
        line: 5,
        message: 'Account transaction "Account:Crypto" must not include asset holdings.',
      },
    ])
  })

  it('rejects Asset funding that uses Equity:Capital without holdings', async () => {
    const { validateNavorSemantics } = await import('@navor/core')
    const parsed = parseNavor(`2026-01-01 open Asset:Crypto:BTC "Bitcoin"

2026-01-01 txn Asset:Crypto:BTC "Deploy cash on asset"
  Assets:Cash:USD        500,000 USD
  Equity:Capital        -500,000 USD
`)

    expect(validateNavorSemantics(parsed.ast)).toEqual([
      {
        line: 3,
        message:
          'Asset transaction "Asset:Crypto:BTC" must include a holding posting, or only Cash/Income/Expenses postings.',
      },
    ])
  })

  it('allows Asset dividend transactions with Cash and Income only', async () => {
    const { validateNavorSemantics } = await import('@navor/core')
    const parsed = parseNavor(`2026-01-01 open Asset:Equity:HK:0700 "Tencent"

2026-06-30 txn Asset:Equity:HK:0700 "Dividend"
  Assets:Cash:HKD             500 HKD
  Income:Dividend:0700       -500 HKD
`)

    expect(validateNavorSemantics(parsed.ast)).toEqual([])
  })

  it('keeps a decision without an execution record as a valid intent', async () => {
    const { validateNavorSemantics } = await import('@navor/core')
    const parsed = parseNavor(`2026-01-01 open Account:Crypto "Crypto"
2026-01-01 open Asset:Crypto:BTC "Bitcoin"
  account: Account:Crypto

2026-01-01 txn Account:Crypto "Deploy Crypto cash"
  Assets:Cash:USD        500,000 USD
  Equity:Capital        -500,000 USD

2026-03-01 decision Account:Crypto "Start accumulation"
2026-03-01 decision Asset:Crypto:BTC "Buy first tranche"
`)

    expect(validateNavorSemantics(parsed.ast)).toEqual([])
  })

  it('diagnoses ambiguous, future, and missing date-scoped references', async () => {
    const { validateNavorSemantics } = await import('@navor/core')
    const parsed = parseNavor(`2026-02-01 open Account:Crypto "Crypto"
2026-02-01 open Asset:Crypto:ETH "Ethereum"
  account: Account:Crypto
2026-02-05 research Asset:Crypto:ETH "First note"
2026-02-05 research Asset:Crypto:ETH "Second note"
2026-02-08 thesis Asset:Crypto:ETH "Build on weakness"
  based_on: 2026-02-05
2026-02-10 thesis Asset:Crypto:ETH "Later thesis"
2026-02-09 decision Asset:Crypto:ETH "Start DCA"
  based_on: 2026-02-10
2026-02-12 txn Asset:Crypto:ETH "First tranche"
  decision: 2026-02-11
  Assets:Crypto:ETH  1 ETH @ 2,000 USD
  Assets:Cash:USD    -2,000 USD
`)

    expect(validateNavorSemantics(parsed.ast)).toEqual([
      {
        line: 6,
        message: 'Thesis basis "2026-02-05" is ambiguous; add the referenced title.',
      },
      {
        line: 9,
        message: 'Decision basis "2026-02-10" references a later record.',
      },
      {
        line: 11,
        message:
          'Transaction decision "2026-02-11" does not resolve to a record of the expected type.',
      },
    ])
  })

  it('resolves a transaction to a same-subject decision by date', async () => {
    const { generatePortfolio } = await import('@navor/core')
    const parsed = parseNavor(`2026-02-09 decision Asset:Crypto:ETH "Start DCA"
2026-02-12 txn Asset:Crypto:ETH "First tranche"
  decision: 2026-02-09
  Assets:Crypto:ETH  1 ETH @ 2,000 USD
  Assets:Cash:USD    -2,000 USD
`)

    expect(generatePortfolio(parsed.ast).transactions[0]?.decisionReference).toMatchObject({
      status: 'resolved',
      target: { directive: 'decision', title: 'Start DCA' },
    })
  })

  it('requires a same-day reference to appear earlier in the workspace', async () => {
    const { validateNavorSemantics } = await import('@navor/core')
    const parsed = parseNavor(`2026-02-08 thesis Asset:Crypto:ETH "Build on weakness"
  based_on: 2026-02-08
2026-02-08 research Asset:Crypto:ETH "Later note"
`)

    expect(validateNavorSemantics(parsed.ast)).toEqual([
      {
        line: 1,
        message: 'Thesis basis "2026-02-08" references a later record.',
      },
    ])
  })

  it('diagnoses malformed references while retaining known legacy subject references', async () => {
    const { validateNavorSemantics } = await import('@navor/core')
    const parsed = parseNavor(`2026-02-01 open Asset:Crypto:ETH "Ethereum"
2026-02-05 thesis Asset:Crypto:ETH "Legacy basis"
  based_on: Asset:Crypto:ETH
2026-02-06 thesis Asset:Crypto:ETH "Malformed basis"
  based_on: 2026-2-5
`)

    expect(validateNavorSemantics(parsed.ast)).toEqual([
      {
        file: undefined,
        line: 4,
        message: 'Thesis basis "2026-2-5" does not resolve to a record of the expected type.',
      },
    ])
  })

  it('rejects Portfolio transaction subjects', async () => {
    const { validateNavorSemantics } = await import('@navor/core')
    const parsed = parseNavor(`2026-01-01 txn Portfolio:Example "Deploy capital"
  Assets:Cash:USD        100,000 USD
  Equity:Capital        -100,000 USD
`)

    expect(validateNavorSemantics(parsed.ast)).toEqual([
      {
        line: 1,
        message: 'Transaction subject "Portfolio:Example" must be an open Asset or Account.',
      },
    ])
  })
})
