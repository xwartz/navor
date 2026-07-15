import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const PANEL = 'packages/reader-ui/src/components/AssetDetailPanel.tsx'
const DASHBOARD = 'packages/reader-ui/src/views/DashboardView.tsx'
const STYLES = 'packages/reader-ui/src/styles.css'

describe('Decision brief visual hierarchy', () => {
  it('keeps the selected queue row on the same paper surface as other rows', () => {
    const css = readFileSync(STYLES, 'utf8')
    const dashboard = readFileSync(DASHBOARD, 'utf8')

    expect(css).not.toMatch(/--color-paper-recessed:/)
    expect(dashboard).not.toMatch(/bg-paper-recessed/)
    expect(dashboard).toMatch(/selectedAssetSubject === item\.subject/)
  })

  it('keeps a compact severity label and a single row click target', () => {
    const dashboard = readFileSync(DASHBOARD, 'utf8')
    const panel = readFileSync(PANEL, 'utf8')

    expect(dashboard).toMatch(/flex shrink-0 items-center pt-0\.5/)
    expect(dashboard).toMatch(/text-\[10px\] font-semibold uppercase tracking-\[0\.04em\]/)
    expect(dashboard).toMatch(/aria-haspopup="dialog"/)
    expect(dashboard).toMatch(/onClick=\{\(\) => openAsset\(item\.subject\)\}/)
    expect(dashboard).not.toMatch(/<span aria-hidden>↗<\/span>/)
    expect(dashboard).not.toMatch(/Review policy/)
    expect(dashboard).not.toMatch(/actionDestination/)
    expect(dashboard).not.toMatch(/>\s*Collapse\s*\n/)
    expect(dashboard).not.toMatch(/flex-col items-end/)
    expect(panel).toMatch(/isCompact \? null/)
    expect(panel).not.toMatch(/Recommended next step/)
  })

  it('keeps only the non-redundant action context in each queue row', () => {
    const dashboard = readFileSync(DASHBOARD, 'utf8')

    expect(dashboard).toMatch(/\{t\('Priority'\)\} \{index \+ 1\}/)
    expect(dashboard).toMatch(/actionCategoryLabel\(item\.category\)/)
    expect(dashboard).not.toMatch(/\{item\.message\}/)
    expect(dashboard).toMatch(/>\s*\{formatDashboardActionReason\(item\.reason\)\}\s*</)
    expect(dashboard).not.toMatch(/Why now:/)
  })
})
