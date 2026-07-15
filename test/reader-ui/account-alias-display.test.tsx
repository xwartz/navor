import { readFileSync } from 'node:fs'

import { App } from '@navor/reader-ui'
import { compileNavorWorkspace } from '@navor/renderer'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

describe('Account alias display', () => {
  it('Watchlist account column shows aliases, not raw Account: subjects', async () => {
    const state = await compileNavorWorkspace('example', {
      fetchLivePrices: false,
      today: '2026-07-10',
    })

    expect(state.process.watchlist.some((item) => item.account === 'Account:US')).toBe(true)
    expect(state.allocation.accounts.some((account) => account.subject === 'Account:US')).toBe(true)
    expect(
      state.allocation.accounts.find((account) => account.subject === 'Account:US')?.title,
    ).toBe('美股账户')

    const html = renderToStaticMarkup(<App initialView="watchlist" state={state} />)

    expect(html).toContain('美股账户')
    expect(html).not.toMatch(/>Account:US</)
  })

  it('Positions by-account headers resolve aliases instead of raw Account: subjects', () => {
    const source = readFileSync('packages/reader-ui/src/views/PortfolioView.tsx', 'utf8')

    // Group headers must resolve the Map key through the entity label index, not dump it raw.
    expect(source).not.toMatch(/<h3 className="text-sm font-semibold text-ink">\{account\}<\/h3>/)
    expect(source).toMatch(/resolveEntityLabel\(labelIndex,\s*account\)/)
  })
})
