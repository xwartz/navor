import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const VIEW = 'packages/reader-ui/src/views/AllocationView.tsx'

describe('AllocationView information design', () => {
  it('owns target structure and does not duplicate Drift deviations', () => {
    const source = readFileSync(VIEW, 'utf8')

    expect(source).not.toMatch(/Allocation deviations/)
    expect(source).not.toMatch(/TargetActualList/)
    expect(source).not.toMatch(/state\.drift/)
    expect(source).toMatch(/Account targets/)
    expect(source).toMatch(/Asset targets/)
    expect(source).toMatch(/groupAssetsByAccount/)
    expect(source).toMatch(/derivedPortfolioWeight/)
  })

  it('groups assets in bordered account sections with shared DataTable chrome', () => {
    const source = readFileSync(VIEW, 'utf8')

    expect(source).toMatch(/overflow-hidden rounded-md border border-border bg-paper/)
    expect(source).toMatch(/border-b border-border bg-paper-elevated/)
    expect(source).toMatch(/<DataTable/)
    expect(source).toMatch(/Account target/)
    expect(source).toMatch(/Portfolio weight/)
    expect(source).toMatch(/Target amount/)
  })

  it('keeps multi-currency sleeve capital out of the SummaryStrip primary value', () => {
    const source = readFileSync(VIEW, 'utf8')

    expect(source).toMatch(/label: 'Target capital'/)
    expect(source).toMatch(/formatMoney\(state\.allocation\.capital\)/)
    expect(source).toMatch(
      /detail: formatMoneyList\(accounts\.map\(\(account\) => account\.baseAmount\)\)/,
    )
  })
})
