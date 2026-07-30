import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const WORKSPACE = 'packages/reader-ui/src/AssetWorkspaceProvider.tsx'
const PANEL = 'packages/reader-ui/src/components/AssetWorkspacePanel.tsx'
const SCAFFOLD = 'packages/reader-ui/src/components/ViewScaffold.tsx'

describe('shared asset workspace', () => {
  it('uses the location protocol and restores focus on close', () => {
    const source = readFileSync(WORKSPACE, 'utf8')

    expect(source).toMatch(/readReaderLocation/)
    expect(source).toMatch(/updateReaderLocation/)
    expect(source).toMatch(/returnFocusRef\.current\.focus\(\{ preventScroll: true \}\)/)
    expect(source).toMatch(/data-asset-subject/)
  })

  it('supports Escape, focus trapping, and a single contextual asset workspace', () => {
    const source = readFileSync(PANEL, 'utf8')

    expect(source).toMatch(/event\.key === 'Escape'/)
    expect(source).not.toMatch(/Escape' && isModal/)
    expect(source).toMatch(/document\.addEventListener\('keydown', handleKeyDown\)/)
    expect(source).toMatch(/event\.key !== 'Tab'/)
    expect(source).toMatch(/id="snapshot"/)
    expect(source).toMatch(/id="position"/)
    expect(source).toMatch(/id="actions"/)
    expect(source).toMatch(/id="evidence"/)
    expect(source).not.toMatch(/function WorkspaceLink/)
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

    expect(source).toMatch(/t\('Decision basis'\)/)
    expect(source).toMatch(/label="Price updated"/)
    expect(source).toMatch(/title="Evidence and decisions"/)
    expect(source).toMatch(/title="Recent transactions"/)
    expect(source).toMatch(/severityLabel\(item\.severity\)/)
    expect(source).toMatch(/formatDashboardActionLabel\(item\.type\)/)
    expect(source).toMatch(/formatDashboardActionReason\(item\.reason\)/)
    expect(source).not.toMatch(/\{item\.action\}/)
    expect(source).not.toMatch(/\{item\.message\}/)
    expect(source).toMatch(/label: t\('Research'\)/)
    expect(source).toMatch(/label: t\('Decision'\)/)
  })

  it('keeps position, plan, actions, and evidence in a single ordered read', () => {
    const source = readFileSync(PANEL, 'utf8')

    expect(source).toContain('const evidenceTimeline = [...researchTimeline, ...decisionsTimeline]')
    expect(source).toContain('WorkspaceSection id="actions" title="Next actions"')
    expect(source).not.toContain("actions.length} {t('Open actions').toLowerCase()")
    expect(source).toContain('WorkspaceSection id="evidence" title="Evidence and decisions"')
    expect(source).not.toContain('WorkspaceSection id="drift"')
    expect(source).not.toContain('WorkspaceSection id="plan"')
  })
})
