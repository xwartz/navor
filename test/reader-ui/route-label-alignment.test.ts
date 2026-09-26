import { describe, expect, it } from 'vitest'

import { NAV_GROUPS } from '../../packages/reader-ui/src/navigation'
import {
  getDestinationTabs,
  getDestinationView,
  getReaderView,
} from '../../packages/reader-ui/src/view-catalog'

describe('Reader decision-desk navigation', () => {
  it('keeps six task destinations in the sidebar', () => {
    expect(NAV_GROUPS.flatMap((group) => group.items)).toEqual([
      { id: 'overview', label: 'Briefing' },
      { id: 'holdings', label: 'Portfolio' },
      { id: 'ledger', label: 'Ledger' },
      { id: 'research', label: 'Investment cases' },
      { id: 'reviews', label: 'Reviews & journal' },
      { id: 'diagnostics', label: 'Data health' },
    ])
  })

  it('hosts secondary views as section tabs of their destination', () => {
    expect(getDestinationView('drift')).toBe('overview')
    expect(getDestinationView('plan')).toBe('holdings')
    expect(getDestinationView('watchlist')).toBe('research')
    expect(getDestinationView('journal')).toBe('reviews')
    expect(getDestinationTabs('plan').map((tab) => tab.label)).toEqual([
      'Positions',
      'Allocation',
      'Plans',
      'Accounts',
    ])
    expect(getDestinationTabs('ledger')).toEqual([])
  })

  it('uses task names as canonical URLs instead of implementation names', () => {
    expect(getReaderView('overview').route).toBe('briefing')
    expect(getReaderView('drift').route).toBe('briefing/actions')
    expect(getReaderView('holdings').route).toBe('portfolio')
    expect(getReaderView('plan').route).toBe('portfolio/plans')
    expect(getReaderView('research').route).toBe('cases')
    expect(getReaderView('watchlist').route).toBe('cases/watchlist')
    expect(getReaderView('journal').route).toBe('reviews/journal')
    expect(getReaderView('diagnostics').route).toBe('health')
  })
})
