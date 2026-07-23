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
import { matchesFilters } from './filters'
import { readerLocale, t } from './i18n'
import { getNavGroups, getViewLabels, type ReaderView, VIEW_LABELS } from './navigation'
import { buildSearchHits } from './search'
import { AccountsView } from './views/AccountsView'
import { AllocationView } from './views/AllocationView'
import { DashboardView } from './views/DashboardView'
import { DecisionsView } from './views/DecisionsView'
import { DiagnosticsView } from './views/DiagnosticsView'
import { DriftView } from './views/DriftView'
import { JournalView } from './views/JournalView'
import { MarketView } from './views/MarketView'
import { PlanView } from './views/PlanView'
import { PortfolioView } from './views/PortfolioView'
import { ResearchView } from './views/ResearchView'
import { ReviewsView } from './views/ReviewsView'
import { ThesisView } from './views/ThesisView'
import { TransactionsView } from './views/TransactionsView'
import { WatchlistView } from './views/WatchlistView'
import { WorkspaceView } from './views/WorkspaceView'

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
  const [activeView, setActiveView] = useState<ReaderView>(() =>
    typeof window === 'undefined'
      ? initialView
      : resolveReaderView(window.location.hash, initialView),
  )
  const [navOpen, setNavOpen] = useState(false)
  const [navCollapsed, setNavCollapsed] = useState(readNavCollapsed)
  const [filters, setFilters] = useState<ReaderFilters>(initialFilters)
  const navButtonRef = useRef<HTMLButtonElement>(null)
  const { selectedAssetSubject } = useAssetWorkspace()
  const diagnosticCount = state ? countDiagnostics(state) : 0
  const showSearch = Boolean(state && filters.query?.trim())
  const filtersEnabled = showSearch || FILTERABLE_VIEWS.has(activeView)
  const filterResultCount =
    state && filtersEnabled && Object.values(filters).some(Boolean)
      ? countFilterMatches(showSearch ? null : activeView, state, filters)
      : null

  useEffect(() => {
    const syncView = () => {
      setActiveView(resolveReaderView(window.location.hash, initialView))
      setFilters({})
    }

    window.addEventListener('popstate', syncView)
    window.addEventListener('hashchange', syncView)
    return () => {
      window.removeEventListener('popstate', syncView)
      window.removeEventListener('hashchange', syncView)
    }
  }, [initialView])

  useEffect(() => {
    window.localStorage.setItem('navor:nav-collapsed', String(navCollapsed))
  }, [navCollapsed])

  const selectView = (view: ReaderView) => {
    setActiveView(view)
    setFilters({})

    if (window.location.hash !== `#${view}`) {
      window.history.pushState(null, '', `#${view}`)
    }
  }

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
          onSelect={selectView}
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
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border bg-paper text-lg leading-none text-ink shadow-[0_1px_2px_rgba(17,19,24,0.06)] transition-[background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-accent-soft lg:hidden"
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
          <main className="flex-1 px-4 py-5 lg:px-6 lg:py-7" id="main-content">
            <div
              className="view-enter mx-auto w-full max-w-[100rem]"
              key={showSearch ? `search:${filters.query}` : activeView}
            >
              {showSearch ? (
                <SearchOverview filters={filters} onSelectView={selectView} state={state} />
              ) : (
                renderActiveView(activeView, state, filters, liveEnabled)
              )}
            </div>
          </main>
        </div>
      </div>
      <AssetWorkspaceOverlay />
    </>
  )
}

function readNavCollapsed() {
  return (
    typeof window !== 'undefined' && window.localStorage.getItem('navor:nav-collapsed') === 'true'
  )
}

const FILTERABLE_VIEWS = new Set<ReaderView>([
  'holdings',
  'ledger',
  'allocation',
  'plan',
  'drift',
  'watchlist',
  'research',
  'thesis',
  'decisions',
  'reviews',
  'journal',
  'market-data',
])

function countFilterMatches(
  view: ReaderView | null,
  state: NavorRendererAppState,
  filters: ReaderFilters,
) {
  if (view === null) {
    return buildSearchHits(state).filter((hit) => matchesFilters(hit, filters)).length
  }

  const sources: Partial<Record<ReaderView, unknown[]>> = {
    holdings: state.portfolio.holdings,
    ledger: state.portfolio.transactions,
    allocation: state.allocation.assets,
    plan: state.plan.entries,
    drift: state.drift.entries,
    watchlist: state.process.watchlist,
    research: [
      ...state.knowledge.research,
      ...state.knowledge.theses,
      ...state.knowledge.decisions,
    ],
    thesis: state.knowledge.theses,
    decisions: state.knowledge.decisions,
    reviews: state.process.reviews,
    journal: state.process.journal,
  }

  if (view === 'market-data') {
    const priceSubjects = new Set([
      ...state.market.prices.map((price) => price.subject),
      ...state.enrichment.prices.map((price) => price.subject),
    ])
    const priceRecords = [...priceSubjects].map((subject) => ({
      subject,
      ...state.market.prices.find((price) => price.subject === subject),
      ...state.enrichment.prices.find((price) => price.subject === subject),
    }))

    return [...priceRecords, ...state.market.research].filter((item) =>
      matchesFilters(item, filters),
    ).length
  }

  return (sources[view] ?? []).filter((item) => matchesFilters(item, filters)).length
}

export function resolveReaderView(hash: string, fallback: ReaderView): ReaderView {
  const candidate = hash.replace(/^#/, '')
  return Object.hasOwn(VIEW_LABELS, candidate) ? (candidate as ReaderView) : fallback
}

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

function renderActiveView(
  view: ReaderView,
  state: NavorRendererAppState,
  filters: ReaderFilters,
  liveEnabled: boolean,
) {
  switch (view) {
    case 'workspace':
      return <WorkspaceView state={state} />
    case 'overview':
      return <DashboardView liveEnabled={liveEnabled} state={state} />
    case 'accounts':
      return <AccountsView state={state} />
    case 'holdings':
      return <PortfolioView filters={filters} state={state} />
    case 'ledger':
      return <TransactionsView filters={filters} state={state} />
    case 'allocation':
      return <AllocationView filters={filters} state={state} />
    case 'plan':
      return <PlanView filters={filters} state={state} />
    case 'drift':
      return <DriftView filters={filters} state={state} />
    case 'watchlist':
      return <WatchlistView filters={filters} state={state} />
    case 'research':
      return <ResearchView filters={filters} state={state} />
    case 'thesis':
      return <ThesisView filters={filters} state={state} />
    case 'decisions':
      return <DecisionsView filters={filters} state={state} />
    case 'reviews':
      return <ReviewsView filters={filters} state={state} />
    case 'journal':
      return <JournalView filters={filters} state={state} />
    case 'market-data':
      return <MarketView filters={filters} state={state} />
    case 'diagnostics':
      return <DiagnosticsView state={state} />
    default:
      return <DashboardView liveEnabled={liveEnabled} state={state} />
  }
}
