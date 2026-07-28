import type { NavorRendererAppState } from '@navor/contract'
import type { ReactNode } from 'react'

import type { ReaderFilters } from './filters'
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

export type ReaderView =
  | 'workspace'
  | 'overview'
  | 'accounts'
  | 'holdings'
  | 'ledger'
  | 'allocation'
  | 'plan'
  | 'drift'
  | 'watchlist'
  | 'research'
  | 'thesis'
  | 'decisions'
  | 'reviews'
  | 'journal'
  | 'market-data'
  | 'diagnostics'

export type ReaderViewGroup = 'Monitor' | 'Capital' | 'Research' | 'System'
export interface ReaderViewDefinition {
  id: ReaderView
  label: string
  group: ReaderViewGroup
  filterSource?: (state: NavorRendererAppState) => unknown[]
  render: (state: NavorRendererAppState, filters: ReaderFilters, liveEnabled: boolean) => ReactNode
}

export const READER_VIEW_CATALOG: ReaderViewDefinition[] = [
  {
    id: 'overview',
    label: 'Overview',
    group: 'Monitor',
    render: (state, _filters, live) => <DashboardView liveEnabled={live} state={state} />,
  },
  {
    id: 'drift',
    label: 'Drift',
    group: 'Monitor',
    filterSource: (state) => state.drift.entries,
    render: (state, filters) => <DriftView filters={filters} state={state} />,
  },
  {
    id: 'watchlist',
    label: 'Watchlist',
    group: 'Monitor',
    filterSource: (state) => state.process.watchlist,
    render: (state, filters) => <WatchlistView filters={filters} state={state} />,
  },
  {
    id: 'holdings',
    label: 'Holdings',
    group: 'Capital',
    filterSource: (state) => state.portfolio.holdings,
    render: (state, filters) => <PortfolioView filters={filters} state={state} />,
  },
  {
    id: 'allocation',
    label: 'Allocation',
    group: 'Capital',
    filterSource: (state) => state.allocation.assets,
    render: (state, filters) => <AllocationView filters={filters} state={state} />,
  },
  {
    id: 'accounts',
    label: 'Accounts',
    group: 'Capital',
    render: (state) => <AccountsView state={state} />,
  },
  {
    id: 'ledger',
    label: 'Ledger',
    group: 'Capital',
    filterSource: (state) => state.portfolio.transactions,
    render: (state, filters) => <TransactionsView filters={filters} state={state} />,
  },
  {
    id: 'research',
    label: 'Research',
    group: 'Research',
    filterSource: (state) => [
      ...state.knowledge.research,
      ...state.knowledge.theses,
      ...state.knowledge.decisions,
    ],
    render: (state, filters) => <ResearchView filters={filters} state={state} />,
  },
  {
    id: 'thesis',
    label: 'Thesis',
    group: 'Research',
    filterSource: (state) => state.knowledge.theses,
    render: (state, filters) => <ThesisView filters={filters} state={state} />,
  },
  {
    id: 'decisions',
    label: 'Decisions',
    group: 'Research',
    filterSource: (state) => state.knowledge.decisions,
    render: (state, filters) => <DecisionsView filters={filters} state={state} />,
  },
  {
    id: 'reviews',
    label: 'Reviews',
    group: 'Research',
    filterSource: (state) => state.process.reviews,
    render: (state, filters) => <ReviewsView filters={filters} state={state} />,
  },
  {
    id: 'journal',
    label: 'Journal',
    group: 'Research',
    filterSource: (state) => state.process.journal,
    render: (state, filters) => <JournalView filters={filters} state={state} />,
  },
  {
    id: 'plan',
    label: 'Plan',
    group: 'System',
    filterSource: (state) => state.plan.entries,
    render: (state, filters) => <PlanView filters={filters} state={state} />,
  },
  {
    id: 'market-data',
    label: 'Market data',
    group: 'System',
    filterSource: (state) => [
      ...state.market.prices,
      ...state.enrichment.prices,
      ...state.market.research,
    ],
    render: (state, filters) => <MarketView filters={filters} state={state} />,
  },
  {
    id: 'workspace',
    label: 'Workspace',
    group: 'System',
    render: (state) => <WorkspaceView state={state} />,
  },
  {
    id: 'diagnostics',
    label: 'Diagnostics',
    group: 'System',
    render: (state) => <DiagnosticsView state={state} />,
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
