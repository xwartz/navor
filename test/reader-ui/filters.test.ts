import { describe, expect, it } from 'vitest'

import { matchesFilters } from '../../packages/reader-ui/src/filters'

describe('Reader filters', () => {
  const transaction = {
    date: '2026-07-29',
    subject: 'Asset:Crypto:BTC',
    postings: [{ account: 'Account:Crypto' }],
  }

  it('matches ledger dates and posting accounts through their explicit fields', () => {
    expect(matchesFilters(transaction, { date: '2026-07' })).toBe(true)
    expect(matchesFilters(transaction, { date: '2026-06' })).toBe(false)
    expect(matchesFilters(transaction, { account: 'Account:Crypto' })).toBe(true)
    expect(matchesFilters(transaction, { account: 'Account:Brokerage' })).toBe(false)
  })

  it('does not let a status chip fall back to unrelated copy', () => {
    expect(matchesFilters({ status: 'fresh', message: 'stale quote' }, { status: 'fresh' })).toBe(
      true,
    )
    expect(matchesFilters({ status: 'fresh', message: 'stale quote' }, { status: 'stale' })).toBe(
      false,
    )
  })
})
