import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const VIEW = 'packages/reader-ui/src/views/DriftView.tsx'

describe('DriftView information design', () => {
  it('leads with a center-zero diverging drift bar instead of absolute-weight bullets', () => {
    const source = readFileSync(VIEW, 'utf8')

    expect(source).not.toMatch(/Weight pressure/)
    expect(source).not.toMatch(/HorizontalBarChart/)
    expect(source).not.toMatch(/BulletChart/)
    expect(source).not.toMatch(/StatusBadge/)
    expect(source).toMatch(/DivergingDriftBar/)
    expect(source).toMatch(/Distance from target/)
    expect(source).toMatch(/formatSignedPercent/)
    expect(source).toMatch(/Math\.abs\(right\.drift/)
    expect(source).toMatch(/maxAbsDrift/)
  })

  it('keeps actual → target as secondary copy under the asset', () => {
    const source = readFileSync(VIEW, 'utf8')

    expect(source).toMatch(/formatPercent\(entry\.actualWeight\)/)
    expect(source).toMatch(/formatPercent\(entry\.targetWeight\)/)
    expect(source).toMatch(/offBand \? \(/)
    expect(source).toMatch(/driftStatusLabel\(entry\.status\)/)
  })

  it('balances Asset and Value around a fixed narrow Drift column', () => {
    const source = readFileSync(VIEW, 'utf8')

    expect(source).toMatch(/grid-cols-\[minmax\(0,1fr\)_11rem_minmax\(8rem,1fr\)\]/)
    expect(source).toMatch(/hidden grid-cols-\[minmax\(0,1fr\)_11rem_minmax\(8rem,1fr\)\].*lg:grid/)
    expect(source).toMatch(/grid-cols-1 gap-2 py-2\.5 lg:grid-cols-/)
    expect(source).toMatch(/gap-x-8/)
    expect(source).toMatch(/w-24 shrink-0 rounded-full bg-paper/)
    expect(source).not.toMatch(/minmax\(0,1\.35fr\)/)
    expect(source).not.toMatch(/_5\.75rem\]/)
    expect(source).not.toMatch(/min-w-0 flex-1 rounded-full bg-paper/)
  })
})
