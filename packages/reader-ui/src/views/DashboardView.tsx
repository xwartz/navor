import type { NavorRendererAppState } from '@navor/contract'

import { useAssetWorkspace } from '../asset-workspace-context'
import {
  buildPnlSummaryItem,
  convertToBaseCurrency,
  countOtherCurrencies,
  formatMoney,
  formatMoneyCompact,
  formatMoneyList,
  formatPercent,
  formatSignedPercent,
  groupMoneyValues,
  pickMoneyCurrency,
  sumMoneyInBase,
} from '../components/format'
import { Panel } from '../components/Panel'
import {
  DonutChart,
  ProgressMeter,
  WeightGap,
  weightGapScale,
} from '../components/PortfolioVisuals'
import {
  DestinationTabs,
  EmptyState,
  LabelCaps,
  SuccessCallout,
  SummaryStrip,
  ViewHeader,
} from '../components/ViewScaffold'
import { useEntityLabelIndex } from '../EntityLabelContext'
import { formatSubjectSublabel } from '../entity-labels'
import {
  formatDashboardActionInstruction,
  formatDashboardActionReason,
  formatMoreActions,
  formatOpenActionDetail,
  formatTargetBreachCount,
  t,
  translateText,
} from '../i18n'

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
  const realizedPnl = (state.portfolio.realizedPnl ?? []).map((entry) => entry.amount)
  const totalPnl = [...unrealizedPnl, ...realizedPnl]
  const pnlByCurrency = groupMoneyValues(totalPnl)
  const otherPnlCount = countOtherCurrencies(
    pnlByCurrency,
    pickMoneyCurrency(pnlByCurrency, state.drift.baseCurrency),
  )
  const unrealizedPnlItem = buildPnlSummaryItem({
    label: 'Unrealized PnL',
    values: unrealizedPnl,
    baseCurrency: state.drift.baseCurrency,
    fxRates: state.drift.fxRates,
    detailLabel: 'Open positions',
  })
  const realizedPnlItem = buildPnlSummaryItem({
    label: 'Realized PnL',
    values: realizedPnl,
    baseCurrency: state.drift.baseCurrency,
    fxRates: state.drift.fxRates,
    detailLabel: 'Closed positions',
    emptyAsZero: true,
  })

  const hasLiveValuation = state.drift.totalMarketValue !== null
  const investedCapital = groupMoneyValues(
    state.dashboard.accountExecutions.flatMap((account) => account.investedCost),
  )
  const investedInBase = sumMoneyInBase(
    state.dashboard.accountExecutions.flatMap((account) => account.investedCost),
    state.drift.baseCurrency,
    state.drift.fxRates,
  )
  const hasConvertedCapital = investedInBase.total !== null
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

  const headlineValue = hasLiveValuation
    ? displayedPortfolioValue
    : hasConvertedCapital
      ? investedInBase.total
      : null
  const actionDetail =
    urgentActionCount > 0 || dataActionCount > 0
      ? formatOpenActionDetail(urgentActionCount, dataActionCount)
      : openActionCount > 0
        ? t('Review queue')
        : t('Nothing requires action')

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Portfolio posture, target-range exceptions, and the next decisions to make."
        tabs={<DestinationTabs active="overview" counts={{ drift: openActionCount }} />}
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
            value: headlineValue
              ? formatMoneyCompact(headlineValue)
              : formatMoneyList(investedCapital),
            exactValue: headlineValue ? formatMoney(headlineValue) : undefined,
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
          unrealizedPnlItem,
          realizedPnlItem,
          {
            label: t('Open actions'),
            value: String(openActionCount),
            detail:
              offTrackAssets.length > 0
                ? `${actionDetail} · ${formatTargetBreachCount(offTrackAssets.length)}`
                : actionDetail,
            tone: openActionCount > 0 ? 'warning' : 'positive',
          },
        ]}
      />

      <section className="grid gap-5 @5xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] @5xl:items-start">
        <div className="space-y-5">
          <DecisionQueue
            actions={state.dashboard.actionInbox}
            openActionCount={openActionCount}
            onOpenAsset={openAsset}
            selectedAssetSubject={selectedAssetSubject}
          />
          <Panel
            description="Capital sleeves and current funding progress."
            title="Allocation posture"
          >
            <div className="@container">
              <div className="grid gap-5 @xl:grid-cols-[minmax(15rem,0.9fr)_minmax(0,1.1fr)] @xl:items-start">
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

                <div className="space-y-4 border-t border-border pt-4 @xl:border-t-0 @xl:border-l @xl:pt-0 @xl:pl-5">
                  <div className="flex items-center justify-between gap-3">
                    <LabelCaps>{t('Funding progress')}</LabelCaps>
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
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <LargestPositions onOpenAsset={openAsset} positions={topPositions} />

          <Panel description="Cash and PnL that affect deployable capital." title="Liquidity">
            <div className="space-y-5">
              <div>
                <LabelCaps className="mb-2">{t('Cash by currency')}</LabelCaps>
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
                  <LabelCaps className="mb-2">{t('PnL by currency')}</LabelCaps>
                  <CurrencyBreakdown
                    isDelta
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
  const scaleMax = weightGapScale(
    positions.flatMap(({ drift }) => [drift?.actualWeight, drift?.targetWeight, drift?.planMax]),
  )

  return (
    <Panel description="Dot is the actual weight; tick is the target." title="Largest positions">
      {positions.length === 0 ? (
        <EmptyState>{t('No exposure data.')}</EmptyState>
      ) : (
        <ul className="panel-bleed divide-y divide-border/50">
          {positions.map(({ drift, subject, title, value }) => {
            const weightSummary = drift
              ? `${t('Actual')} ${formatPercent(drift.actualWeight)} · ${t('Target')} ${formatPercent(
                  drift.targetWeight,
                )}`
              : t('Cost basis')

            return (
              <li key={subject}>
                <button
                  aria-haspopup="dialog"
                  className="grid w-full grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-x-4 gap-y-2 px-5 py-3 text-left transition-[background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-paper-subtle/60"
                  onClick={() => onOpenAsset(subject)}
                  title={weightSummary}
                  type="button"
                >
                  <span className="flex min-w-0 items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-ink">{title}</span>
                    <span className="shrink-0 text-sm tabular-nums text-ink-muted">
                      {formatMoney(value)}
                    </span>
                  </span>
                  <span className="text-right text-sm font-semibold tabular-nums text-ink">
                    {drift ? formatPercent(drift.actualWeight) : ''}
                  </span>
                  <span className="min-w-0">
                    {drift ? (
                      <WeightGap
                        actual={drift.actualWeight}
                        bandMax={drift.planMax}
                        bandMin={drift.planMin}
                        scaleMax={scaleMax}
                        target={drift.targetWeight}
                      />
                    ) : (
                      <span className="block text-xs text-ink-faint">{t('Cost basis')}</span>
                    )}
                  </span>
                  <span
                    className={`text-right text-xs font-medium tabular-nums ${
                      (drift?.drift ?? 0) > 0
                        ? 'text-danger'
                        : (drift?.drift ?? 0) < 0
                          ? 'text-warning'
                          : 'text-ink-faint'
                    }`}
                  >
                    {drift ? formatSignedPercent(drift.drift ?? 0) : ''}
                  </span>
                  <span className="sr-only">{weightSummary}</span>
                </button>
              </li>
            )
          })}
        </ul>
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
  const visibleActions = actions.slice(0, DECISION_QUEUE_LIMIT)
  const hiddenCount = openActionCount - visibleActions.length

  return (
    <Panel
      actions={
        openActionCount > 0 ? (
          <a
            className="-my-2 inline-flex min-h-10 items-center rounded-md px-2.5 text-xs font-semibold text-accent transition-[background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 [@media(hover:hover)]:hover:bg-accent-soft"
            href="#briefing/actions"
          >
            {hiddenCount > 0 ? formatMoreActions(hiddenCount) : t('View all')}
          </a>
        ) : undefined
      }
      description={
        openActionCount > 0
          ? 'Ranked by risk severity, portfolio exposure, and urgency.'
          : 'No target, execution, or data issue needs attention.'
      }
      title="Decision queue"
    >
      {actions.length === 0 ? (
        <SuccessCallout>{t('Nothing requires action')}</SuccessCallout>
      ) : (
        <ul className="panel-bleed divide-y divide-border/50">
          {visibleActions.map((item, index) => {
            const isSelected = selectedAssetSubject === item.subject

            return (
              <li key={item.id} title={item.subject}>
                <button
                  aria-current={isSelected ? 'true' : undefined}
                  aria-haspopup="dialog"
                  className={`grid w-full grid-cols-[1.75rem_minmax(0,1fr)_auto] items-start gap-3 px-5 py-3.5 text-left transition-[background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/35 ${
                    isSelected
                      ? 'bg-accent-soft/50 shadow-[inset_3px_0_0_0_var(--color-accent)]'
                      : '[@media(hover:hover)]:hover:bg-paper-subtle/60'
                  }`}
                  onClick={() => onOpenAsset(item.subject)}
                  type="button"
                >
                  <span className="pt-px font-mono text-xs tabular-nums text-ink-faint">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <h3 className="text-sm font-semibold text-ink">
                        {item.title ?? item.subject}
                      </h3>
                      <span className="label-caps">{actionCategoryLabel(item.category)}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-ink-muted">
                      {formatDashboardActionReason(item.reason)}
                    </p>
                    {item.action ? (
                      <p className="mt-1 text-xs font-medium text-accent-ink">
                        {formatDashboardActionInstruction(item.type)}
                      </p>
                    ) : null}
                  </div>
                  <SeverityChip severity={item.severity} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

const DECISION_QUEUE_LIMIT = 6

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
  isDelta = false,
  items,
  note,
}: {
  emptyMessage?: import('../i18n').MessageKey
  isDelta?: boolean
  items: Array<{ amount: number; currency: string }>
  note?: string
}) {
  if (items.length === 0) {
    return <EmptyState>{t(emptyMessage ?? 'No amounts recorded.')}</EmptyState>
  }

  return (
    <div className="space-y-2">
      <dl className="divide-y divide-border/50">
        {items.map((item) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_minmax(8rem,auto)] gap-3 py-2.5"
            key={item.currency}
          >
            <dt className="text-sm font-medium text-ink-muted">{item.currency}</dt>
            <dd
              className={`text-right text-sm font-semibold tabular-nums ${
                item.amount < 0
                  ? 'text-danger'
                  : isDelta && item.amount > 0
                    ? 'text-positive'
                    : 'text-ink'
              }`}
            >
              {formatMoney({ amount: item.amount, currency: item.currency })}
            </dd>
          </div>
        ))}
      </dl>
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
      className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${tone}`}
    >
      {label}
    </span>
  )
}
