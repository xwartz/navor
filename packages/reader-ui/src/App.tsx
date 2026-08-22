import type { NavorRendererAppState } from '@navor/contract'
import { useEffect, useRef, useState } from 'react'

import { AssetWorkspaceProvider } from './AssetWorkspaceProvider'
import { useAssetWorkspace } from './asset-workspace-context'
import { AssetWorkspaceOverlay } from './components/AssetWorkspacePanel'
import { ReaderToolbar } from './components/ReaderToolbar'
import { SearchOverview } from './components/SearchOverview'
import { Sidebar } from './components/Sidebar'
import { EntityLabelProvider } from './EntityLabelContext'
import type { ReaderFilters } from './filters'
import { hasActiveFilters, matchesFilters } from './filters'
import { readerLocale, t } from './i18n'
import { getNavGroups, getViewLabels, type ReaderView } from './navigation'
import { useReaderNavigationSession } from './navigation-session'
import { buildSearchHits } from './search'
import { type DiagnosticsToolbarTab, getToolbarContext } from './toolbar-context'
import { transactionType } from './transaction-type'
import { getReaderView } from './view-catalog'
import { DiagnosticsView } from './views/DiagnosticsView'
import { ResearchView } from './views/ResearchView'

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
      <main className="min-h-screen bg-paper px-6 py-16 text-ink lg:px-10">
        <section className="mx-auto max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Navor</p>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-[-0.028em] text-ink">
            {t('A human-first language for long-term investing.')}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.7] text-ink-muted">
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
  } = useReaderNavigationSession(initialView, initialFilters)
  const navButtonRef = useRef<HTMLButtonElement>(null)
  const [searchScope, setSearchScope] = useState<'view' | 'workspace'>('view')
  const { selectedAssetSubject } = useAssetWorkspace()
  const diagnosticCount = state ? countDiagnostics(state) : 0
  const toolbarContext = getToolbarContext(activeView, state, activeHealthTab)
  const showSearch = Boolean(
    filters.query?.trim() && (toolbarContext.mode === 'brief' || searchScope === 'workspace'),
  )
  const viewFocusToken = showSearch ? 'search' : activeView
  const filterResultCount = hasActiveFilters(filters)
    ? countFilterMatches(showSearch ? null : activeView, state, filters, activeHealthTab)
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
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-paper-elevated focus:px-3 focus:py-2 focus:text-sm focus:shadow-[var(--shadow-md)]"
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
            context={toolbarContext}
            filters={filters}
            leading={
              <button
                aria-expanded={navOpen}
                aria-label={`${t('Open navigation')}, ${t('current view')} ${getViewLabels(readerLocale)[activeView]}`}
                className="press-scale grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border/80 bg-paper-elevated text-lg leading-none text-ink shadow-[var(--shadow-xs)] transition-[background-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-accent-soft lg:hidden"
                onClick={() => setNavOpen(true)}
                ref={navButtonRef}
                type="button"
              >
                <span aria-hidden>≡</span>
              </button>
            }
            onChange={setFilters}
            onSearchScopeChange={setSearchScope}
            resultCount={filterResultCount}
            searchScope={searchScope}
          />
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-9" id="main-content">
            <div
              className="view-enter mx-auto w-full max-w-[96rem]"
              key={showSearch ? `search:${filters.query}` : activeView}
            >
              {showSearch ? (
                <SearchOverview filters={filters} onSelectView={selectReaderView} state={state} />
              ) : activeView === 'research' ? (
                <ResearchView
                  filters={filters}
                  initialTab={activeCaseTab}
                  onActiveTabChange={selectCaseTab}
                  state={state}
                />
              ) : activeView === 'diagnostics' ? (
                <DiagnosticsReaderView
                  activeTab={activeHealthTab}
                  filters={filters}
                  onActiveTabChange={selectHealthTab}
                  state={state}
                />
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

function DiagnosticsReaderView({
  state,
  filters,
  activeTab,
  onActiveTabChange,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
  activeTab: DiagnosticsToolbarTab
  onActiveTabChange: (tab: DiagnosticsToolbarTab) => void
}) {
  return (
    <DiagnosticsView
      activeTab={activeTab}
      filters={filters}
      onActiveTabChange={onActiveTabChange}
      state={state}
    />
  )
}

function countFilterMatches(
  view: ReaderView | null,
  state: NavorRendererAppState,
  filters: ReaderFilters,
  diagnosticsTab: DiagnosticsToolbarTab,
) {
  if (view === null) {
    return buildSearchHits(state).filter((hit) => matchesFilters(hit, filters)).length
  }

  if (view === 'diagnostics') {
    if (diagnosticsTab === 'issues') {
      return [
        ...state.workspace.diagnostics,
        ...state.dashboard.diagnostics,
        ...state.portfolio.diagnostics,
        ...state.allocation.diagnostics,
        ...state.knowledge.diagnostics,
        ...state.plan.diagnostics,
        ...state.drift.diagnostics,
      ].filter((diagnostic) =>
        matchesFilters({ ...diagnostic, type: diagnostic.code ?? 'Uncoded' }, filters),
      ).length
    }

    if (diagnosticsTab === 'sources') {
      return state.workspace.files.filter((file) =>
        matchesFilters({ type: file.match(/\.[^./]+$/)?.[0] ?? '', line: file }, filters),
      ).length
    }

    const { type: provider, ...baseFilters } = filters
    const marketBySubject = new Map(state.market.prices.map((price) => [price.subject, price]))
    const enrichmentBySubject = new Map(
      state.enrichment.prices.map((price) => [price.subject, price]),
    )
    return [...new Set([...marketBySubject.keys(), ...enrichmentBySubject.keys()])].filter(
      (subject) => {
        const marketPrice = marketBySubject.get(subject)
        const enrichment = enrichmentBySubject.get(subject)
        return (
          matchesFilters({ subject, ...marketPrice, ...enrichment }, baseFilters) &&
          (!provider || (enrichment?.provider ?? marketPrice?.provider) === provider)
        )
      },
    ).length
  }

  return (getReaderView(view).filterSource?.(state) ?? []).filter((item) =>
    matchesCurrentViewFilters(view, item, filters, state),
  ).length
}

function matchesCurrentViewFilters(
  view: ReaderView,
  item: unknown,
  filters: ReaderFilters,
  state: NavorRendererAppState,
) {
  if (view === 'ledger') {
    const transaction = item as NonNullable<
      NavorRendererAppState['portfolio']['transactions']
    >[number]
    const { type, ...baseFilters } = filters
    return (
      matchesFilters(transaction, baseFilters) && (!type || transactionType(transaction) === type)
    )
  }

  if (view === 'drift') {
    const action = item as NavorRendererAppState['dashboard']['actionInbox'][number]
    const { type, ...baseFilters } = filters
    return matchesFilters(action, baseFilters) && (!type || action.category === type)
  }

  if (view === 'watchlist') {
    const watchlistItem = item as NavorRendererAppState['process']['watchlist'][number]
    const stage = !state.knowledge.research.some((entry) => entry.subject === watchlistItem.subject)
      ? 'Capture evidence'
      : !state.knowledge.theses.some((entry) => entry.subject === watchlistItem.subject)
        ? 'Form thesis'
        : !state.knowledge.decisions.some((entry) => entry.subject === watchlistItem.subject)
          ? 'Decide'
          : 'Review case'
    return matchesFilters({ ...watchlistItem, status: stage }, filters)
  }

  if (view === 'journal') {
    const entry = item as NavorRendererAppState['process']['journal'][number]
    return matchesFilters({ ...entry, status: entry.mood ?? '' }, filters)
  }

  if (view === 'holdings') {
    const holding = item as NavorRendererAppState['portfolio']['holdings'][number]
    const account = state.dashboard.assetExecutions.find(
      (execution) => execution.subject === holding.asset,
    )?.account
    const { account: accountFilter, ...baseFilters } = filters
    return matchesFilters(holding, baseFilters) && (!accountFilter || account === accountFilter)
  }

  return matchesFilters(item, filters)
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
