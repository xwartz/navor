import type { NavorRendererAppState } from '@navor/contract'
import { useEffect, useRef } from 'react'

import { AssetWorkspaceProvider } from './AssetWorkspaceProvider'
import { useAssetWorkspace } from './asset-workspace-context'
import { AssetWorkspaceOverlay } from './components/AssetWorkspacePanel'
import { ReaderToolbar } from './components/ReaderToolbar'
import { SearchOverview } from './components/SearchOverview'
import { Sidebar } from './components/Sidebar'
import { EntityLabelProvider } from './EntityLabelContext'
import type { ReaderFilters } from './filters'
import { matchesFilters } from './filters'
import { readerLocale, t } from './i18n'
import { getNavGroups, getViewLabels, type ReaderView } from './navigation'
import { useReaderNavigationSession } from './navigation-session'
import { buildSearchHits } from './search'
import { getReaderView } from './view-catalog'

interface AppProps {
  state?: NavorRendererAppState | null
  filters?: ReaderFilters
  initialView?: ReaderView
  liveEnabled?: boolean
}

export type { ReaderFilters } from './filters'
export type { ReaderView } from './navigation'

export function App({
  state = null,
  filters: initialFilters = {},
  initialView = 'overview',
  liveEnabled = false,
}: AppProps) {
  if (!state) {
    return (
      <main className="min-h-screen bg-paper px-6 py-12 text-ink lg:px-10">
        <section className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">Navor</p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.022em] text-ink">
            {t('A human-first language for long-term investing.')}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink-muted">
            {t(
              'Describe capital, accounts, assets, research, thesis, decisions, transactions, and reviews in plain text, then read them here as a portfolio ledger.',
            )}
          </p>
        </section>
      </main>
    )
  }

  return (
    <EntityLabelProvider state={state}>
      <AssetWorkspaceProvider state={state}>
        <ReaderAppShell
          filters={initialFilters}
          initialView={initialView}
          liveEnabled={liveEnabled}
          state={state}
        />
      </AssetWorkspaceProvider>
    </EntityLabelProvider>
  )
}

function ReaderAppShell({
  state,
  filters: initialFilters,
  initialView,
  liveEnabled,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
  initialView: ReaderView
  liveEnabled: boolean
}) {
  const {
    activeView,
    navOpen,
    setNavOpen,
    navCollapsed,
    setNavCollapsed,
    filters,
    setFilters,
    selectView,
    shouldFocusViewRef,
  } = useReaderNavigationSession(initialView, initialFilters)
  const navButtonRef = useRef<HTMLButtonElement>(null)
  const { selectedAssetSubject } = useAssetWorkspace()
  const diagnosticCount = state ? countDiagnostics(state) : 0
  const showSearch = Boolean(state && filters.query?.trim())
  const viewFocusToken = showSearch ? 'search' : activeView
  const filtersEnabled = showSearch || Boolean(getReaderView(activeView).filterSource)
  const filterResultCount =
    state && filtersEnabled && Object.values(filters).some(Boolean)
      ? countFilterMatches(showSearch ? null : activeView, state, filters)
      : null

  useEffect(() => {
    if (!shouldFocusViewRef.current || !viewFocusToken) {
      return
    }

    shouldFocusViewRef.current = false

    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('#main-content h1')?.focus({ preventScroll: true })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [viewFocusToken, shouldFocusViewRef])

  const selectReaderView = (view: ReaderView) => selectView(view, showSearch)

  return (
    <>
      <div
        className={`min-h-screen bg-paper text-ink lg:flex ${
          selectedAssetSubject ? 'xl:pr-[22rem] 2xl:pr-[30rem]' : ''
        }`}
      >
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-paper-elevated focus:px-3 focus:py-2 focus:text-sm focus:shadow-[0_8px_24px_rgba(17,19,24,0.14)]"
          href="#main-content"
        >
          {t('Skip to content')}
        </a>
        <Sidebar
          activeView={activeView}
          diagnosticCount={diagnosticCount}
          isCollapsed={navCollapsed}
          isOpen={navOpen}
          navGroups={getNavGroups(readerLocale)}
          onClose={() => setNavOpen(false)}
          onSelect={selectReaderView}
          onToggleCollapse={() => setNavCollapsed((current) => !current)}
          triggerRef={navButtonRef}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <ReaderToolbar
            filters={filters}
            filtersEnabled={filtersEnabled}
            leading={
              <button
                aria-expanded={navOpen}
                aria-label={`${t('Open navigation')}, ${t('current view')} ${getViewLabels(readerLocale)[activeView]}`}
                className="press-scale grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border bg-paper text-lg leading-none text-ink shadow-[0_1px_2px_rgba(17,19,24,0.06)] transition-[background-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-accent-soft lg:hidden"
                onClick={() => setNavOpen(true)}
                ref={navButtonRef}
                type="button"
              >
                <span aria-hidden>≡</span>
              </button>
            }
            onChange={setFilters}
            resultCount={filterResultCount}
          />
          <main className="flex-1 px-4 py-6 lg:px-7 lg:py-8" id="main-content">
            <div
              className="view-enter mx-auto w-full max-w-[96rem]"
              key={showSearch ? `search:${filters.query}` : activeView}
            >
              {showSearch ? (
                <SearchOverview filters={filters} onSelectView={selectReaderView} state={state} />
              ) : (
                getReaderView(activeView).render(state, filters, liveEnabled)
              )}
            </div>
          </main>
        </div>
      </div>
      <AssetWorkspaceOverlay />
    </>
  )
}

function countFilterMatches(
  view: ReaderView | null,
  state: NavorRendererAppState,
  filters: ReaderFilters,
) {
  if (view === null) {
    return buildSearchHits(state).filter((hit) => matchesFilters(hit, filters)).length
  }

  return (getReaderView(view).filterSource?.(state) ?? []).filter((item) =>
    matchesFilters(item, filters),
  ).length
}

export { resolveReaderView } from './navigation'

function countDiagnostics(state: NavorRendererAppState) {
  return [
    ...state.workspace.diagnostics,
    ...state.dashboard.diagnostics,
    ...state.portfolio.diagnostics,
    ...state.allocation.diagnostics,
    ...state.knowledge.diagnostics,
    ...state.plan.diagnostics,
    ...state.drift.diagnostics,
  ].length
}
