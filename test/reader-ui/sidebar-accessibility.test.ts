import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const SIDEBAR = 'packages/reader-ui/src/components/Sidebar.tsx'

describe('mobile sidebar accessibility', () => {
  it('removes the closed drawer from focus order and restores trigger focus', () => {
    const source = readFileSync(SIDEBAR, 'utf8')

    expect(source).toContain('inert={drawerHidden}')
    expect(source).toContain('aria-hidden={drawerHidden}')
    expect(source).toContain("event.key === 'Escape'")
    expect(source).toContain('triggerRef.current?.focus()')
    expect(source).toContain("event.key !== 'Tab'")
  })

  it('can collapse to an accessible desktop navigation rail', () => {
    const source = readFileSync(SIDEBAR, 'utf8')

    expect(source).toContain("isRail ? 'lg:w-20' : 'lg:w-[15.5rem]'")
    expect(source).toContain("isCollapsed ? 'Expand navigation' : 'Collapse navigation'")
    expect(source).toContain('compactNavLabel(item.id)')
    expect(source).toContain('aria-label={isRail ? item.label : undefined}')
  })

  it('does not auto-collapse to a rail in the constrained desktop range', () => {
    const source = readFileSync(SIDEBAR, 'utf8')

    expect(source).not.toContain('(min-width: 1280px) and (max-width: 1535px)')
    expect(source).toContain('const isRail = isCollapsed')
    expect(source).toContain("isCollapsed ? 'Expand navigation' : 'Collapse navigation'")
  })
})
