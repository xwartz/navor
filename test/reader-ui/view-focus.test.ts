import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const APP = 'packages/reader-ui/src/App.tsx'
const VIEW_SCAFFOLD = 'packages/reader-ui/src/components/ViewScaffold.tsx'
const SEARCH = 'packages/reader-ui/src/components/SearchOverview.tsx'

describe('view focus after navigation', () => {
  it('focuses the main heading only after an explicit view change', () => {
    const app = readFileSync(APP, 'utf8')
    const scaffold = readFileSync(VIEW_SCAFFOLD, 'utf8')
    const search = readFileSync(SEARCH, 'utf8')

    expect(app).toContain('shouldFocusViewRef')
    expect(app).toContain('shouldFocusViewRef.current = true')
    expect(app).toContain('if (!shouldFocusViewRef.current || !viewFocusToken)')
    expect(app).toContain("document.querySelector<HTMLElement>('#main-content h1')?.focus")
    expect(app).toContain('preventScroll: true')
    expect(app).not.toContain('skipViewFocusRef')
    expect(scaffold).toContain('tabIndex={-1}')
    expect(scaffold).toContain('outline-none focus-visible:ring-2')
    expect(search).toContain('tabIndex={-1}')
    expect(search).toContain('<h1')
  })
})
