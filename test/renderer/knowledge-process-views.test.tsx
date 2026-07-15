import { App } from '@navor/reader-ui'
import { compileNavorWorkspace } from '@navor/renderer'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

describe('Reader App knowledge and process views', () => {
  it('renders knowledge, process, market, and filtered views from compiled app state', async () => {
    const state = await compileNavorWorkspace('fixtures/core', {
      today: '2026-07-08',
      prices: [
        {
          subject: 'Asset:Crypto:BTC',
          price: { amount: 100000, currency: 'USD' },
          provider: 'Fixture',
          asOf: '2026-07-08T00:00:00Z',
        },
      ],
    })
    const filters = { subject: 'Asset:Crypto:BTC', tag: 'ETF', date: '2026-02' }

    const researchHtml = renderToStaticMarkup(
      <App filters={filters} initialView="research" state={state} />,
    )
    const thesisHtml = renderToStaticMarkup(
      <App filters={filters} initialView="thesis" state={state} />,
    )
    const decisionsHtml = renderToStaticMarkup(
      <App filters={filters} initialView="decisions" state={state} />,
    )
    const reviewsHtml = renderToStaticMarkup(
      <App filters={filters} initialView="reviews" state={state} />,
    )
    const journalHtml = renderToStaticMarkup(
      <App filters={filters} initialView="journal" state={state} />,
    )
    const marketHtml = renderToStaticMarkup(
      <App filters={filters} initialView="market-data" state={state} />,
    )

    expect(researchHtml).toContain('ETF inflow remains strong')
    expect(thesisHtml).toContain('Digital reserve asset')
    expect(decisionsHtml).toContain('Start accumulation')
    expect(reviewsHtml).toContain('Quarterly crypto review')
    expect(journalHtml).toContain('Felt FOMO after BTC breakout')
    expect(marketHtml).toContain('ETF flow remains positive')
    expect(researchHtml).not.toContain('Apple')
  })
})
