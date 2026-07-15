import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const STYLES = 'packages/reader-ui/src/styles.css'
const DASHBOARD = 'packages/reader-ui/src/views/DashboardView.tsx'
const APP = 'packages/reader-ui/src/App.tsx'
const WORKSPACE = 'packages/reader-ui/src/components/AssetWorkspacePanel.tsx'

describe('Decision queue detail presentation', () => {
  it('opens the shared workspace outside the animated view container', () => {
    const dashboard = readFileSync(DASHBOARD, 'utf8')
    const app = readFileSync(APP, 'utf8')
    const workspace = readFileSync(WORKSPACE, 'utf8')

    expect(dashboard).toMatch(/useAssetWorkspace/)
    expect(dashboard).not.toMatch(/AssetDetailPanel/)
    expect(workspace).toMatch(/fixed inset-y-0 right-0/)
    expect(app).toMatch(/<AssetWorkspaceOverlay \/>/)
  })

  it('locks body scrolling only while the workspace is modal', () => {
    const source = readFileSync(WORKSPACE, 'utf8')

    expect(source).toMatch(/if \(!isModal\)/)
    expect(source).toMatch(/document\.body\.style\.overflow = 'hidden'/)
    expect(source).toMatch(/\{\.\.\.\(isModal \? \{ 'aria-modal': true \} : \{\}\)\}/)
    expect(source).toMatch(/role=\{isModal \? 'dialog' : 'complementary'\}/)
  })

  it('does not keep unused drawer enter animations that imply overlay chrome', () => {
    const css = readFileSync(STYLES, 'utf8')

    expect(css).not.toMatch(/drawer-panel-enter/)
    expect(css).not.toMatch(/drawer-backdrop-enter/)
  })
})
