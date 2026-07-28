import { useEffect, useRef, useState } from 'react'

import type { ReaderFilters } from './filters'
import type { ReaderView } from './navigation'
import {
  readReaderLocation,
  subscribeReaderLocation,
  updateReaderLocation,
} from './reader-location'

export function useReaderNavigationSession(initialView: ReaderView, initialFilters: ReaderFilters) {
  const [activeView, setActiveView] = useState<ReaderView>(() =>
    typeof window === 'undefined'
      ? initialView
      : readReaderLocation(window.location.href, initialView, () => false).view,
  )
  const [navOpen, setNavOpen] = useState(false)
  const [navCollapsed, setNavCollapsed] = useState(readNavCollapsed)
  const [filters, setFilters] = useState<ReaderFilters>(initialFilters)
  const shouldFocusViewRef = useRef(false)

  useEffect(() => {
    const syncView = () => {
      shouldFocusViewRef.current = true
      setActiveView(readReaderLocation(window.location.href, initialView, () => false).view)
      setFilters({})
    }
    return subscribeReaderLocation(syncView)
  }, [initialView])

  useEffect(() => {
    window.localStorage.setItem('navor:nav-collapsed', String(navCollapsed))
  }, [navCollapsed])

  const selectView = (view: ReaderView, searchOpen: boolean) => {
    shouldFocusViewRef.current = view !== activeView || searchOpen
    setActiveView(view)
    setFilters({})
    if (window.location.hash !== `#${view}`) {
      window.history.pushState(null, '', updateReaderLocation(window.location.href, { view }))
    }
  }

  return {
    activeView,
    navOpen,
    setNavOpen,
    navCollapsed,
    setNavCollapsed,
    filters,
    setFilters,
    selectView,
    shouldFocusViewRef,
  }
}

function readNavCollapsed() {
  return (
    typeof window !== 'undefined' && window.localStorage.getItem('navor:nav-collapsed') === 'true'
  )
}
