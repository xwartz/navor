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
        subject: 'Asset:Equity:US:NVDA',
        title: 'NVDA target',
        target: 10,
        min: 15,
        max: 5,
        minAmount: null,
        maxAmount: null,
        rebalance: null,
        actionWhenBelow: null,
        actionWhenAbove: null,
        body: null,
      },
      {
        date: '2026-01-03',
        subject: 'Asset:Crypto:BTC',
        title: 'Bitcoin target',
        target: 25,
        min: 20,
        max: 30,
        minAmount: null,
        maxAmount: null,
        rebalance: 'quarterly',
        actionWhenBelow: null,
        actionWhenAbove: null,
        body: null,
      },
    ])
    expect(plan.diagnostics).toEqual([
      {
        code: 'NAV400',
        line: 7,
        message: 'Plan "Asset:Equity:US:NVDA" has min 15% above max 5%.',
      },
    ])
  })

  it('parses money caps and plan bodies', () => {
    const source = `2026-08-22 plan Asset:Crypto:Automated:BTC "BTC 1D 超卖分批补仓"
  target: 46%
  max: 115,000 USDT
  rebalance: Daily
  action_when_below: RKI 1D stage < -1，分 5–10 次买入，每批约 10,100–20,200 USDT
  action_when_above: 累计投入达 115,000 USDT 或 1D 超卖窗口关闭时停止买入
  ---
  依据 2026-08-22 research 补全缺口；建议中位 7 批、每批约 14,400 USDT。
  ---
`

    const plan = generatePlanViews(parseNavor(source).ast)

    expect(plan.entries).toEqual([
      {
        date: '2026-08-22',
        subject: 'Asset:Crypto:Automated:BTC',
        title: 'BTC 1D 超卖分批补仓',
        target: 46,
        min: null,
        max: null,
        minAmount: null,
        maxAmount: { amount: 115_000, currency: 'USDT' },
        rebalance: 'Daily',
        actionWhenBelow: 'RKI 1D stage < -1，分 5–10 次买入，每批约 10,100–20,200 USDT',
        actionWhenAbove: '累计投入达 115,000 USDT 或 1D 超卖窗口关闭时停止买入',
        body: '依据 2026-08-22 research 补全缺口；建议中位 7 批、每批约 14,400 USDT。',
      },
    ])
  })
})
