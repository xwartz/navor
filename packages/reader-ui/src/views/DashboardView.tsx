import type { NavorRendererAppState } from '@navor/contract'

import { useAssetWorkspace } from '../asset-workspace-context'
import {
  convertToBaseCurrency,
  countOtherCurrencies,
  formatMoney,
  formatMoneyList,
  formatPercent,
  formatPnlCoverageDetail,
  formatSignedPercent,
  groupMoneyValues,
  pickMoneyCurrency,
  sumMoneyInBase,
} from '../components/format'
import { Panel } from '../components/Panel'
import { DonutChart, ProgressMeter } from '../components/PortfolioVisuals'
import { EmptyState, SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import { useEntityLabelIndex } from '../EntityLabelContext'
import { formatSubjectSublabel } from '../entity-labels'
import { formatDashboardActionReason, formatOpenActionDetail, t, translateText } from '../i18n'

export function DashboardView({
  state,
  liveEnabled = false,
}: {
  state: NavorRendererAppState
  liveEnabled?: boolean
}) {
  const labelIndex = useEntityLabelIndex()
  const { openAsset, selectedAssetSubject } = useAssetWorkspace()
  const offTrackAssets = state.dashboard.assetExecutions.filter(
    (asset) =>
      asset.status === 'above_max' ||
      asset.status === 'below_min' ||
      asset.status === 'over_invested' ||
      asset.status === 'currency_mismatch',
  )
  const unrealizedPnl = state.market.portfolioValues.map((value) => value.pnl)
  const totalPnl = [...unrealizedPnl, ...state.portfolio.realizedPnl.map((entry) => entry.amount)]
  const pnlByCurrency = groupMoneyValues(totalPnl)
  const primaryPnl = pickMoneyCurrency(pnlByCurrency, state.drift.baseCurrency)
  const otherPnlCount = countOtherCurrencies(pnlByCurrency, primaryPnl)

  const hasLiveValuation = state.drift.totalMarketValue !== null
  const investedCapital = groupMoneyValues(
    state.dashboard.accountExecutions.flatMap((account) => account.investedCost),
  )
  const investedInBase = sumMoneyInBase(
    state.dashboard.accountExecutions.flatMap((account) => account.investedCost),
    state.drift.baseCurrency,
    state.drift.fxRates,
  )
  const pnlInBase = sumMoneyInBase(totalPnl, state.drift.baseCurrency, state.drift.fxRates)
  const hasConvertedCapital = investedInBase.total !== null
  const hasConvertedPnl = pnlInBase.total !== null
  const displayedPnl = hasConvertedPnl ? pnlInBase.total : primaryPnl
  const hasFxRates = Object.keys(state.drift.fxRates ?? {}).length > 0
  const portfolioValueInBase = hasLiveValuation
    ? sumMoneyInBase(
        [state.drift.totalMarketValue, ...state.dashboard.cash].filter(
          (value): value is NonNullable<typeof value> => value !== null,
        ),
        state.drift.baseCurrency,
        state.drift.fxRates,
      )
    : { total: null, unconvertedCurrencies: [] }
  const displayedPortfolioValue = portfolioValueInBase.total ?? state.drift.totalMarketValue
  const openActionCount = state.dashboard.actionInbox.length
  const urgentActionCount = state.dashboard.actionInbox.filter(
    (item) => item.severity === 'high',
  ).length
  const dataActionCount = state.dashboard.actionInbox.filter((item) =>
    ['currency_mismatch', 'missing_price', 'stale_price', 'failed_price'].includes(item.type),
  ).length
  const driftBySubject = new Map(state.drift.entries.map((entry) => [entry.subject, entry]))
  const marketValueBySubject = new Map(
    state.market.portfolioValues.map((value) => [value.subject, value.marketValue]),
  )
  const titleBySubject = new Map(
    state.dashboard.assetExecutions.map((asset) => [asset.subject, asset.title]),
  )
  const topPositions = state.portfolio.holdings
    .flatMap((holding) => {
      const rawValue = marketValueBySubject.get(holding.asset) ?? holding.cost
      if (!rawValue) {
        return []
      }
      const value = convertToBaseCurrency(
        rawValue,
        state.drift.baseCurrency ?? rawValue.currency,
        state.drift.fxRates,
      )

      return value
        ? [
            {
              drift: driftBySubject.get(holding.asset),
              subject: holding.asset,
              title: titleBySubject.get(holding.asset) ?? holding.asset,
              value,
            },
          ]
        : []
    })
    .sort((left, right) => right.value.amount - left.value.amount)
    .slice(0, 5)

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Portfolio posture, target-range exceptions, and the next decisions to make."
        eyebrow="Monitor"
        title="Briefing"
      />

      <SummaryStrip
        items={[
          {
            label: portfolioValueInBase.total
              ? t('Portfolio value')
              : hasLiveValuation
                ? t('Holdings market value')
                : t('Invested capital'),
            value: hasLiveValuation
              ? formatMoney(displayedPortfolioValue)
              : hasConvertedCapital
                ? formatMoney(investedInBase.total)
                : formatMoneyList(investedCapital),
            detail: hasLiveValuation
              ? portfolioValueInBase.total
                ? `${t('Holdings + cash, converted to')} ${state.drift.baseCurrency}`
                : hasFxRates
                  ? `${t('Holdings only, base')} ${state.drift.baseCurrency}`
                  : state.drift.baseCurrency
                    ? `${t('Holdings only, base')} ${state.drift.baseCurrency}`
                    : t('Holdings only')
              : hasConvertedCapital
                ? `${t('Converted to')} ${state.drift.baseCurrency}`
                : investedCapital.length > 1
                  ? `${investedCapital.length} ${t('currencies, not converted')}`
                  : liveEnabled
                    ? t('Awaiting live prices')
                    : t('Cost basis until live prices load'),
          },
          {
            label: t('Total PnL'),
            value: formatMoney(displayedPnl),
            detail: formatPnlCoverageDetail({
              hasBaseTotal: hasConvertedPnl,
              unconvertedCurrencies: pnlInBase.unconvertedCurrencies,
              otherCurrencyCount: otherPnlCount,
            }),
            tone:
              !displayedPnl || displayedPnl.amount === 0
                ? 'neutral'
                : displayedPnl.amount > 0
                  ? 'positive'
                  : 'danger',
          },
          {
            label: t('Target-range breaches'),
            value: String(offTrackAssets.length),
            detail:
              offTrackAssets.length > 0
                ? t('Positions outside target range')
                : t('All positions within target range'),
            tone: offTrackAssets.length > 0 ? 'warning' : 'positive',
          },
          {
            label: t('Open actions'),
            value: String(openActionCount),
            detail:
              urgentActionCount > 0 && dataActionCount > 0
                ? formatOpenActionDetail(urgentActionCount, dataActionCount)
                : urgentActionCount > 0
                  ? formatOpenActionDetail(urgentActionCount, 0)
                  : dataActionCount > 0
                    ? formatOpenActionDetail(0, dataActionCount)
                    : openActionCount > 0
                      ? t('Review queue')
                      : t('Nothing requires action'),
            tone: openActionCount > 0 ? 'warning' : 'positive',
          },
        ]}
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:items-start">
        <div className="order-first space-y-5 xl:order-last">
          <DecisionQueue
            actions={state.dashboard.actionInbox}
            openActionCount={openActionCount}
            onOpenAsset={openAsset}
            selectedAssetSubject={selectedAssetSubject}
          />
          <LargestPositions onOpenAsset={openAsset} positions={topPositions} />
        </div>

        <div className="space-y-5">
          <Panel
            description="Capital sleeves and current funding progress."
            title="Allocation posture"
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(16rem,0.9fr)_minmax(0,1.1fr)] lg:items-start">
              <DonutChart
                centerLabel={t('Target')}
                centerValue="100%"
                compact
                items={state.dashboard.accountExecutions.map((account) => ({
                  id: account.subject,
                  label: account.title ?? account.subject,
                  sublabel: formatSubjectSublabel(labelIndex, account.subject),
                  value: account.target ?? 0,
                }))}
              />

              <div className="space-y-4 border-t border-border pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                    {t('Funding progress')}
                  </p>
                  <span className="text-xs text-ink-faint">
                    {state.dashboard.accountExecutions.length} {t('sleeves')}
                  </span>
                </div>
                {state.dashboard.accountExecutions.map((account) => (
                  <div key={account.subject}>
                    <div className="mb-2 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {account.title ?? account.subject}
                        </p>
                        <p className="text-xs text-ink-faint">
                          {formatMoneyList(account.investedCost)} /{' '}
                          {formatMoney(account.targetAmount)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm tabular-nums text-ink-muted">
                        {formatPercent(account.investedPercent)}
                      </span>
                    </div>
                    <ProgressMeter value={account.investedPercent} />
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel description="Cash and PnL that affect deployable capital." title="Liquidity">
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  {t('Cash by currency')}
                </p>
                <CurrencyBreakdown
                  emptyMessage="No cash balances."
                  items={state.dashboard.cash}
                  note={
                    hasFxRates
                      ? `${t('Converted through')} ${state.drift.baseCurrency}`
                      : t('FX required for a base total.')
                  }
                />
              </div>
              {otherPnlCount > 0 ? (
                <div className="border-t border-border pt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                    {t('PnL by currency')}
                  </p>
                  <CurrencyBreakdown
                    items={pnlByCurrency}
                    note={
                      state.drift.baseCurrency
                        ? `${t('Base currency:')} ${state.drift.baseCurrency}`
                        : undefined
                    }
                  />
                </div>
              ) : null}
            </div>
          </Panel>
        </div>
      </section>
    </div>
  )
}

function LargestPositions({
  onOpenAsset,
  positions,
}: {
  onOpenAsset: (subject: string) => void
  positions: Array<{
    drift: NavorRendererAppState['drift']['entries'][number] | undefined
    subject: string
    title: string
    value: { amount: number; currency: string }
  }>
}) {
  return (
    <Panel
      description="Largest marked positions, with the current allocation distance kept visible."
      title="Largest positions"
    >
      {positions.length === 0 ? (
        <EmptyState>{t('No exposure data.')}</EmptyState>
      ) : (
        <div className="divide-y divide-border/80">
          {positions.map(({ drift, subject, title, value }) => (
            <button
              aria-haspopup="dialog"
              className="grid min-h-14 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-2.5 text-left transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-paper"
              key={subject}
              onClick={() => onOpenAsset(subject)}
              type="button"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-xs tabular-nums text-ink-faint">
                  {drift
                    ? `${t('Actual')} ${formatPercent(drift.actualWeight)} · ${t(
                        'Target',
                      )} ${formatPercent(drift.targetWeight)}`
                    : t('Cost basis')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums text-ink">{formatMoney(value)}</p>
                {drift ? (
                  <p
                    className={`mt-0.5 text-xs font-medium tabular-nums ${
                      (drift.drift ?? 0) > 0
                        ? 'text-danger'
                        : (drift.drift ?? 0) < 0
                          ? 'text-warning'
                          : 'text-ink-faint'
                    }`}
                  >
                    {formatSignedPercent(drift.drift ?? 0)}
                  </p>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}
    </Panel>
  )
}

function DecisionQueue({
  actions,
  onOpenAsset,
  openActionCount,
  selectedAssetSubject,
}: {
  actions: NavorRendererAppState['dashboard']['actionInbox']
  onOpenAsset: (subject: string) => void
  openActionCount: number
  selectedAssetSubject: string | null
}) {
  return (
    <Panel
      description={
        openActionCount > 0
          ? 'Ranked by risk severity, portfolio exposure, and urgency.'
          : 'No target, execution, or data issue needs attention.'
      }
      title="Decision queue"
    >
      {actions.length === 0 ? (
        <div className="flex items-center gap-3 rounded-md bg-positive-soft px-3 py-3 text-sm text-accent-ink">
          <span aria-hidden className="h-2 w-2 rounded-full bg-positive" />
          {t('Nothing requires action')}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-paper-elevated">
            {actions.slice(0, 5).map((item, index) => {
              const isSelected = selectedAssetSubject === item.subject

              return (
                <div
                  className={
                    isSelected
                      ? 'bg-paper shadow-[inset_3px_0_0_0_var(--color-accent)]'
                      : '[@media(hover:hover)]:hover:bg-paper'
                  }
                  key={item.id}
                  title={item.subject}
                >
                  <button
                    aria-current={isSelected ? 'true' : undefined}
                    aria-haspopup="dialog"
                    className="flex w-full items-start gap-3 px-3 py-3 text-left transition-[background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:text-ink"
                    onClick={() => onOpenAsset(item.subject)}
                    type="button"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                        {t('Priority')} {index + 1} · {actionCategoryLabel(item.category)}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-ink">
                        {item.title ?? item.subject}
                      </h3>
                      <p className="mt-1 text-[11px] leading-5 text-ink-faint">
                        {formatDashboardActionReason(item.reason)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 pt-0.5">
                      <SeverityChip severity={item.severity} />
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-faint">
            <span>
              {openActionCount > 5 ? `${openActionCount - 5} ${t('more actions')}` : null}
            </span>
            <a
              className="inline-flex min-h-10 items-center rounded-md px-2.5 font-semibold text-accent transition-[background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 [@media(hover:hover)]:hover:bg-accent-soft"
              href="#actions"
            >
              {t('Action center')}
            </a>
          </div>
        </div>
      )}
    </Panel>
  )
}

function actionCategoryLabel(
  category: NavorRendererAppState['dashboard']['actionInbox'][number]['category'],
) {
  switch (category) {
    case 'investment_risk':
      return t('Investment risk')
    case 'data_integrity':
      return t('Data integrity')
    case 'process_due':
      return t('Process due')
  }
}

function CurrencyBreakdown({
  emptyMessage,
  items,
  note,
}: {
  emptyMessage?: import('../i18n').MessageKey
  items: Array<{ amount: number; currency: string }>
  note?: string
}) {
  if (items.length === 0) {
    return <EmptyState>{t(emptyMessage ?? 'No amounts recorded.')}</EmptyState>
  }

  return (
    <div className="space-y-3">
      <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-paper">
        {items.map((item) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_minmax(8rem,auto)] gap-3 px-3 py-2.5"
            key={item.currency}
          >
            <span className="text-sm font-medium text-ink">{item.currency}</span>
            <span
              className={`text-right text-sm font-semibold tabular-nums ${
                item.amount < 0
                  ? 'text-danger'
                  : item.amount > 0
                    ? 'text-positive'
                    : 'text-ink-muted'
              }`}
            >
              {formatMoney({ amount: item.amount, currency: item.currency })}
            </span>
          </div>
        ))}
      </div>
      {note ? <p className="text-xs leading-5 text-ink-faint">{note}</p> : null}
    </div>
  )
}

function SeverityChip({ severity }: { severity: 'high' | 'medium' | 'low' }) {
  const label = translateText(severity.charAt(0).toUpperCase() + severity.slice(1))
  const tone =
    severity === 'high'
      ? 'bg-danger-soft text-danger'
      : severity === 'medium'
        ? 'bg-warning-soft text-warning'
        : 'bg-paper-elevated text-ink'

  return (
    <span
      className={`inline-flex shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${tone}`}
    >
      {label}
    </span>
  )
}
