import type { PortfolioTransactionView } from '@navor/contract'
import { describe, expect, it } from 'vitest'

import { transactionType } from '../../packages/reader-ui/src/transaction-type'

function txn(
  title: string,
  postings: PortfolioTransactionView['postings'],
): PortfolioTransactionView {
  return {
    date: '2026-01-01',
    subject: 'Asset:Example',
    title,
    line: 1,
    postings,
  }
}

describe('transactionType', () => {
  it('labels buys with commission fees as Buy, not Fee', () => {
    expect(
      transactionType(
        txn('买入恒科', [
          {
            account: 'Assets:Equity:CN:513130',
            quantity: 10000,
            commodity: '513130.SS',
            price: null,
          },
          { account: 'Assets:Cash:CNY', quantity: -6005, commodity: 'CNY', price: null },
          { account: 'Expenses:Fee', quantity: 5, commodity: 'CNY', price: null },
        ]),
      ),
    ).toBe('Buy')
  })

  it('labels open-position buys as Buy even when cash leaves the account', () => {
    expect(
      transactionType(
        txn('建仓 PEPE', [
          {
            account: 'Assets:Crypto:PEPE',
            quantity: 168_390_900.8024,
            commodity: 'PEPE',
            price: { amount: 0.000002374, currency: 'USD' },
          },
          { account: 'Assets:Cash:USD', quantity: -400, commodity: 'USD', price: null },
        ]),
      ),
    ).toBe('Buy')
  })

  it('labels fee-only cash movements as Fee', () => {
    expect(
      transactionType(
        txn('Platform fee', [
          { account: 'Expenses:Fee', quantity: 5, commodity: 'USD', price: null },
          { account: 'Assets:Cash:USD', quantity: -5, commodity: 'USD', price: null },
        ]),
      ),
    ).toBe('Fee')
  })

  it('labels asset reductions as Sell', () => {
    expect(
      transactionType(
        txn('Trim BTC', [
          { account: 'Assets:Crypto:BTC', quantity: -0.1, commodity: 'BTC', price: null },
          { account: 'Assets:Cash:USD', quantity: 9000, commodity: 'USD', price: null },
        ]),
      ),
    ).toBe('Sell')
  })
})
