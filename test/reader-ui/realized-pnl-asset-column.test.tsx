import { readFileSync } from 'node:fs'

import { App } from '@navor/reader-ui'
import { compileNavorWorkspace } from '@navor/renderer'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

describe('Ledger Realized PnL asset column', () => {
  it('keeps realized PnL out of current holdings', async () => {
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
    expect(html).not.toContain('周线 RSI 超买，减仓 GOOGL')
    expect(html).not.toContain('>Realized PnL<')
  })

  it('does not pass realized PnL transaction title into the Ledger Asset EntityCell', () => {
    const source = readFileSync('packages/reader-ui/src/views/TransactionsView.tsx', 'utf8')
    const tableStart = source.indexOf('title="Realized PnL"')
    const tableEnd = source.indexOf('function CashAndFlows', tableStart)
    const realizedBlock = source.slice(tableStart, tableEnd)

    expect(realizedBlock).toMatch(/<EntityCell[\s\S]*?subject=\{entry\.asset\}/)
    expect(realizedBlock).not.toMatch(/subject=\{entry\.asset\}\s+title=\{entry\.title\}/)
    expect(realizedBlock).not.toMatch(/title=\{entry\.title\}\s+subject=\{entry\.asset\}/)
  })
})
