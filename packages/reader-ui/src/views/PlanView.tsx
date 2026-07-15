import type { NavorRendererAppState } from '@navor/contract'

import { DataTable } from '../components/DataTable'
import { DiagnosticList } from '../components/DiagnosticList'
import { formatPercent } from '../components/format'
import { Panel } from '../components/Panel'
import { ProgressMeter } from '../components/PortfolioVisuals'
import { Chip, EntityCell, SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'

export function PlanView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const entries = state.plan.entries.filter((entry) => matchesFilters(entry, filters))
  const banded = state.plan.entries.filter((entry) => entry.min !== null || entry.max !== null)

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Targets, bands, and rebalance actions."
        eyebrow="Controls"
        title="Policy"
      />

      <SummaryStrip
        items={[
          { label: 'Rules', value: String(state.plan.entries.length) },
          { label: 'With bands', value: String(banded.length) },
          {
            label: 'Diagnostics',
            value: String(state.plan.diagnostics.length),
            tone: state.plan.diagnostics.length > 0 ? 'warning' : 'positive',
          },
          {
            label: 'Rebalance styles',
            value: String(new Set(state.plan.entries.map((entry) => entry.rebalance)).size),
          },
        ]}
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)]">
        <Panel title="Bands">
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={`${entry.date}:${entry.subject}:band`}>
                <div className="mb-2 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {entry.title ?? entry.subject}
                    </p>
                    <p className="text-xs text-ink-faint">
                      {formatPercent(entry.min)} - {formatPercent(entry.max)}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums text-ink-muted">
                    {formatPercent(entry.target)}
                  </span>
                </div>
                <ProgressMeter marker={entry.target} value={entry.max ?? entry.target} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Rules">
          <DataTable
            columns={[
              { key: 'asset', label: 'Asset', sortable: true, sticky: true },
              { key: 'date', label: 'Date', sortable: true },
              { key: 'target', label: 'Target', align: 'right', sortable: true },
              { key: 'band', label: 'Band', align: 'right', sortable: true },
              { key: 'trigger', label: 'Trigger' },
              { key: 'rebalance', label: 'Rebalance', sortable: true },
            ]}
            emptyMessage="No plan directives match the current filters."
            rows={entries.map((entry) => ({
              id: `${entry.date}:${entry.subject}`,
              cells: {
                asset: (
                  <EntityCell
                    interactive
                    subject={entry.subject}
                    title={entry.title ?? entry.subject}
                  />
                ),
                date: entry.date,
                target: formatPercent(entry.target),
                band: `${formatPercent(entry.min)} / ${formatPercent(entry.max)}`,
                trigger: (
                  <div className="space-y-1">
                    <TriggerChip label="Below" value={entry.actionWhenBelow} />
                    <TriggerChip label="Above" value={entry.actionWhenAbove} />
                  </div>
                ),
                rebalance: entry.rebalance ?? 'n/a',
              },
              sortValues: {
                asset: entry.title ?? entry.subject,
                date: entry.date,
                target: entry.target ?? 0,
                band: entry.min ?? 0,
                rebalance: entry.rebalance ?? '',
              },
            }))}
          />
        </Panel>
      </section>

      {state.plan.diagnostics.length > 0 ? (
        <Panel title="Plan diagnostics">
          <DiagnosticList diagnostics={state.plan.diagnostics} />
        </Panel>
      ) : null}
    </div>
  )
}

function TriggerChip({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-xs text-ink-faint">{label}</span>
      <Chip tone={value ? 'accent' : 'neutral'}>{value ?? 'No rule'}</Chip>
    </div>
  )
}
