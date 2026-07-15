import { readFileSync } from 'node:fs'

import { App } from '@navor/reader-ui'
import { compileNavorWorkspace } from '@navor/renderer'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

describe('Decisions Based on column', () => {
  it('does not fall back to the decision subject when basedOn is missing', async () => {
    const state = await compileNavorWorkspace('example', {
      fetchLivePrices: false,
      today: '2026-07-10',
    })
    const entry = state.knowledge.decisions.find((item) => item.title === 'Prepare cloud sleeve')

    expect(entry).toBeDefined()
    expect(entry?.basedOn).toBeNull()
    expect(entry?.subject).toBe('Asset:Equity:US:MSFT')

    const html = renderToStaticMarkup(<App initialView="decisions" state={state} />)
    const panelStart = html.lastIndexOf('>Decision ledger<')
    expect(panelStart).toBeGreaterThan(-1)
    const section = html.slice(panelStart, panelStart + 8000)

    expect(section).toContain('Prepare cloud sleeve')
    // Subject may appear as EntityCell title attr / meta, but not as the Based on cell value.
    expect(section).not.toMatch(
      />Prepare cloud sleeve<\/p>[\s\S]*?<\/td><td[^>]*>2026-01-22<\/td><td[^>]*>Buy<\/td><td[^>]*>10%<\/td><td[^>]*>Medium<\/td><td[^>]*>Asset:Equity:US:MSFT<\/td>/,
    )
  })

  it('renders n/a instead of subject when a decision has no based_on', () => {
    const source = readFileSync('packages/reader-ui/src/views/DecisionsView.tsx', 'utf8')

    expect(source).toMatch(/basis:\s*item\.basedOn \?\? ['"]n\/a['"]/)
    expect(source).not.toMatch(/basis:\s*item\.basedOn \?\? item\.subject/)
  })
})
