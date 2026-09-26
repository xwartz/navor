import type { NavorRendererAppState } from '@navor/contract'
import type { ReactNode } from 'react'

import type { ReaderFilters } from './filters'
import type { MessageKey } from './i18n'
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

export type ReaderViewGroup = 'Portfolio' | 'Investment process' | 'Operations'
export interface ReaderViewDefinition {
  id: ReaderView
  route: string
  /** Former canonical routes that still resolve after a view moved under a destination. */
  aliases?: string[]
  label: MessageKey
  group: ReaderViewGroup
  /** Sidebar destination that owns this view as a section tab. */
  parent?: ReaderView
  /** Label inside the destination's section tabs, when it differs from `label`. */
  tabLabel?: MessageKey
  filterSource?: (state: NavorRendererAppState) => unknown[]
  render: (state: NavorRendererAppState, filters: ReaderFilters, liveEnabled: boolean) => ReactNode
}

export const READER_VIEW_CATALOG: ReaderViewDefinition[] = [
  {
    id: 'overview',
    route: 'briefing',
    label: 'Briefing',
    tabLabel: 'Summary',
    group: 'Portfolio',
    render: (state, _filters, live) => <DashboardView liveEnabled={live} state={state} />,
  },
  {
    id: 'drift',
    route: 'briefing/actions',
    aliases: ['actions'],
    label: 'Actions',
    group: 'Portfolio',
    parent: 'overview',
    filterSource: (state) => state.dashboard.actionInbox,
    render: (state, filters) => <DriftView filters={filters} state={state} />,
  },
  {
    id: 'holdings',
    route: 'portfolio',
    label: 'Portfolio',
    tabLabel: 'Positions',
    group: 'Portfolio',
    filterSource: (state) => state.portfolio.holdings,
    render: (state, filters) => <PortfolioView filters={filters} state={state} />,
  },
  {
    id: 'allocation',
    route: 'portfolio/allocation',
    label: 'Allocation',
    group: 'Portfolio',
    parent: 'holdings',
    filterSource: (state) => state.allocation.assets,
    render: (state, filters) => <AllocationView filters={filters} state={state} />,
  },
  {
    id: 'plan',
    route: 'portfolio/plans',
    aliases: ['plans'],
    label: 'Execution plans',
    tabLabel: 'Plans',
    group: 'Portfolio',
    parent: 'holdings',
    filterSource: (state) => state.plan.entries,
    render: (state, filters) => <PlanView filters={filters} state={state} />,
  },
  {
    id: 'accounts',
    route: 'portfolio/accounts',
    label: 'Accounts',
    group: 'Portfolio',
    parent: 'holdings',
    render: (state) => <AccountsView state={state} />,
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
    id: 'watchlist',
    route: 'cases/watchlist',
    aliases: ['watchlist'],
    label: 'Watchlist',
    group: 'Investment process',
    parent: 'research',
    filterSource: (state) => state.process.watchlist,
    render: (state, filters) => <WatchlistView filters={filters} state={state} />,
  },
  {
    id: 'reviews',
    route: 'reviews',
    label: 'Reviews & journal',
    tabLabel: 'Reviews',
    group: 'Investment process',
    filterSource: (state) => state.process.reviews,
    render: (state, filters) => <ReviewsView filters={filters} state={state} />,
  },
  {
    id: 'journal',
    route: 'reviews/journal',
    aliases: ['journal'],
    label: 'Journal',
    group: 'Investment process',
    parent: 'reviews',
    filterSource: (state) => state.process.journal,
    render: (state, filters) => <JournalView filters={filters} state={state} />,
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

/** The sidebar destination a view belongs to: itself, or the destination that hosts it as a tab. */
export function getDestinationView(id: ReaderView): ReaderView {
  return getReaderView(id).parent ?? id
}

/** Ordered section tabs for the destination that owns `id`; empty when it has no sibling views. */
export function getDestinationTabs(id: ReaderView) {
  const destination = getDestinationView(id)
  const members = READER_VIEW_CATALOG.filter(
    (view) => view.id === destination || view.parent === destination,
  )

  return members.length > 1
    ? members.map((view) => ({
        id: view.id,
        route: view.route,
        label: view.tabLabel ?? view.label,
      }))
    : []
}

export function matchReaderRoute(route: string): ReaderView | null {
  return (
    READER_VIEW_CATALOG.find((view) => view.route === route || view.aliases?.includes(route))?.id ??
    null
  )
}
