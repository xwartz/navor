import type { NavorDiagnostic, NavorRendererAppState } from '@navor/contract'

import { DataTable } from '../components/DataTable'
import { DiagnosticList } from '../components/DiagnosticList'
import { formatMoney, formatTimestamp, formatWorkspacePath } from '../components/format'
import { Panel } from '../components/Panel'
import { Chip, SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'
import { t } from '../i18n'
import { buildWorkspaceFileTree, formatWorkspaceFileTree } from '../workspace-file-tree'

export type HealthTab = 'issues' | 'market' | 'sources'

const HEALTH_TABS: Array<{ id: HealthTab; label: 'Issues' | 'Market coverage' | 'Source files' }> =
  [
    { id: 'issues', label: 'Issues' },
    { id: 'market', label: 'Market coverage' },
    { id: 'sources', label: 'Source files' },
  ]

export function DiagnosticsView({
  state,
  filters,
  activeTab,
  onActiveTabChange,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
  activeTab: HealthTab
  onActiveTabChange: (tab: HealthTab) => void
}) {
  const groups = [
    { label: 'Workspace', diagnostics: state.workspace.diagnostics },
    { label: 'Dashboard', diagnostics: state.dashboard.diagnostics },
    { label: 'Portfolio', diagnostics: state.portfolio.diagnostics },
    { label: 'Allocation', diagnostics: state.allocation.diagnostics },
    { label: 'Knowledge', diagnostics: state.knowledge.diagnostics },
    { label: 'Plan', diagnostics: state.plan.diagnostics },
    { label: 'Drift', diagnostics: state.drift.diagnostics },
  ]
  const diagnostics = groups.flatMap((group) =>
    group.diagnostics.map((diagnostic) => ({ ...diagnostic, group: group.label })),
  )
  const { type: provider, ...baseFilters } = filters
  const marketIssues = state.enrichment.prices.filter(
    (price) =>
      price.status !== 'fresh' &&
      matchesFilters(price, baseFilters) &&
      (!provider || price.provider === provider),
  )
  const priceBySubject = new Map(state.market.prices.map((price) => [price.subject, price]))
  const enrichmentBySubject = new Map(
    state.enrichment.prices.map((price) => [price.subject, price]),
  )
  const priceSubjects = [
    ...new Set([...priceBySubject.keys(), ...enrichmentBySubject.keys()]),
  ].filter((subject) => {
    const marketPrice = priceBySubject.get(subject)
    const enrichment = enrichmentBySubject.get(subject)
    return (
      matchesFilters({ subject, ...marketPrice, ...enrichment }, baseFilters) &&
      (!provider || (enrichment?.provider ?? marketPrice?.provider) === provider)
    )
  })
  const visibleDiagnostics = diagnostics.filter((diagnostic) =>
    matchesFilters({ ...diagnostic, type: diagnostic.code ?? 'Uncoded' }, filters),
  )
  const treeLines = formatWorkspaceFileTree(
    buildWorkspaceFileTree(
      state.workspace.files.map((file) => formatWorkspacePath(state.workspace.root, file)),
    ),
  )

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Input quality and source facts behind this reader. Investment and review actions stay in Actions."
        eyebrow="Operations"
        title="Data health"
      />

      <div
        aria-label="Health views"
        className="meta-scroll -mx-1 flex gap-1 overflow-x-auto border-b border-border/80 px-1 pb-3"
        role="tablist"
      >
        {HEALTH_TABS.map((tab) => {
          const selected = activeTab === tab.id
          return (
            <button
              aria-selected={selected}
              className={`press-scale min-h-10 shrink-0 rounded-md px-3 text-xs font-semibold transition-[background-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 ${selected ? 'bg-paper-elevated text-ink shadow-[inset_0_-1px_0_var(--color-accent)]' : 'text-ink-muted [@media(hover:hover)]:hover:bg-paper-elevated [@media(hover:hover)]:hover:text-ink'}`}
              key={tab.id}
              onClick={() => onActiveTabChange(tab.id)}
              role="tab"
              type="button"
            >
              {t(tab.label)}
            </button>
          )
        })}
      </div>

      <SummaryStrip
        items={
          activeTab === 'issues'
            ? [
                {
                  label: 'Data issues',
                  value: String(visibleDiagnostics.length),
                  tone: visibleDiagnostics.length > 0 ? 'warning' : 'positive',
                },
              ]
            : activeTab === 'market'
              ? [
                  {
                    label: 'Needs attention',
                    value: String(marketIssues.length),
                    tone: marketIssues.length > 0 ? 'warning' : 'positive',
                  },
                  { label: 'Tracked prices', value: String(priceSubjects.length) },
                ]
              : [{ label: 'Source files', value: String(state.workspace.files.length) }]
        }
      />

      {activeTab === 'issues' && (
        <Panel
          actions={
            <span className="text-xs tabular-nums text-ink-faint">{visibleDiagnostics.length}</span>
          }
          description="Resolve the source fact before it changes a decision or valuation."
          title="Data issues"
        >
          {visibleDiagnostics.length === 0 ? (
            <p className="text-sm text-ink-muted">{t('No health issues need attention.')}</p>
          ) : (
            <DiagnosticList diagnostics={visibleDiagnostics as NavorDiagnostic[]} />
          )}
        </Panel>
      )}

      {activeTab === 'market' && (
        <Panel
          description="One row per valuation input. A non-fresh quote is an input-quality issue, not a portfolio fact."
          title="Market coverage"
        >
          <DataTable
            columns={[
              { key: 'asset', label: 'Asset', sortable: true, sticky: true },
              { key: 'price', label: 'Price', align: 'right', sortable: true },
              { key: 'provider', label: 'Provider', sortable: true },
              { key: 'status', label: 'Status', sortable: true },
              { key: 'asOf', label: 'As of', align: 'right', sortable: true },
            ]}
            emptyMessage="No price records match the current filters."
            rows={priceSubjects.map((subject) => {
              const marketPrice = priceBySubject.get(subject)
              const enrichment = enrichmentBySubject.get(subject)
              const status = enrichment?.status ?? (marketPrice ? 'fresh' : 'missing')
              return {
                id: subject,
                cells: {
                  asset: subject,
                  price: formatMoney(marketPrice?.price),
                  provider: enrichment?.provider ?? marketPrice?.provider ?? 'No provider',
                  status: <Chip tone={status === 'fresh' ? 'positive' : 'warning'}>{status}</Chip>,
                  asOf: formatTimestamp(enrichment?.asOf ?? marketPrice?.asOf),
                },
                sortValues: {
                  asset: subject,
                  price: marketPrice?.price.amount ?? 0,
                  provider: enrichment?.provider ?? marketPrice?.provider ?? '',
                  status,
                  asOf: enrichment?.asOf ?? marketPrice?.asOf ?? '',
                },
              }
            })}
          />
        </Panel>
      )}

      {activeTab === 'sources' && (
        <Panel description="Directory tree under the workspace root." title="Source files">
          {treeLines.filter((line) =>
            matchesFilters({ type: sourceExtension(line), line }, filters),
          ).length === 0 ? (
            <p className="text-sm text-ink-muted">{t('No source files in this workspace.')}</p>
          ) : (
            <pre className="overflow-x-auto font-mono text-xs leading-5 text-ink-muted">
              {treeLines
                .filter((line) => matchesFilters({ type: sourceExtension(line), line }, filters))
                .join('\n')}
            </pre>
          )}
        </Panel>
      )}
    </div>
  )
}

function sourceExtension(file: string) {
  const match = /\.[^./]+$/.exec(file)
  return match?.[0] ?? ''
}
