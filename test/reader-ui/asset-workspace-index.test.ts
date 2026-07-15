import { buildAssetWorkspaceIndex } from '@navor/reader-ui'
import { compileNavorWorkspace } from '@navor/renderer'
import { describe, expect, it } from 'vitest'

describe('Asset workspace index', () => {
  it('concentrates Asset facts behind one subject lookup', async () => {
    const state = await compileNavorWorkspace('fixtures/core', {
      fetchLivePrices: false,
      today: '2026-07-08',
    })
    const index = buildAssetWorkspaceIndex(state)
    const facts = index.get('Asset:Crypto:BTC')

    expect(index.has('Asset:Crypto:BTC')).toBe(true)
    expect(index.has('Account:Crypto')).toBe(false)
    expect(facts).toMatchObject({
      execution: { subject: 'Asset:Crypto:BTC' },
      holding: { asset: 'Asset:Crypto:BTC' },
      policy: { subject: 'Asset:Crypto:BTC' },
    })
  })
})
