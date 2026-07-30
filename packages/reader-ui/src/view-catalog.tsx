import type { NavorRendererAppState } from '@navor/contract'
import type { ReactNode } from 'react'

import type { ReaderFilters } from './filters'
import { AccountsView } from './views/AccountsView'
import { AllocationView } from './views/AllocationView'
import { DashboardView } from './views/DashboardView'
import { DiagnosticsView } from './views/DiagnosticsView'
import { DriftView } from './views/DriftView'
import { JournalView } from './views/JournalView'
import { PlanView } from './views/PlanView'
import { PortfolioView } from './views/PortfolioView'
import { ResearchView } from './views/ResearchView'
import { ReviewsView } from './views/ReviewsView'
import { TransactionsView } from './views/TransactionsView'
import { WatchlistView } from './views/WatchlistView'

export type ReaderView =
  | 'overview'
  | 'accounts'
  | 'holdings'
  | 'ledger'
  | 'allocation'
  | 'plan'
  | 'drift'
  | 'watchlist'
  | 'research'
  | 'reviews'
  | 'journal'
  | 'diagnostics'

export type ReaderViewGroup = 'Monitor' | 'Portfolio' | 'Investment process' | 'Operations'
export interface ReaderViewDefinition {
  id: ReaderView
  route: string
  label: string
  group: ReaderViewGroup
  filterSource?: (state: NavorRendererAppState) => unknown[]
  navigation?: 'visible' | 'hidden'
  render: (state: NavorRendererAppState, filters: ReaderFilters, liveEnabled: boolean) => ReactNode
}

export const READER_VIEW_CATALOG: ReaderViewDefinition[] = [
  {
    id: 'overview',
    route: 'briefing',
    label: 'Briefing',
    group: 'Monitor',
    render: (state, _filters, live) => <DashboardView liveEnabled={live} state={state} />,
  },
  {
    id: 'drift',
    route: 'actions',
    label: 'Actions',
    group: 'Monitor',
    filterSource: (state) => state.dashboard.actionInbox,
    render: (state, filters) => <DriftView filters={filters} state={state} />,
  },
  {
    id: 'watchlist',
    route: 'watchlist',
    label: 'Watchlist',
    group: 'Monitor',
    filterSource: (state) => state.process.watchlist,
    render: (state, filters) => <WatchlistView filters={filters} state={state} />,
  },
  {
    id: 'holdings',
    route: 'portfolio',
    label: 'Portfolio',
    group: 'Portfolio',
    filterSource: (state) => state.portfolio.holdings,
    render: (state, filters) => <PortfolioView filters={filters} state={state} />,
  },
  {
    id: 'allocation',
    route: 'portfolio/allocation',
    label: 'Allocation',
    group: 'Portfolio',
    filterSource: (state) => state.allocation.assets,
    render: (state, filters) => <AllocationView filters={filters} state={state} />,
    navigation: 'hidden',
  },
  {
    id: 'accounts',
    route: 'portfolio/accounts',
    label: 'Accounts',
    group: 'Portfolio',
    render: (state) => <AccountsView state={state} />,
    navigation: 'hidden',
  },
  {
    id: 'ledger',
    route: 'ledger',
    label: 'Ledger',
    group: 'Portfolio',
    filterSource: (state) => state.portfolio.transactions,
    render: (state, filters) => <TransactionsView filters={filters} state={state} />,
  },
  {
    id: 'research',
    route: 'cases',
    label: 'Investment cases',
    group: 'Investment process',
    filterSource: (state) => [
      ...state.knowledge.research,
      ...state.knowledge.theses,
      ...state.knowledge.decisions,
    ],
    render: (state, filters) => <ResearchView filters={filters} state={state} />,
  },
  {
    id: 'reviews',
    route: 'reviews',
    label: 'Reviews',
    group: 'Investment process',
    filterSource: (state) => state.process.reviews,
    render: (state, filters) => <ReviewsView filters={filters} state={state} />,
  },
  {
    id: 'journal',
    route: 'journal',
    label: 'Journal',
    group: 'Investment process',
    filterSource: (state) => state.process.journal,
    render: (state, filters) => <JournalView filters={filters} state={state} />,
  },
  {
    id: 'plan',
    route: 'plans',
    label: 'Execution plans',
    group: 'Operations',
    filterSource: (state) => state.plan.entries,
    render: (state, filters) => <PlanView filters={filters} state={state} />,
  },
  {
    id: 'diagnostics',
    route: 'health',
    label: 'Data health',
    group: 'Operations',
    filterSource: (state) => state.enrichment.prices,
    render: (state, filters) => (
      <DiagnosticsView
        activeTab="issues"
        filters={filters}
        onActiveTabChange={() => {}}
        state={state}
      />
    ),
  },
]

const definitions = new Map(READER_VIEW_CATALOG.map((view) => [view.id, view]))
export const VIEW_LABELS = Object.fromEntries(
  READER_VIEW_CATALOG.map((view) => [view.id, view.label]),
) as Record<ReaderView, string>
export function getReaderView(id: ReaderView) {
  const view = definitions.get(id) ?? definitions.get('overview')
  if (!view) throw new Error('Reader view catalog must define overview.')
  return view
}
