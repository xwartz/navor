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

  it('does not treat Account funding as execution of an Account decision', async () => {
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

    expect(validateNavorSemantics(parsed.ast)).toEqual([
      {
        line: 10,
        message: 'Decision "Buy first tranche" has no matching Transaction yet.',
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
