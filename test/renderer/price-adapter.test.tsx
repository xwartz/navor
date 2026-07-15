import type { PriceAdapter } from '@navor/adapters'
import { App, renderNavorReaderHtml } from '@navor/reader-ui'
import { compileNavorWorkspace } from '@navor/renderer'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

describe('Price Adapter enrichment', () => {
  it('records fresh, stale, missing, and failed enrichment without blocking source rendering', async () => {
    const adapter: PriceAdapter = {
      name: 'FixtureAdapter',
      async fetchPrices(subjects) {
        expect(subjects).toContain('Asset:Crypto:BTC')

        return {
          prices: [
            {
              subject: 'Asset:Crypto:BTC',
              price: { amount: 100000, currency: 'USD' },
              provider: 'FixtureAdapter',
              asOf: '2026-06-01T00:00:00Z',
            },
          ],
          failures: [
            {
              subject: 'Asset:Equity:US:NVDA',
              provider: 'FixtureAdapter',
              message: 'rate limited',
            },
          ],
        }
      },
    }

    const state = await compileNavorWorkspace('fixtures/core', {
      today: '2026-07-08',
      stalePriceAfterDays: 7,
      priceAdapter: adapter,
    })

    expect(state.enrichment.prices).toEqual(
      expect.arrayContaining([
        {
          subject: 'Asset:Crypto:BTC',
          provider: 'FixtureAdapter',
          asOf: '2026-06-01T00:00:00Z',
          status: 'stale',
        },
        {
          subject: 'Asset:Equity:US:NVDA',
          provider: 'FixtureAdapter',
          asOf: null,
          status: 'failed',
          message: 'rate limited',
        },
        {
          subject: 'Asset:Equity:US:AAPL',
          provider: null,
          asOf: null,
          status: 'missing',
        },
      ]),
    )

    const html = renderNavorReaderHtml(state)
    const marketHtml = renderToStaticMarkup(<App initialView="market-data" state={state} />)

    expect(html).toContain('Asset:Crypto:BTC')
    expect(marketHtml).toContain('stale')
    expect(marketHtml).toContain('failed')
    expect(marketHtml).toContain('missing')
  })
})
