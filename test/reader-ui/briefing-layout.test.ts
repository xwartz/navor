import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const DASHBOARD = 'packages/reader-ui/src/views/DashboardView.tsx'

describe('Briefing column layout', () => {
  it('shows realized and unrealized PnL as separate briefing metrics', () => {
    const source = readFileSync(DASHBOARD, 'utf8')

    expect(source).toContain("label: 'Unrealized PnL'")
    expect(source).toContain("label: 'Realized PnL'")
    expect(source).toContain("detailLabel: 'Open positions'")
    expect(source).toContain("detailLabel: 'Closed positions'")
    expect(source).not.toContain("t('Total PnL')")
  })

  it('folds target-range breaches into the open-actions metric', () => {
    const source = readFileSync(DASHBOARD, 'utf8')

    expect(source).toContain('formatTargetBreachCount(offTrackAssets.length)')
    expect(source).not.toContain("t('Target-range breaches')")
  })

  it('leads the primary column with the decision queue', () => {
    const source = readFileSync(DASHBOARD, 'utf8')

    expect(source).toContain('@5xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] @5xl:items-start')
    expect(source).toMatch(
      /<div className="space-y-5">\s*<DecisionQueue[\s\S]*?title="Allocation posture"/,
    )
    expect(source).toMatch(
      /<div className="space-y-5">\s*<LargestPositions[\s\S]*?title="Liquidity"/,
    )
    expect(source).not.toContain('xl:row-start-')
  })
})
