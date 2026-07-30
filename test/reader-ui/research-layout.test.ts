import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const RESEARCH = 'packages/reader-ui/src/views/ResearchView.tsx'

describe('Investment cases layout', () => {
  it('takes the reader directly from tabs to individual cases', () => {
    const source = readFileSync(RESEARCH, 'utf8')

    expect(source).not.toContain('SummaryStrip')
    expect(source).not.toContain('const reviewable')
    expect(source).toMatch(
      /key: 'case'[\s\S]*?key: 'thesis'[\s\S]*?key: 'decision'[\s\S]*?key: 'plan'[\s\S]*?key: 'review'[\s\S]*?key: 'actions'[\s\S]*?key: 'evidence'/,
    )
  })

  it('uses the full research content width for thesis and decision views', () => {
    const source = readFileSync(RESEARCH, 'utf8')

    expect(source).toContain(
      "{(activeTab === 'theses' || activeTab === 'decisions') && (\n        <section>",
    )
    expect(source).not.toContain('grid gap-5 xl:grid-cols-2')
  })

  it('keeps market and asset evidence as separate, non-overlapping research streams', () => {
    const source = readFileSync(RESEARCH, 'utf8')

    expect(source).toContain("{ id: 'market', label: 'Market evidence' }")
    expect(source).toContain("{ id: 'evidence', label: 'Asset evidence' }")
    expect(source).toContain("item.subject.startsWith('Market:')")
    expect(source).toContain("item.subject.startsWith('Asset:')")
    expect(source).toContain('rows={assetResearch.map((item) => ({')
  })
})
