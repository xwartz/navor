import { generatePlanViews, parseNavor } from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('generatePlanViews', () => {
  it('parses plan directives into structured entries and validates min/max bands', () => {
    const source = `2026-01-03 plan Asset:Crypto:BTC "Bitcoin target"
  target: 25%
  min: 20%
  max: 30%
  rebalance: quarterly

2026-01-03 plan Asset:Equity:US:NVDA "NVDA target"
  target: 10%
  min: 15%
  max: 5%
`

    const plan = generatePlanViews(parseNavor(source).ast)

    expect(plan.entries).toEqual([
      {
        date: '2026-01-03',
        subject: 'Asset:Crypto:BTC',
        title: 'Bitcoin target',
        target: 25,
        min: 20,
        max: 30,
        rebalance: 'quarterly',
        actionWhenBelow: null,
        actionWhenAbove: null,
      },
      {
        date: '2026-01-03',
        subject: 'Asset:Equity:US:NVDA',
        title: 'NVDA target',
        target: 10,
        min: 15,
        max: 5,
        rebalance: null,
        actionWhenBelow: null,
        actionWhenAbove: null,
      },
    ])
    expect(plan.diagnostics).toEqual([
      {
        line: 7,
        message: 'Plan "Asset:Equity:US:NVDA" has min 15% above max 5%.',
      },
    ])
  })
})
