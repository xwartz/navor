import { buildAssetNarrativeIndex } from '@navor/reader-ui'
import { compileNavorWorkspace } from '@navor/renderer'
import { describe, expect, it } from 'vitest'

import { buildCommandItems, filterCommandItems } from '../../packages/reader-ui/src/command-palette'

async function loadItems() {
  const state = await compileNavorWorkspace('fixtures/core', {
    fetchLivePrices: false,
    today: '2026-07-08',
  })
  const index = buildAssetNarrativeIndex(state)
  return buildCommandItems(state, (subject) => index.has(subject))
}

describe('command palette', () => {
  it('shows sidebar destinations and a few assets before the user types', async () => {
    const results = filterCommandItems(await loadItems(), '')
    const destinations = results.filter((item) => item.group === 'Go to')

    expect(destinations.map((item) => item.target)).toEqual([
      { kind: 'route', route: 'briefing' },
      { kind: 'route', route: 'portfolio' },
      { kind: 'route', route: 'ledger' },
      { kind: 'route', route: 'cases' },
      { kind: 'route', route: 'reviews' },
      { kind: 'route', route: 'health' },
    ])
    expect(results.filter((item) => item.group === 'Assets').length).toBeLessThanOrEqual(5)
    expect(results.some((item) => item.group === 'Records')).toBe(false)
  })

  it('reaches section tabs and opens assets from a query', async () => {
    const items = await loadItems()

    expect(filterCommandItems(items, 'plans')[0]?.target).toEqual({
      kind: 'route',
      route: 'portfolio/plans',
    })
    expect(filterCommandItems(items, 'theses')[0]?.target).toEqual({
      kind: 'route',
      route: 'cases/theses',
    })
    expect(
      filterCommandItems(items, 'btc').find((item) => item.group === 'Assets')?.target,
    ).toEqual({ kind: 'asset', subject: 'Asset:Crypto:BTC' })
  })

  it('requires every query token and keeps groups in a stable order', async () => {
    const items = await loadItems()
    const results = filterCommandItems(items, 'port alloc')
    const groups = results.map((item) => item.group)

    expect(results[0]?.target).toEqual({ kind: 'route', route: 'portfolio/allocation' })
    expect(groups).toEqual([...groups].sort((a, b) => order(a) - order(b)))
    expect(filterCommandItems(items, 'zzzz-no-match')).toEqual([])
  })
})

function order(group: string) {
  return ['Go to', 'Assets', 'Records'].indexOf(group)
}
