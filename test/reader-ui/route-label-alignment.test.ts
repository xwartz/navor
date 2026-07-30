import { describe, expect, it } from 'vitest'

import { NAV_GROUPS } from '../../packages/reader-ui/src/navigation'
import { getReaderView } from '../../packages/reader-ui/src/view-catalog'

describe('Reader decision-desk navigation', () => {
  it('keeps stable hash routes behind task-oriented labels', () => {
    expect(NAV_GROUPS.flatMap((group) => group.items)).toEqual(
      expect.arrayContaining([
        { id: 'overview', label: 'Briefing' },
        { id: 'drift', label: 'Actions' },
        { id: 'holdings', label: 'Portfolio' },
        { id: 'research', label: 'Investment cases' },
        { id: 'plan', label: 'Execution plans' },
        { id: 'diagnostics', label: 'Data health' },
      ]),
    )
    expect(NAV_GROUPS.flatMap((group) => group.items)).toHaveLength(10)
  })

  it('uses task names as canonical URLs instead of implementation names', () => {
    expect(getReaderView('overview').route).toBe('briefing')
    expect(getReaderView('drift').route).toBe('actions')
    expect(getReaderView('holdings').route).toBe('portfolio')
    expect(getReaderView('research').route).toBe('cases')
    expect(getReaderView('diagnostics').route).toBe('health')
  })
})
