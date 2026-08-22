import { orderChronologically, orderReverseChronologically } from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('orderChronologically', () => {
  it('orders by date, then repository file, then source line', () => {
    const entries = [
      { date: '2026-07-02', file: 'plans.nav', line: 4, id: 'later-date' },
      { date: '2026-07-01', file: 'thesis.nav', line: 9, id: 'later-file' },
      { date: '2026-07-01', file: 'research.nav', line: 12, id: 'later-line' },
      { date: '2026-07-01', file: 'research.nav', line: 3, id: 'first' },
    ]

    expect(orderChronologically(entries).map((entry) => entry.id)).toEqual([
      'first',
      'later-line',
      'later-file',
      'later-date',
    ])
  })
})

describe('orderReverseChronologically', () => {
  it('orders newest entries first', () => {
    const entries = [
      { date: '2026-07-01', file: 'research.nav', line: 3, id: 'first' },
      { date: '2026-07-02', file: 'plans.nav', line: 4, id: 'later-date' },
    ]

    expect(orderReverseChronologically(entries).map((entry) => entry.id)).toEqual([
      'later-date',
      'first',
    ])
  })
})
