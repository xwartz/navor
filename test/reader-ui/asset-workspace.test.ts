import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const WORKSPACE = 'packages/reader-ui/src/AssetWorkspaceProvider.tsx'
const PANEL = 'packages/reader-ui/src/components/AssetWorkspacePanel.tsx'
const SCAFFOLD = 'packages/reader-ui/src/components/ViewScaffold.tsx'

describe('shared asset workspace', () => {
  it('persists the selected asset in the URL and restores focus on close', () => {
    const source = readFileSync(WORKSPACE, 'utf8')

    expect(source).toMatch(/searchParams\.get\('asset'\)/)
    expect(source).toMatch(/searchParams\.set\('asset', subject\)/)
    expect(source).toMatch(/searchParams\.delete\('asset'\)/)
    expect(source).toMatch(/returnFocusRef\.current\.focus\(\{ preventScroll: true \}\)/)
    expect(source).toMatch(/data-asset-subject/)
  })

  it('supports Escape, focus trapping, and view-preserving asset links', () => {
    const source = readFileSync(PANEL, 'utf8')

    expect(source).toMatch(/event\.key === 'Escape'/)
    expect(source).not.toMatch(/Escape' && isModal/)
    expect(source).toMatch(/document\.addEventListener\('keydown', handleKeyDown\)/)
    expect(source).toMatch(/event\.key !== 'Tab'/)
    expect(source).toMatch(/href="#holdings"/)
    expect(source).toMatch(/href="#research"/)
    expect(source).toMatch(/href="#decisions"/)
    expect(source).toMatch(/id="holdings"/)
    expect(source).toMatch(/id="drift"/)
    expect(source).toMatch(/id="plan"/)
    expect(source).toMatch(/id="research"/)
    expect(source).toMatch(/id="decisions"/)
    expect(source).toMatch(/role=\{isModal \? 'dialog' : 'complementary'\}/)
    expect(source).toMatch(/isModal \? \(/)
    expect(source).toMatch(/xl:w-\[22rem\] 2xl:w-\[30rem\]/)
  })

  it('keeps asset cells opt-in so nested interactive rows remain valid', () => {
    const source = readFileSync(SCAFFOLD, 'utf8')

    expect(source).toMatch(/interactive\?: boolean/)
    expect(source).toMatch(/interactive && subject && canOpenAsset\(subject\)/)
    expect(source).toMatch(/aria-haspopup="dialog"/)
  })

  it('keeps the asset detail decision-ready and localizes system status labels', () => {
    const source = readFileSync(PANEL, 'utf8')

    expect(source).toMatch(/title="Market snapshot"/)
    expect(source).toMatch(/label="Price status"/)
    expect(source).toMatch(/label="Action below band"/)
    expect(source).toMatch(/title="Recent transactions"/)
    expect(source).toMatch(/severityLabel\(item\.severity\)/)
    expect(source).toMatch(/formatDashboardActionLabel\(item\.type\)/)
    expect(source).toMatch(/formatDashboardActionReason\(item\.reason\)/)
    expect(source).not.toMatch(/\{item\.action\}/)
    expect(source).not.toMatch(/\{item\.message\}/)
    expect(source).toMatch(/label: t\('Research'\)/)
    expect(source).toMatch(/label: t\('Decision'\)/)
  })

  it('uses the Position section for account allocation progress, not duplicate drift facts', () => {
    const source = readFileSync(PANEL, 'utf8')
    const holdingsSection = source.split('id="holdings"')[1]?.split('id="drift"')[0]

    expect(holdingsSection).toContain("t('Account allocation')")
    expect(holdingsSection).toContain('label="Account target"')
    expect(holdingsSection).toContain('label="Funding progress"')
    expect(holdingsSection).toContain('<ProgressMeter value={execution?.investedPercent} />')
    expect(holdingsSection).not.toContain('label="Actual weight"')
    expect(holdingsSection).not.toContain('label="Drift"')
  })
})
