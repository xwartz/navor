import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const STYLES = 'packages/reader-ui/src/styles.css'
const META_SCROLL = 'packages/reader-ui/src/components/MetaScroll.tsx'
const META_BAR = 'packages/reader-ui/src/components/WorkspaceMetaBar.tsx'
const WORKSPACE = 'packages/reader-ui/src/components/AssetWorkspacePanel.tsx'
const APP = 'packages/reader-ui/src/App.tsx'
const SIDEBAR = 'packages/reader-ui/src/components/Sidebar.tsx'
const TOOLBAR = 'packages/reader-ui/src/components/ReaderToolbar.tsx'

describe('meta-scroll overflow affordance', () => {
  it('defines meta-scroll and renders an end fade while content can still scroll', () => {
    const css = readFileSync(STYLES, 'utf8')
    const metaScroll = readFileSync(META_SCROLL, 'utf8')
    const metaBar = readFileSync(META_BAR, 'utf8')
    const workspace = readFileSync(WORKSPACE, 'utf8')

    expect(css).toContain('.meta-scroll')
    expect(metaScroll).toContain('meta-scroll')
    expect(metaScroll).toContain('bg-gradient-to-l')
    expect(metaScroll).toContain('scrollWidth')
    expect(metaBar).toContain('<MetaScroll')
    expect(metaBar).toContain('fade="sidebar"')
    expect(workspace).toContain('<MetaScroll')
    expect(workspace).toContain('fade="paper-elevated"')
  })
})

describe('compact control press feedback', () => {
  it('applies press-scale to compact chrome controls only', () => {
    const css = readFileSync(STYLES, 'utf8')
    const app = readFileSync(APP, 'utf8')
    const sidebar = readFileSync(SIDEBAR, 'utf8')
    const toolbar = readFileSync(TOOLBAR, 'utf8')
    const workspace = readFileSync(WORKSPACE, 'utf8')

    expect(css).toContain('.press-scale:active:not(:disabled)')
    expect(css).toContain('transform: none')
    expect(app).toContain('press-scale')
    expect(sidebar).toContain('press-scale')
    expect(toolbar).toContain('press-scale')
    expect(workspace).toContain('press-scale')
  })
})
