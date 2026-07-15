import type { PortfolioTransactionView } from '@navor/contract'
import { describe, expect, it } from 'vitest'

import { groupTransactionsByMonth } from '../../packages/reader-ui/src/transaction-ledger'

function txn(date: string, subject: string, line = 1): PortfolioTransactionView {
  return {
    date,
    subject,
    title: subject,
    line,
    postings: [],
  }
}

describe('groupTransactionsByMonth', () => {
  it('orders months and rows newest-first', () => {
    const groups = groupTransactionsByMonth([
      txn('2026-01-01', 'Account:Crypto'),
      txn('2026-01-30', 'Asset:Equity:US:MSTR'),
      txn('2026-01-09', 'Asset:Equity:US:MSTR'),
      txn('2026-02-06', 'Asset:Crypto:ETH'),
    ])

    expect(groups.map(([month]) => month)).toEqual(['2026-02', '2026-01'])
    expect(groups[1]?.[1].map((item) => item.date)).toEqual([
      '2026-01-30',
      '2026-01-09',
      '2026-01-01',
    ])
  })
})
