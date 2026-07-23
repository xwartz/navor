import type { NavorRendererAppState, PlanEntry } from '@navor/contract'
import { useState } from 'react'

import { DiagnosticList } from '../components/DiagnosticList'
import { formatPercent } from '../components/format'
import { Panel } from '../components/Panel'
import { EmptyState, EntityCell, SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { hasActiveFilters, matchesFilters } from '../filters'
import { t } from '../i18n'

type PlanGroup = {
  subject: string
  current: PlanEntry
  history: PlanEntry[]
}

export function PlanView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const groups = groupPlanVersions(state.plan.entries, state.plan.current)
  const accountPlans = groups.filter(
    (group) => group.subject.startsWith('Account:') && matchesPlanFilters(group.current, filters),
  )
  const assetPlans = groups.filter(
    (group) =>
      group.subject.startsWith('Asset:') &&
      (matchesPlanFilters(group.current, filters) ||
        group.history.some((entry) => matchesPlanFilters(entry, filters))),
  )
  const visibleGroups = [...accountPlans, ...assetPlans]
  const actionPlans = groups.filter(
    (group) =>
      visibleGroups.includes(group) &&
      (group.current.actionWhenBelow || group.current.actionWhenAbove),
  ).length

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Set targets, allowed ranges, and actions for when a plan moves outside them."
        eyebrow="Controls"
        title="Plan"
      />

      <SummaryStrip
        items={[
          { label: 'Plans in use', value: String(visibleGroups.length) },
          { label: 'Plans with actions', value: String(actionPlans), tone: 'accent' },
          {
            label: 'Diagnostics',
            value: String(state.plan.diagnostics.length),
            tone: state.plan.diagnostics.length > 0 ? 'warning' : 'positive',
          },
        ]}
      />

      {visibleGroups.length === 0 ? (
        <EmptyState>{t('No plans match the current filters.')}</EmptyState>
      ) : (
        <div className="space-y-5">
          {accountPlans.length > 0 ? (
            <PlanGroupPanel
              description="Portfolio-level boundaries for each account sleeve."
              groups={accountPlans}
              title="Account allocation boundaries"
              variant="accounts"
            />
          ) : null}
          {assetPlans.length > 0 ? (
            <PlanGroupPanel
              description="Asset-specific actions and their revision history."
              filters={filters}
              groups={assetPlans}
              title="Asset plans"
              variant="assets"
            />
          ) : null}
        </div>
      )}

      {state.plan.diagnostics.length > 0 ? (
        <Panel title="Plan diagnostics">
          <DiagnosticList diagnostics={state.plan.diagnostics} />
        </Panel>
      ) : null}
    </div>
  )
}

function PlanGroupPanel({
  description,
  filters,
  groups,
  title,
  variant,
}: {
  description:
    | 'Portfolio-level boundaries for each account sleeve.'
    | 'Asset-specific actions and their revision history.'
  groups: PlanGroup[]
  filters?: ReaderFilters
  title: 'Account allocation boundaries' | 'Asset plans'
  variant: 'accounts' | 'assets'
}) {
  return (
    <Panel description={description} title={title}>
      <div
        className={
          variant === 'accounts' ? 'grid gap-3 md:grid-cols-2 2xl:grid-cols-4' : 'space-y-3'
        }
      >
        {groups.map((group) =>
          variant === 'accounts' ? (
            <AccountPlanCard group={group} key={group.subject} />
          ) : (
            <AssetPlanCard filters={filters} group={group} key={group.subject} />
          ),
        )}
      </div>
    </Panel>
  )
}

function AccountPlanCard({ group }: { group: PlanGroup }) {
  const { current } = group

  return (
    <article className="rounded-md bg-paper px-4 py-3.5 shadow-[0_1px_0_rgba(47,43,36,0.05)] ring-1 ring-border/80">
      <EntityCell subject={current.subject} title={current.title ?? current.subject} />
      <div className="mt-4 border-t border-border/65 pt-3">
        <PlanBounds entry={current} />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
        <span>{t('Rebalance')}</span>
        <span className="font-medium text-ink">{current.rebalance ?? t('No rule')}</span>
      </div>
    </article>
  )
}

function AssetPlanCard({ group, filters }: { group: PlanGroup; filters?: ReaderFilters }) {
  const { current, history } = group
  const historyMatchesFilters = Boolean(
    filters &&
      hasActiveFilters(filters) &&
      history.some((entry) => matchesPlanFilters(entry, filters)),
  )
  const [historyOpen, setHistoryOpen] = useState(historyMatchesFilters)
  const hasActions = current.actionWhenBelow || current.actionWhenAbove

  return (
    <article className="rounded-md bg-paper px-4 py-4 shadow-[0_1px_0_rgba(47,43,36,0.05)] ring-1 ring-border/80">
      <div className="grid gap-5 xl:grid-cols-[minmax(13rem,0.8fr)_minmax(18rem,1.15fr)_minmax(15rem,0.8fr)] xl:items-center">
        <div className="min-w-0">
          <EntityCell
            interactive
            subject={current.subject}
            title={current.title ?? current.subject}
          />
          <p className="mt-1 text-xs tabular-nums text-ink-faint">
            {t('Plan date')}: {current.date}
          </p>
        </div>

        <PlanBounds entry={current} />

        <div className="space-y-3 text-xs">
          {hasActions ? (
            <div className="grid grid-cols-2 gap-2">
              <PlanAction
                direction="Below"
                threshold={current.min}
                value={current.actionWhenBelow}
              />
              <PlanAction
                direction="Above"
                threshold={current.max}
                value={current.actionWhenAbove}
              />
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-ink-muted">
            <span>{t('Rebalance')}</span>
            <span className="font-medium text-ink">{current.rebalance ?? t('No rule')}</span>
          </div>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="mt-4 border-t border-border/60 pt-2">
          <button
            aria-expanded={historyOpen}
            className="inline-flex min-h-10 items-center rounded-md px-2 text-xs font-semibold text-accent transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-accent-soft"
            onClick={() => setHistoryOpen((open) => !open)}
            type="button"
          >
            {historyOpen
              ? t('Hide history')
              : `${t('Show history')} · ${history.length} ${t('revision')}`}
          </button>
          {historyOpen ? (
            <ol className="mt-2 divide-y divide-border/60 rounded-md border border-border/80 bg-paper-elevated">
              {history.map((entry) => (
                <li
                  className="grid gap-2 px-3 py-2.5 text-xs sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4"
                  key={`${entry.date}:${entry.subject}`}
                >
                  <span className="font-medium text-ink">{entry.title ?? entry.subject}</span>
                  <span className="tabular-nums text-ink-muted">{entry.date}</span>
                  <span className="tabular-nums text-ink-muted">
                    {formatPercent(entry.min)} / {formatPercent(entry.target)} /{' '}
                    {formatPercent(entry.max)}
                  </span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

function PlanBounds({ entry }: { entry: PlanEntry }) {
  const min = clamp(entry.min ?? entry.target ?? 0)
  const max = clamp(entry.max ?? entry.target ?? 100)
  const target = clamp(entry.target ?? (min + max) / 2)

  return (
    <dl className="grid grid-cols-2 divide-x divide-border/70 text-xs">
      <div className="min-w-0 pr-3">
        <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-ink-faint">
          {t('Target allocation')}
        </dt>
        <dd className="mt-1 text-lg font-semibold tracking-[-0.012em] tabular-nums text-ink">
          {formatPercent(target)}
        </dd>
      </div>
      <div className="min-w-0 pl-3">
        <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-ink-faint">
          {t('Allowed range')}
        </dt>
        <dd className="mt-1 whitespace-nowrap font-semibold tabular-nums text-ink">
          {formatPercent(min)} <span className="font-normal text-ink-muted">{t('to')}</span>{' '}
          {formatPercent(max)}
        </dd>
      </div>
    </dl>
  )
}

function PlanAction({
  direction,
  threshold,
  value,
}: {
  direction: 'Below' | 'Above'
  threshold: number | null
  value: string | null
}) {
  const boundary = threshold === null ? null : formatPercent(clamp(threshold))

  return (
    <div className="min-w-0 rounded-md bg-accent-soft px-3 py-2.5 text-accent-ink">
      <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-accent-ink/70">
        {t(direction)} {boundary}
      </p>
      <p className="mt-1 truncate font-semibold text-accent-ink">{value ?? t('No rule')}</p>
    </div>
  )
}

function groupPlanVersions(entries: PlanEntry[], currentEntries: PlanEntry[]): PlanGroup[] {
  const currentBySubject = new Map(currentEntries.map((entry) => [entry.subject, entry]))
  const bySubject = new Map<string, PlanEntry[]>()
  for (const entry of entries) {
    const versions = bySubject.get(entry.subject) ?? []
    versions.push(entry)
    bySubject.set(entry.subject, versions)
  }

  return [...bySubject.entries()]
    .map(([subject, versions]) => {
      const current = currentBySubject.get(subject)
      if (!current) return null
      const history = versions
        .filter((entry) => entry !== current)
        .sort((left, right) => right.date.localeCompare(left.date))
      return { subject, current, history }
    })
    .filter((group): group is PlanGroup => group !== null)
    .sort((left, right) => left.current.subject.localeCompare(right.current.subject))
}

function matchesPlanFilters(entry: PlanEntry, filters: ReaderFilters) {
  return matchesFilters(entry, filters) && (!filters.date || entry.date.includes(filters.date))
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, value))
}
