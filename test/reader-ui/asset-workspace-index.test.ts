import { buildAssetNarrativeIndex } from '@navor/reader-ui'
import { compileNavorWorkspace } from '@navor/renderer'
import { describe, expect, it } from 'vitest'

describe('Asset narrative', () => {
  it('concentrates Asset facts and chronology behind one subject lookup', async () => {
    const state = await compileNavorWorkspace('fixtures/core', {
      fetchLivePrices: false,
      today: '2026-07-08',
    })
    const index = buildAssetNarrativeIndex(state)
    const facts = index.get('Asset:Crypto:BTC')

    expect(index.has('Asset:Crypto:BTC')).toBe(true)
    expect(index.has('Account:Crypto')).toBe(false)
    expect(facts).toMatchObject({
      allocation: { subject: 'Asset:Crypto:BTC' },
      execution: { subject: 'Asset:Crypto:BTC' },
      holding: { asset: 'Asset:Crypto:BTC' },
      plan: { subject: 'Asset:Crypto:BTC' },
      priceStatus: { subject: 'Asset:Crypto:BTC' },
    })
    expect(facts?.transactions).toEqual(expect.any(Array))
    expect(facts?.contextTimeline.map((item) => item.date)).toEqual(
      [...(facts?.contextTimeline ?? [])]
        .map((item) => item.date)
        .sort()
        .reverse(),
    )
  })
})
