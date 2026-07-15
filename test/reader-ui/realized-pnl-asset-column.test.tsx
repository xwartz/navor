import { readFileSync } from 'node:fs'

import { App } from '@navor/reader-ui'
import { compileNavorWorkspace } from '@navor/renderer'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

describe('Holdings Realized PnL asset column', () => {
  it('shows the asset identity in Asset, not the transaction narrative', async () => {
    const state = await compileNavorWorkspace('example', {
      fetchLivePrices: false,
      today: '2026-07-10',
    })
    const entry = state.portfolio.realizedPnl.find(
      (item) => item.asset === 'Asset:Equity:US:GOOGL' && item.title?.includes('减仓 GOOGL'),
    )

    expect(entry).toBeDefined()
    expect(entry?.title).toBe('周线 RSI 超买，减仓 GOOGL')

    const html = renderToStaticMarkup(<App initialView="holdings" state={state} />)
    const panelStart = html.lastIndexOf('>Realized PnL<')
    expect(panelStart).toBeGreaterThan(-1)
    const realizedSection = html.slice(panelStart, panelStart + 6000)

    // Transaction column still carries the narrative.
    expect(realizedSection).toContain('周线 RSI 超买，减仓 GOOGL')

    // Asset EntityCell must not lead with that narrative (subject title attr + primary line).
    expect(realizedSection).not.toMatch(
      /data-asset-subject="Asset:Equity:US:GOOGL"[^>]*>\s*<p class="font-medium text-ink">周线 RSI 超买，减仓 GOOGL<\/p>/,
    )
    expect(realizedSection).toMatch(
      /data-asset-subject="Asset:Equity:US:GOOGL"[^>]*>\s*<p class="font-medium text-ink">Alphabet<\/p>/,
    )
  })

  it('does not pass realized PnL transaction title into the Asset EntityCell', () => {
    const source = readFileSync('packages/reader-ui/src/views/PortfolioView.tsx', 'utf8')
    const tableStart = source.indexOf('title="Realized PnL"')
    const tableEnd = source.indexOf('title="Cash"', tableStart)
    const realizedBlock = source.slice(tableStart, tableEnd)

    expect(realizedBlock).toMatch(/<EntityCell[\s\S]*?subject=\{entry\.asset\}/)
    expect(realizedBlock).not.toMatch(/subject=\{entry\.asset\}\s+title=\{entry\.title\}/)
    expect(realizedBlock).not.toMatch(/title=\{entry\.title\}\s+subject=\{entry\.asset\}/)
  })
})
