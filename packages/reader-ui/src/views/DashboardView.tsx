import type { NavorRendererAppState } from '@navor/contract'

import { useAssetWorkspace } from '../asset-workspace-context'
import {
  countOtherCurrencies,
  formatMoney,
  formatMoneyList,
  formatPercent,
  formatPnlCoverageDetail,
  groupMoneyValues,
  pickMoneyCurrency,
  sumMoneyInBase,
} from '../components/format'
import { Panel } from '../components/Panel'
import { DonutChart, ProgressMeter } from '../components/PortfolioVisuals'
import {
  EmptyState,
  SubjectTicker,
  SummaryStrip,
  TimelineFeed,
  ViewHeader,
} from '../components/ViewScaffold'
import { useEntityLabelIndex } from '../EntityLabelContext'
import { formatSubjectSublabel } from '../entity-labels'
import {
  formatDashboardActionContext,
  formatDashboardActionReason,
  formatOpenActionDetail,
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
  const totalPnl = [...unrealizedPnl, ...state.portfolio.realizedPnl.map((entry) => entry.amount)]
  const pnlByCurrency = groupMoneyValues(totalPnl)
  const primaryPnl = pickMoneyCurrency(pnlByCurrency, state.drift.baseCurrency)
  const otherPnlCount = countOtherCurrencies(pnlByCurrency, primaryPnl)
  const recentKnowledge = [
    ...state.knowledge.research.map((item) => ({
      id: `research:${item.date}:${item.subject}:${item.title}`,
      date: item.date,
      label: t('Research'),
      title: item.title ?? item.subject,
      subject: item.subject,
      subjectDisplay: <SubjectTicker subject={item.subject} />,
    })),
    ...state.knowledge.theses.map((item) => ({
      id: `thesis:${item.date}:${item.subject}:${item.title}`,
      date: item.date,
      label: t('Thesis'),
      title: item.title ?? item.subject,
      subject: item.subject,
      subjectDisplay: <SubjectTicker subject={item.subject} />,
    })),
    ...state.knowledge.decisions.map((item) => ({
      id: `decision:${item.date}:${item.subject}:${item.title}`,
      date: item.date,
      label: t('Decision'),
      title: item.title ?? item.subject,
      subject: item.subject,
      subjectDisplay: <SubjectTicker subject={item.subject} />,
    })),
  ]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 6)

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

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Portfolio posture, target-range exceptions, and the next decisions to make."
        eyebrow="Command"
        title="Overview"
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

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
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

          <Panel description="Most recent capital movements in the ledger." title="Recent activity">
            {state.dashboard.recentTransactions.length === 0 ? (
              <EmptyState>{t('No transactions recorded.')}</EmptyState>
            ) : (
              <TimelineFeed
                items={state.dashboard.recentTransactions
                  .slice()
                  .sort((left, right) => right.date.localeCompare(left.date))
                  .slice(0, 5)
                  .map((transaction) => ({
                    id: `${transaction.date}:${transaction.subject}:${transaction.title}`,
                    date: transaction.date,
                    label: t('Transaction'),
                    title: transaction.title ?? transaction.subject,
                    subject: transaction.subject,
                    subjectDisplay: <SubjectTicker subject={transaction.subject} />,
                  }))}
              />
            )}
          </Panel>
        </div>

        <div className="order-first space-y-5 xl:order-last">
          <Panel
            description={
              openActionCount > 0
                ? 'Ranked by risk severity, portfolio exposure, and urgency.'
                : 'No target, execution, or data issue needs attention.'
            }
            title="Decision queue"
          >
            {state.dashboard.actionInbox.length === 0 ? (
              <div className="flex items-center gap-3 rounded-md bg-positive-soft px-3 py-3 text-sm text-accent-ink">
                <span aria-hidden className="h-2 w-2 rounded-full bg-positive" />
                {t('Nothing requires action')}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-paper-elevated">
                  {state.dashboard.actionInbox.slice(0, 5).map((item, index) => {
                    const isSelected = selectedAssetSubject === item.subject
                    const context = actionContext(item, state)

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
                          className="flex w-full items-start gap-2 px-3 py-3 text-left transition-[background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:text-ink"
                          onClick={() => openAsset(item.subject)}
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
                            {context ? (
                              <p className="mt-1 text-[11px] leading-5 tabular-nums text-ink-faint">
                                {context}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 items-center pt-0.5">
                            <SeverityChip severity={item.severity} />
                          </div>
                        </button>
                      </div>
                    )
                  })}
                </div>
                {openActionCount > 5 ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-faint">
                    <span>
                      {openActionCount - 5} {t('more actions')}
                    </span>
                    <div className="flex items-center gap-1">
                      <a
                        className="inline-flex min-h-10 items-center rounded-md px-2.5 font-semibold text-accent transition-[background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 [@media(hover:hover)]:hover:bg-accent-soft"
                        href="#drift"
                      >
                        {t('Review allocation drift')}
                      </a>
                      <a
                        className="inline-flex min-h-10 items-center rounded-md px-2.5 font-semibold text-accent transition-[background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 [@media(hover:hover)]:hover:bg-accent-soft"
                        href="#market-data"
                      >
                        {t('Check prices')}
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
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

          <Panel
            description="Evidence, theses, and decisions that may change posture."
            title="Latest updates"
          >
            <TimelineFeed items={recentKnowledge} emptyMessage="No knowledge events yet." />
          </Panel>
        </div>
      </section>
    </div>
  )
}

function actionContext(
  item: NavorRendererAppState['dashboard']['actionInbox'][number],
  state: NavorRendererAppState,
) {
  const asset = state.dashboard.assetExecutions.find((entry) => entry.subject === item.subject)

  if (!asset) {
    return null
  }

  if (item.type === 'over_invested' || item.type === 'currency_mismatch') {
    return formatDashboardActionContext(item.reason.kind, {
      invested: formatMoney(asset.investedCost),
      target: formatMoney(asset.targetAmount),
    })
  }

  if (item.type === 'above_max' || item.type === 'below_min') {
    return formatDashboardActionContext(item.reason.kind, {
      drift: formatPercent(asset.drift),
      target: formatPercent(asset.target),
    })
  }

  return null
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
