import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const DASHBOARD = 'packages/reader-ui/src/views/DashboardView.tsx'

describe('Briefing column layout', () => {
  it('keeps the desktop columns as independent vertical flows', () => {
    const source = readFileSync(DASHBOARD, 'utf8')

    expect(source).toContain('xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:items-start')
    expect(source).toContain('<div className="order-first space-y-5 xl:order-last">')
    expect(source).toContain(
      '<LargestPositions onOpenAsset={openAsset} positions={topPositions} />',
    )
    expect(source).toMatch(
      /<div className="space-y-5">\s*<Panel[\s\S]*?title="Allocation posture"[\s\S]*?title="Liquidity"/,
    )
    expect(source).not.toContain('xl:row-start-')
    expect(source).not.toContain('<div className="contents">')
  })
})
