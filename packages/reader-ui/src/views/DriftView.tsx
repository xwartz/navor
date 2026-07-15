import type { DriftEntry, NavorRendererAppState } from '@navor/contract'

import { DiagnosticList } from '../components/DiagnosticList'
import {
  driftStatusLabel,
  formatMoney,
  formatPercent,
  formatSignedPercent,
} from '../components/format'
import { Panel } from '../components/Panel'
import { EntityCell, SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'
import { t } from '../i18n'

export function DriftView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const entries = state.drift.entries
    .filter((entry) => matchesFilters(entry, filters))
    .sort((left, right) => Math.abs(right.drift ?? 0) - Math.abs(left.drift ?? 0))
  const offBand = state.drift.entries.filter(
    (entry) => entry.status === 'above_max' || entry.status === 'below_min',
  )
  const hasFxRates = Object.keys(state.drift.fxRates ?? {}).length > 0
  const maxAbsDrift = Math.max(1, ...entries.map((entry) => Math.abs(entry.drift ?? 0)))

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Sorted by distance from target. Bars grow from center: right is overweight, left is underweight."
        eyebrow="Command"
        title="Drift"
      />

      <SummaryStrip
        items={[
          { label: 'Base currency', value: state.drift.baseCurrency ?? 'n/a' },
          {
            label: 'Market value',
            value: formatMoney(state.drift.totalMarketValue),
            detail:
              (state.drift.unconvertedCurrencies ?? []).length > 0
                ? `${(state.drift.unconvertedCurrencies ?? []).length} unconverted ${
                    (state.drift.unconvertedCurrencies ?? []).length === 1
                      ? 'currency'
                      : 'currencies'
                  }`
                : hasFxRates
                  ? 'Converted via FX'
                  : undefined,
          },
          {
            label: 'Off band',
            value: String(offBand.length),
            tone: offBand.length > 0 ? 'warning' : 'positive',
          },
          {
            label: 'Diagnostics',
            value: String(state.drift.diagnostics.length),
            tone: state.drift.diagnostics.length > 0 ? 'warning' : 'positive',
          },
        ]}
      />

      <Panel title="Distance from target">
        {entries.length === 0 ? (
          <p className="text-sm text-ink-muted">
            {t('No drift entries match the current filters.')}
          </p>
        ) : (
          <div className="min-w-0">
            <div className="hidden grid-cols-[minmax(0,1fr)_11rem_minmax(8rem,1fr)] gap-x-8 border-b border-border/70 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint lg:grid">
              <span>{t('Asset')}</span>
              <span>{t('Drift')}</span>
              <span className="text-right">{hasFxRates ? 'Value (base)' : 'Value'}</span>
            </div>
            <ul className="divide-y divide-border/60">
              {entries.map((entry) => (
                <DriftRow
                  entry={entry}
                  key={entry.subject}
                  maxAbsDrift={maxAbsDrift}
                  valueLabel={formatOverviewMoney(entry.marketValueInBase ?? entry.marketValue)}
                />
              ))}
            </ul>
          </div>
        )}
      </Panel>

      {state.drift.diagnostics.length > 0 ? (
        <Panel title="Drift diagnostics">
          <DiagnosticList diagnostics={state.drift.diagnostics} />
        </Panel>
      ) : null}
    </div>
  )
}

function DriftRow({
  entry,
  maxAbsDrift,
  valueLabel,
}: {
  entry: DriftEntry
  maxAbsDrift: number
  valueLabel: string
}) {
  const drift = entry.drift
  const offBand = entry.status === 'above_max' || entry.status === 'below_min'

  return (
    <li className="grid grid-cols-1 gap-2 py-2.5 lg:grid-cols-[minmax(0,1fr)_11rem_minmax(8rem,1fr)] lg:items-center lg:gap-x-8">
      <div className="min-w-0">
        <EntityCell interactive subject={entry.subject} title={entry.title ?? entry.subject} />
        <p className="mt-0.5 truncate text-xs tabular-nums text-ink-faint">
          {formatPercent(entry.actualWeight)}
          <span className="mx-1 opacity-70">→</span>
          {formatPercent(entry.targetWeight)}
          {offBand ? (
            <span className={`ml-2 font-medium ${bandTextClass(entry.status)}`}>
              {driftStatusLabel(entry.status)}
            </span>
          ) : null}
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <DivergingDriftBar drift={drift} maxAbs={maxAbsDrift} />
        <p
          className={`w-[3.75rem] shrink-0 text-right text-sm font-semibold tabular-nums ${driftTextClass(drift)}`}
        >
          {formatSignedPercent(drift)}
        </p>
      </div>

      <p className="text-sm tabular-nums text-ink-muted lg:text-right">{valueLabel}</p>
    </li>
  )
}

function DivergingDriftBar({ drift, maxAbs }: { drift: number | null; maxAbs: number }) {
  const value = drift ?? 0
  const magnitude = Math.abs(value)
  const halfWidthPct = maxAbs <= 0 ? 0 : Math.min((magnitude / maxAbs) * 50, 50)
  const isQuiet = magnitude <= 0.05

  return (
    <div
      aria-hidden
      className="relative h-2 w-24 shrink-0 rounded-full bg-paper"
      role="presentation"
    >
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border-strong/80" />
      {!isQuiet && value > 0 ? (
        <div
          className="absolute inset-y-0 left-1/2 rounded-r-full bg-danger"
          style={{ width: `${halfWidthPct}%` }}
        />
      ) : null}
      {!isQuiet && value < 0 ? (
        <div
          className="absolute inset-y-0 right-1/2 rounded-l-full bg-warning"
          style={{ width: `${halfWidthPct}%` }}
        />
      ) : null}
    </div>
  )
}

function formatOverviewMoney(value: { amount: number; currency: string } | null | undefined) {
  if (!value) {
    return 'n/a'
  }

  const magnitude = Math.abs(value.amount)
  const amount =
    magnitude > 0 && magnitude < 1
      ? value.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : value.amount.toLocaleString(undefined, {
          maximumFractionDigits: magnitude >= 100 ? 0 : 1,
        })

  return `${amount} ${value.currency}`
}

function driftTextClass(drift: number | null) {
  if (drift === null || Math.abs(drift) <= 1) {
    return 'text-ink-muted'
  }
  return drift > 0 ? 'text-danger' : 'text-warning'
}

function bandTextClass(status: DriftEntry['status']) {
  if (status === 'above_max') {
    return 'text-danger'
  }
  if (status === 'below_min') {
    return 'text-warning'
  }
  return 'text-ink-muted'
}
