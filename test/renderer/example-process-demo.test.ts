import { compileNavorWorkspace } from '@navor/renderer'
import { describe, expect, it } from 'vitest'

describe('example workspace process demo data', () => {
  it('fills Watchlist, Research, Thesis, Decisions, Reviews, and Journal at demo density', async () => {
    const state = await compileNavorWorkspace('example', {
      fetchLivePrices: false,
      today: '2026-07-10',
    })

    expect(
      state.workspace.diagnostics.every((entry) =>
        entry.message.includes('has no matching Transaction yet'),
      ),
    ).toBe(true)
    expect(state.workspace.diagnostics.length).toBeGreaterThan(0)
    expect(state.process.watchlist.length).toBeGreaterThanOrEqual(4)
    expect(state.knowledge.research.length).toBeGreaterThanOrEqual(8)
    expect(state.knowledge.theses.length).toBeGreaterThanOrEqual(4)
    expect(state.knowledge.decisions.length).toBeGreaterThanOrEqual(6)
    expect(state.process.reviews.length).toBeGreaterThanOrEqual(5)
    expect(state.process.journal.length).toBeGreaterThanOrEqual(5)

    expect(state.knowledge.decisions.some((entry) => entry.basedOn)).toBe(true)
    expect(
      state.knowledge.theses.some(
        (thesis) => thesis.reviewBy !== null && thesis.reviewBy < '2026-07-10',
      ),
    ).toBe(true)
    expect(state.dashboard.pendingReviews.length).toBeGreaterThan(0)
  })
})
