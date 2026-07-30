import type { NavorRendererAppState } from '@navor/contract'

import type { ReaderFilters } from './filters'
import type { ReaderView } from './navigation'
import { transactionType } from './transaction-type'

export interface ToolbarFacet {
  key: keyof Pick<ReaderFilters, 'subject' | 'tag' | 'date' | 'account' | 'type' | 'status'>
  label: 'Subject' | 'Tag' | 'Date' | 'Account' | 'Type' | 'Status'
  options: string[]
}

export interface ToolbarContext {
  mode: 'brief' | 'collection' | 'table'
  facets: ToolbarFacet[]
}

export type DiagnosticsToolbarTab = 'issues' | 'market' | 'sources'

export function getToolbarContext(
  view: ReaderView,
  state: NavorRendererAppState,
  diagnosticsTab: DiagnosticsToolbarTab = 'issues',
): ToolbarContext {
  const context = (mode: ToolbarContext['mode'], facets: ToolbarFacet[]): ToolbarContext => ({
    mode,
    facets: facets.filter((facet) => facet.options.length > 0),
  })

  switch (view) {
    case 'allocation':
      return context('table', [
        facet(
          'account',
          'Account',
          state.allocation.assets.flatMap((entry) => (entry.account ? [entry.account] : [])),
        ),
        facet(
          'subject',
          'Subject',
          state.allocation.assets.map((entry) => entry.subject),
        ),
      ])
    case 'holdings':
      return context('table', [
        facet(
          'account',
          'Account',
          state.dashboard.assetExecutions.flatMap((entry) =>
            entry.account ? [entry.account] : [],
          ),
        ),
        facet(
          'subject',
          'Subject',
          state.portfolio.holdings.map((entry) => entry.asset),
        ),
      ])
    case 'ledger':
      return context('table', [
        facet(
          'date',
          'Date',
          (state.portfolio.transactions ?? []).map((entry) => entry.date.slice(0, 7)),
        ),
        facet(
          'account',
          'Account',
          (state.portfolio.transactions ?? []).flatMap((entry) =>
            entry.postings.map((posting) => posting.account),
          ),
        ),
        facet('type', 'Type', (state.portfolio.transactions ?? []).map(transactionType)),
      ])
    case 'drift':
      return context('collection', [
        facet(
          'type',
          'Type',
          state.dashboard.actionInbox.map((entry) => entry.category),
        ),
        facet(
          'status',
          'Status',
          state.dashboard.actionInbox.map((entry) => entry.severity),
        ),
        facet(
          'subject',
          'Subject',
          state.dashboard.actionInbox.map((entry) => entry.subject),
        ),
      ])
    case 'watchlist':
      return context('table', [
        facet(
          'account',
          'Account',
          state.process.watchlist.map((entry) => entry.account ?? ''),
        ),
        facet(
          'subject',
          'Subject',
          state.process.watchlist.map((entry) => entry.subject),
        ),
        facet(
          'status',
          'Status',
          state.process.watchlist.map((entry) => watchlistStage(entry.subject, state)),
        ),
      ])
    case 'research':
      return context('table', [
        facet(
          'tag',
          'Tag',
          state.knowledge.research.flatMap((entry) => entry.tags),
        ),
        facet(
          'subject',
          'Subject',
          [
            ...state.knowledge.research,
            ...state.knowledge.theses,
            ...state.knowledge.decisions,
          ].map((entry) => entry.subject),
        ),
        facet(
          'date',
          'Date',
          [
            ...state.knowledge.research,
            ...state.knowledge.theses,
            ...state.knowledge.decisions,
          ].map((entry) => entry.date.slice(0, 7)),
        ),
      ])
    case 'reviews':
    case 'journal':
    case 'plan':
      return context('collection', [
        facet('subject', 'Subject', filterSubjects(view, state)),
        facet('date', 'Date', filterDates(view, state)),
        ...(view === 'reviews'
          ? [
              facet(
                'status',
                'Status',
                state.process.reviews.flatMap((entry) => (entry.status ? [entry.status] : [])),
              ),
            ]
          : []),
        ...(view === 'journal'
          ? [
              facet(
                'status',
                'Status',
                state.process.journal.map((entry) => entry.mood ?? ''),
              ),
            ]
          : []),
      ])
    case 'diagnostics':
      if (diagnosticsTab === 'issues') {
        return context('collection', [
          facet(
            'type',
            'Type',
            collectDiagnostics(state).flatMap((diagnostic) =>
              diagnostic.code ? [diagnostic.code] : [],
            ),
          ),
        ])
      }
      if (diagnosticsTab === 'sources') {
        return context('collection', [
          facet(
            'type',
            'Type',
            state.workspace.files.flatMap((file) =>
              sourceExtension(file) ? [sourceExtension(file)] : [],
            ),
          ),
        ])
      }
      return context('collection', [
        facet(
          'subject',
          'Subject',
          [...state.market.prices, ...state.enrichment.prices].map((entry) => entry.subject),
        ),
        facet('type', 'Type', marketProviders(state)),
        facet(
          'status',
          'Status',
          state.enrichment.prices.map((entry) => entry.status),
        ),
      ])
    default:
      return context('brief', [])
  }
}

function facet(
  key: ToolbarFacet['key'],
  label: ToolbarFacet['label'],
  values: string[],
): ToolbarFacet {
  return {
    key,
    label,
    options: [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right)),
  }
}

function filterSubjects(view: ReaderView, state: NavorRendererAppState) {
  if (view === 'reviews') return state.process.reviews.map((entry) => entry.subject)
  if (view === 'journal') return state.process.journal.map((entry) => entry.subject)
  return state.plan.entries.map((entry) => entry.subject)
}

function filterDates(view: ReaderView, state: NavorRendererAppState) {
  if (view === 'reviews') return state.process.reviews.map((entry) => entry.date.slice(0, 7))
  if (view === 'journal') return state.process.journal.map((entry) => entry.date.slice(0, 7))
  return state.plan.entries.map((entry) => entry.date.slice(0, 7))
}

function watchlistStage(subject: string, state: NavorRendererAppState) {
  if (!state.knowledge.research.some((item) => item.subject === subject)) return 'Capture evidence'
  if (!state.knowledge.theses.some((item) => item.subject === subject)) return 'Form thesis'
  if (!state.knowledge.decisions.some((item) => item.subject === subject)) return 'Decide'
  return 'Review case'
}

function marketProviders(state: NavorRendererAppState) {
  return [...state.market.prices, ...state.enrichment.prices].flatMap((entry) =>
    entry.provider ? [entry.provider] : [],
  )
}

function collectDiagnostics(state: NavorRendererAppState) {
  return [
    ...state.workspace.diagnostics,
    ...state.dashboard.diagnostics,
    ...state.portfolio.diagnostics,
    ...state.allocation.diagnostics,
    ...state.knowledge.diagnostics,
    ...state.plan.diagnostics,
    ...state.drift.diagnostics,
  ]
}

function sourceExtension(file: string) {
  const match = /\.[^./]+$/.exec(file)
  return match?.[0] ?? ''
}
