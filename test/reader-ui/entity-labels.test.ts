import { describe, expect, it } from 'vitest'

import {
  buildEntityLabelIndex,
  entityMetaLine,
  formatSubjectSublabel,
  readableEntityTitle,
  shortSubjectLabel,
} from '../../packages/reader-ui/src/entity-labels'

describe('entityMetaLine', () => {
  it('shows symbol when it differs from the display title', () => {
    expect(
      entityMetaLine({
        subject: 'Asset:Crypto:PEPE',
        title: 'Pepe',
        symbol: 'PEPE',
      }),
    ).toBe('PEPE')
  })

  it('shows a short ticker when symbol equals title', () => {
    expect(
      entityMetaLine({
        subject: 'Asset:Crypto:BNB',
        title: 'BNB',
        symbol: 'BNB',
      }),
    ).toBe('BNB')
  })

  it('does not show redundant meta when subject and title already match', () => {
    expect(
      entityMetaLine({
        subject: 'Asset:Crypto:BNB',
        title: 'Asset:Crypto:BNB',
        symbol: null,
      }),
    ).toBeNull()
  })
})

describe('shortSubjectLabel', () => {
  it('returns the leaf segment for asset subjects', () => {
    expect(shortSubjectLabel('Asset:Crypto:BNB')).toBe('BNB')
  })
})

describe('readableEntityTitle', () => {
  it('never exposes an internal asset subject as visible fallback text', () => {
    expect(readableEntityTitle(null, 'Asset:Crypto:BTC', 'Asset:Crypto:BTC')).toBe('BTC')
  })

  it('prefers the registered asset name over its internal subject', () => {
    expect(
      readableEntityTitle(
        { subject: 'Asset:Equity:CN:600036', title: '招商银行', symbol: '600036.SS' },
        'Asset:Equity:CN:600036',
      ),
    ).toBe('招商银行')
  })
})

describe('formatSubjectSublabel', () => {
  it('returns ticker for asset chart rows', () => {
    const index = buildEntityLabelIndex({
      allocation: { assets: [], accounts: [], diagnostics: [] },
      dashboard: { assetExecutions: [], accountExecutions: [], actionInbox: [] },
      drift: {
        entries: [
          {
            subject: 'Asset:Crypto:BTC',
            title: 'Bitcoin',
            targetWeight: 0.23,
            actualWeight: 0.495,
            drift: 0.265,
            status: 'above_max',
          },
        ],
        baseCurrency: 'USD',
        fxRates: {},
        totalMarketValue: { amount: 100, currency: 'USD' },
        diagnostics: [],
        unconvertedCurrencies: [],
      },
      market: { portfolioValues: [], prices: [] },
      portfolio: { holdings: [], cash: [], realizedPnl: [] },
      priceManifest: { entries: [{ subject: 'Asset:Crypto:BTC', symbol: 'BTC' }] },
      process: { watchlist: [] },
    } as never)

    expect(formatSubjectSublabel(index, 'Asset:Crypto:BTC')).toBe('BTC')
    expect(formatSubjectSublabel(index, 'Asset:Equity:HK:0700')).toBe('0700')
  })
})
