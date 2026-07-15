import { generateProcessViews, parseNavor } from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('generateProcessViews', () => {
  it('generates Watchlist, Review, and Journal views from process facts', () => {
    const source = `2026-01-02 open Asset:Equity:US:AAPL "Apple"
  account: Account:US
  status: Watch
  watch_reason: Valuation compression

2026-07-01 review Account:US "Quarterly US account review"
  status: On Track
  action: Hold
  drift: +4.2%
  ---
  NVDA exceeded target but thesis remains intact.
  ---

2026-07-08 journal Portfolio:Core "Felt FOMO after BTC breakout"
  mood: FOMO
  related: Asset:Crypto:BTC
  ---
  Waiting for the planned review prevented an impulsive buy.
  ---

2026-07-09 note Asset:Crypto:BTC "MA200 observation"
  ---
  Nothing changed fundamentally.
  ---
`

    const views = generateProcessViews(parseNavor(source).ast)

    expect(views.watchlist).toEqual([
      {
        subject: 'Asset:Equity:US:AAPL',
        title: 'Apple',
        account: 'Account:US',
        watchReason: 'Valuation compression',
      },
    ])
    expect(views.reviews).toEqual([
      {
        date: '2026-07-01',
        subject: 'Account:US',
        title: 'Quarterly US account review',
        status: 'On Track',
        action: 'Hold',
        drift: '+4.2%',
        body: 'NVDA exceeded target but thesis remains intact.',
      },
    ])
    expect(views.journal).toEqual([
      {
        date: '2026-07-08',
        directive: 'journal',
        subject: 'Portfolio:Core',
        title: 'Felt FOMO after BTC breakout',
        mood: 'FOMO',
        related: 'Asset:Crypto:BTC',
        body: 'Waiting for the planned review prevented an impulsive buy.',
      },
      {
        date: '2026-07-09',
        directive: 'note',
        subject: 'Asset:Crypto:BTC',
        title: 'MA200 observation',
        mood: null,
        related: null,
        body: 'Nothing changed fundamentally.',
      },
    ])
  })
})
