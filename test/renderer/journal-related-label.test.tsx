import { App } from '@navor/reader-ui'
import { compileNavorWorkspace } from '@navor/renderer'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

describe('Journal related subject labels', () => {
  it('shows a human entity name instead of the raw related subject path', async () => {
    const state = await compileNavorWorkspace('fixtures/core', {
      today: '2026-07-08',
    })
    const html = renderToStaticMarkup(<App initialView="journal" state={state} />)

    expect(html).toContain('Felt FOMO after BTC breakout')
    expect(html).not.toContain('Related Asset:Crypto:BTC')
    expect(html).toContain('Related Bitcoin')
  })
})
