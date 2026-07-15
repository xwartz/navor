import { generateKnowledgeViews, parseNavor } from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('generateKnowledgeViews', () => {
  it('keeps Research, Thesis, and Decision traceable as distinct view models', () => {
    const source = `2026-02-10 research Asset:Crypto:BTC "ETF inflow remains strong"
  source: Market data
  reliability: Secondary
  tags: ETF,Flow
  ---
  Spot ETF inflow remains a structural source of demand.
  ---

2026-02-11 thesis Asset:Crypto:BTC "Digital reserve asset"
  horizon: 5y
  sentiment: Bullish
  confidence: High
  status: Active
  invalid_if: ETF flow reverses for 2 quarters
  review_by: 2026-05-11
  ---
  BTC is treated as the core reserve asset.
  ---

2026-03-01 decision Asset:Crypto:BTC "Start accumulation"
  action: Buy
  target_weight: 20%
  based_on: 2026-02-11
  confidence: High
`

    const views = generateKnowledgeViews(parseNavor(source).ast, { today: '2026-04-01' })

    expect(views.diagnostics).toEqual([])
    expect(views.research).toEqual([
      {
        date: '2026-02-10',
        subject: 'Asset:Crypto:BTC',
        title: 'ETF inflow remains strong',
        source: 'Market data',
        reliability: 'Secondary',
        tags: ['ETF', 'Flow'],
        body: 'Spot ETF inflow remains a structural source of demand.',
      },
    ])
    expect(views.theses).toEqual([
      {
        date: '2026-02-11',
        subject: 'Asset:Crypto:BTC',
        title: 'Digital reserve asset',
        horizon: '5y',
        sentiment: 'Bullish',
        confidence: 'High',
        status: 'Active',
        invalidIf: 'ETF flow reverses for 2 quarters',
        reviewBy: '2026-05-11',
        body: 'BTC is treated as the core reserve asset.',
      },
    ])
    expect(views.decisions).toEqual([
      {
        date: '2026-03-01',
        subject: 'Asset:Crypto:BTC',
        title: 'Start accumulation',
        action: 'Buy',
        targetWeight: '20%',
        basedOn: '2026-02-11',
        confidence: 'High',
      },
    ])
  })

  it('warns when an active Thesis is past its review date', () => {
    const source = `2026-02-11 thesis Asset:Crypto:BTC "Digital reserve asset"
  status: Active
  review_by: 2026-05-11
`

    const views = generateKnowledgeViews(parseNavor(source).ast, { today: '2026-06-01' })

    expect(views.diagnostics).toEqual([
      {
        line: 1,
        message: 'Thesis "Digital reserve asset" is past review_by 2026-05-11.',
      },
    ])
  })
})
