import { useEffect, useRef, useState } from 'react'

import type { ReaderFilters } from './filters'
import type { ReaderView } from './navigation'
import {
  readReaderLocation,
  subscribeReaderLocation,
  updateReaderLocation,
} from './reader-location'
import type { HealthTab } from './views/DiagnosticsView'
import type { CaseTab } from './views/ResearchView'

export function useReaderNavigationSession(initialView: ReaderView, initialFilters: ReaderFilters) {
  const [location, setLocation] = useState(() =>
    typeof window === 'undefined'
      ? {
          view: initialView,
          asset: null,
          caseTab: 'cases' as CaseTab,
          healthTab: 'issues' as HealthTab,
        }
      : readReaderLocation(window.location.href, initialView, () => false),
  )
  const activeView = location.view
  const activeCaseTab = location.caseTab
  const activeHealthTab = location.healthTab
  const [navOpen, setNavOpen] = useState(false)
  const [navCollapsed, setNavCollapsed] = useState(readNavCollapsed)
  const [filters, setFilters] = useState<ReaderFilters>(initialFilters)
  const shouldFocusViewRef = useRef(false)

  useEffect(() => {
    const syncView = () => {
      shouldFocusViewRef.current = true
      setLocation(readReaderLocation(window.location.href, initialView, () => false))
      setFilters({})
    }
    return subscribeReaderLocation(syncView)
  }, [initialView])

  useEffect(() => {
    window.localStorage.setItem('navor:nav-collapsed', String(navCollapsed))
  }, [navCollapsed])

  const selectView = (view: ReaderView, searchOpen: boolean) => {
    shouldFocusViewRef.current = view !== activeView || searchOpen
    setLocation({ view, asset: null, caseTab: 'cases', healthTab: 'issues' })
    setFilters({})
    const nextLocation = updateReaderLocation(window.location.href, { view })
    if (
      `${window.location.pathname}${window.location.search}${window.location.hash}` !== nextLocation
    ) {
      window.history.pushState(null, '', nextLocation)
    }
  }

  const selectCaseTab = (caseTab: CaseTab) => {
    setLocation((current) => ({
      ...current,
      view: 'research',
      caseTab,
    }))
    window.history.pushState(
      null,
      '',
      updateReaderLocation(window.location.href, { view: 'research', caseTab }),
    )
  }

  const selectHealthTab = (healthTab: HealthTab) => {
    setLocation((current) => ({
      ...current,
      view: 'diagnostics',
      healthTab,
    }))
    window.history.pushState(
      null,
      '',
      updateReaderLocation(window.location.href, { view: 'diagnostics', healthTab }),
    )
  }

  return {
    activeView,
    activeCaseTab,
    activeHealthTab,
    navOpen,
    setNavOpen,
    navCollapsed,
    setNavCollapsed,
    filters,
    setFilters,
    selectView,
    selectCaseTab,
    selectHealthTab,
    shouldFocusViewRef,
  }
}

function readNavCollapsed() {
  return (
    typeof window !== 'undefined' && window.localStorage.getItem('navor:nav-collapsed') === 'true'
  )
}
