import type { DashboardAssetExecution, NavorRendererAppState } from '@navor/contract'

import { type AssetWorkspaceIndex, buildAssetWorkspaceIndex } from '../asset-workspace'
import { useAssetWorkspace } from '../asset-workspace-context'
import { formatDecisionBriefLabel, formatReviewDeadline, t, translateText } from '../i18n'
import { formatMoney, formatPercent, formatQuantityCommodity } from './format'
import { Chip, TimelineFeed } from './ViewScaffold'

export function AssetDetailPanel({
  onClose,
  state,
  subject,
  variant = 'full',
}: {
  onClose: () => void
  state: NavorRendererAppState
  subject: string
  variant?: 'full' | 'compact'
}) {
  const { assetWorkspace, canOpenAsset, openAsset } = useAssetWorkspace()
  const facts = assetWorkspace.get(subject) ?? buildAssetWorkspaceIndex(state).get(subject)
  const asset = facts?.execution

  if (!asset) {
    return null
  }

  const accountTitle = asset.account
    ? (state.allocation.accounts.find((account) => account.subject === asset.account)?.title ??
      asset.account)
    : t('Unassigned')
  const timeline = buildTimeline(facts)
  const remainingBudget =
    asset.remainingBudget ?? (asset.status === 'not_started' ? asset.targetAmount : null)
  const isCompact = variant === 'compact'

  return (
    <section
      aria-label={formatDecisionBriefLabel(asset.title ?? asset.subject)}
      className={`@container ${isCompact ? 'px-3 pb-3 pt-2' : 'px-4 py-4'}`}
    >
      {isCompact ? null : (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              {t('Decision brief')}
            </p>
            <p className="mt-1 truncate text-xs text-ink-muted">{accountTitle}</p>
          </div>
          <button
            aria-label={t('Collapse decision brief')}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-sm text-ink-muted transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-paper [@media(hover:hover)]:hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden>⌃</span>
          </button>
        </div>
      )}

      <div className={`flex flex-wrap items-center gap-2 ${isCompact ? 'mb-3' : 'mb-4'}`}>
        <Chip tone={chipTone(asset.status)}>{statusLabel(asset.status)}</Chip>
        {isCompact ? (
          <p className="min-w-0 text-xs leading-5 text-ink-muted">
            {statusDescription(asset.status)}
          </p>
        ) : (
          <p className="min-w-0 text-sm text-ink-muted">{accountTitle}</p>
        )}
        {isCompact && canOpenAsset(subject) ? (
          <button
            aria-label={t('Open workspace')}
            className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-md text-sm text-accent transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 [@media(hover:hover)]:hover:bg-accent-soft [@media(hover:hover)]:hover:text-accent-ink"
            onClick={() => openAsset(subject)}
            type="button"
          >
            <span aria-hidden>↗</span>
          </button>
        ) : null}
      </div>

      {isCompact ? null : (
        <p className="mb-4 text-sm leading-6 text-ink-muted">{statusDescription(asset.status)}</p>
      )}

      <div className="grid grid-cols-2 border-y border-border">
        <AssetMetric label="Target" value={formatMoney(asset.targetAmount)} />
        <AssetMetric
          label="Invested"
          value={asset.investedCost ? formatMoney(asset.investedCost) : t('Not funded')}
        />
        <AssetMetric label="To deploy" value={formatMoney(remainingBudget)} />
        <AssetMetric label="Account weight" value={formatPercent(asset.target)} />
      </div>

      <div className={isCompact ? 'mt-3' : 'mt-4'}>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink">{t('Position')}</h3>
          {asset.drift !== null ? (
            <span className="text-xs tabular-nums text-ink-faint">
              {t('Drift')} {formatPercent(asset.drift)}
            </span>
          ) : null}
        </div>
        {asset.holding ? (
          <dl className="mt-2 grid grid-cols-1 gap-3 @min-[22rem]:grid-cols-3">
            <PositionFact
              label="Quantity"
              value={formatQuantityCommodity(asset.holding.quantity, asset.holding.commodity)}
            />
            <PositionFact label="Cost" value={formatMoney(asset.holding.cost)} />
            <PositionFact label="Market value" value={formatMoney(asset.marketValue)} />
          </dl>
        ) : (
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            {t(
              'No position exists yet. The full target remains available for the first transaction.',
            )}
          </p>
        )}
      </div>

      {timeline.length > 0 || !isCompact ? (
        <div className={`border-t border-border ${isCompact ? 'mt-3 pt-3' : 'mt-4 pt-4'}`}>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold text-ink">{t('Investment context')}</h3>
            <span className="text-xs tabular-nums text-ink-faint">
              {timeline.length} {t('linked')}
            </span>
          </div>
          {timeline.length > 0 ? (
            <div className="mt-3">
              <TimelineFeed items={timeline} />
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              {t('No research, thesis, or decision is linked to this asset yet.')}
            </p>
          )}
        </div>
      ) : null}
    </section>
  )
}

function AssetMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="asset-metric px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
        {translateText(label)}
      </p>
      <p className="mt-1 break-words text-sm font-semibold tabular-nums text-ink">{value}</p>
    </div>
  )
}

function PositionFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
        {translateText(label)}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium tabular-nums text-ink">{value}</dd>
    </div>
  )
}

function buildTimeline(facts: ReturnType<AssetWorkspaceIndex['get']>) {
  if (!facts) return []

  return [
    ...facts.research.map((item) => ({
      id: `research:${item.date}:${item.title}`,
      date: item.date,
      label: t('Research'),
      title: item.title ?? item.subject,
      subject: item.source,
    })),
    ...facts.theses.map((item) => ({
      id: `thesis:${item.date}:${item.title}`,
      date: item.date,
      label: t('Thesis'),
      title: item.title ?? item.subject,
      subject: item.reviewBy ? formatReviewDeadline(item.reviewBy) : item.status,
    })),
    ...facts.decisions.map((item) => ({
      id: `decision:${item.date}:${item.title}`,
      date: item.date,
      label: t('Decision'),
      title: item.title ?? item.subject,
      subject: item.action,
    })),
  ].sort((left, right) => right.date.localeCompare(left.date))
}

function chipTone(status: DashboardAssetExecution['status']) {
  if (status === 'above_max' || status === 'over_invested') {
    return 'danger' as const
  }

  if (status === 'below_min' || status === 'not_started' || status === 'currency_mismatch') {
    return 'warning' as const
  }

  return 'positive' as const
}

function statusLabel(status: DashboardAssetExecution['status']) {
  return status.replaceAll('_', ' ')
}

function statusDescription(status: DashboardAssetExecution['status']) {
  switch (status) {
    case 'not_started':
      return t('No transaction has been recorded against this target.')
    case 'building':
      return t('The position is funded but remains below its target amount.')
    case 'complete':
      return t('The position is aligned with its target amount.')
    case 'over_invested':
      return t('Invested cost exceeds the configured target amount.')
    case 'above_max':
      return t('Current portfolio weight is above the target range.')
    case 'below_min':
      return t('Current portfolio weight is below the target range.')
    case 'currency_mismatch':
      return t(
        'Target and invested cost use different currencies, so funding progress is not comparable.',
      )
  }
}
