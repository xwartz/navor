import type { NavorRendererAppState } from '@navor/contract'
import { useState } from 'react'
import { useAssetWorkspace } from '../asset-workspace-context'
import { DataTable } from '../components/DataTable'
import {
  countOtherCurrencies,
  formatMoney,
  formatMoneyList,
  groupMoneyValues,
  pickMoneyCurrency,
  sumMoneyInBase,
} from '../components/format'
import { Panel } from '../components/Panel'
import { MoneyDelta, RankedExposureList } from '../components/PortfolioVisuals'
import { QuantityCommodity } from '../components/QuantityCommodity'
import { EntityCell, SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import { useEntityLabelIndex } from '../EntityLabelContext'
import { formatSubjectSublabel, resolveEntityLabel } from '../entity-labels'
import type { ReaderFilters } from '../filters'
import { hasActiveFilters, matchesFilters } from '../filters'
import {
  formatCurrencyCount,
  formatPortfolioPositionCount,
  formatUnconvertedCurrencyCount,
  t,
} from '../i18n'

export function PortfolioView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const [groupMode, setGroupMode] = useState<'all' | 'account'>('all')
  const { openAsset } = useAssetWorkspace()
  const labelIndex = useEntityLabelIndex()
  const holdings = state.portfolio.holdings.filter((holding) => matchesFilters(holding, filters))
  const filtersActive = hasActiveFilters(filters)
  const holdingSubjects = new Set(holdings.map((holding) => holding.asset))
  const portfolioValues = state.market.portfolioValues.filter((value) =>
    holdingSubjects.has(value.subject),
  )
  const realizedPnl = (state.portfolio.realizedPnl ?? []).filter((entry) =>
    matchesFilters(entry, filters),
  )
  const valueBySubject = new Map(
    state.market.portfolioValues.map((value) => [value.subject, value]),
  )
  const assetExecutionBySubject = new Map(
    state.dashboard.assetExecutions.map((asset) => [asset.subject, asset]),
  )
  const holdingsByAccount = groupHoldingsByAccount(holdings, assetExecutionBySubject)
  const totalMarketValue = portfolioValues.reduce((sum, value) => sum + value.marketValue.amount, 0)
  const costByCurrency = groupMoneyValues(holdings.map((holding) => holding.cost))
  const costInBase = sumMoneyInBase(
    holdings.map((holding) => holding.cost),
    state.drift.baseCurrency,
    state.drift.fxRates,
  )
  const marketValueInBase = sumMoneyInBase(
    portfolioValues.map((value) => value.marketValue),
    state.drift.baseCurrency,
    state.drift.fxRates,
  )
  const primaryCost =
    costInBase.total ?? pickMoneyCurrency(costByCurrency, state.drift.baseCurrency)
  const otherCostCount = costInBase.total
    ? costInBase.unconvertedCurrencies.length
    : countOtherCurrencies(costByCurrency, primaryCost)
  const realizedByCurrency = groupMoneyValues(realizedPnl.map((entry) => entry.amount))
  const realizedInBase = sumMoneyInBase(
    realizedPnl.map((entry) => entry.amount),
    state.drift.baseCurrency,
    state.drift.fxRates,
  )
  const primaryRealizedPnl =
    realizedInBase.total ?? pickMoneyCurrency(realizedByCurrency, state.drift.baseCurrency)
  const otherRealizedPnlCount = realizedInBase.total
    ? realizedInBase.unconvertedCurrencies.length
    : countOtherCurrencies(realizedByCurrency, primaryRealizedPnl)
  const cashInBase = sumMoneyInBase(
    state.portfolio.cash,
    state.drift.baseCurrency,
    state.drift.fxRates,
  )

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Positions, cash, cost, and PnL."
        eyebrow="Portfolio"
        title="Holdings"
      />

      <SummaryStrip
        items={[
          {
            label: t('Holdings'),
            value: String(holdings.length),
            detail: filtersActive
              ? formatPortfolioPositionCount(state.portfolio.holdings.length)
              : undefined,
          },
          {
            label: t('Cost basis'),
            value: formatMoney(primaryCost),
            detail:
              otherCostCount > 0
                ? formatUnconvertedCurrencyCount(otherCostCount)
                : costInBase.total
                  ? `${t('Converted to')} ${state.drift.baseCurrency}`
                  : undefined,
          },
          {
            label: t('Market value'),
            value: formatMoney(marketValueInBase.total),
            detail: marketValueInBase.total
              ? `${t('Converted to')} ${state.drift.baseCurrency}`
              : undefined,
          },
          {
            label: t('Realized PnL'),
            value: formatMoney(primaryRealizedPnl),
            detail:
              otherRealizedPnlCount > 0
                ? formatUnconvertedCurrencyCount(otherRealizedPnlCount)
                : undefined,
          },
          {
            label: t('Cash'),
            value: cashInBase.total
              ? formatMoney(cashInBase.total)
              : formatMoneyList(state.portfolio.cash),
            detail: cashInBase.total
              ? `${t('Portfolio total, converted to')} ${state.drift.baseCurrency}`
              : formatCurrencyCount(state.portfolio.cash.length),
          },
        ]}
      />

      <Panel title="Market mix">
        <RankedExposureList
          items={portfolioValues.map((value) => ({
            id: value.subject,
            label:
              assetExecutionBySubject.get(value.subject)?.title ??
              value.subject.replace(/^Asset:/, ''),
            sublabel: formatSubjectSublabel(labelIndex, value.subject),
            value: totalMarketValue > 0 ? (value.marketValue.amount / totalMarketValue) * 100 : 0,
          }))}
          limit={10}
          valueLabel="Weight"
        />
      </Panel>

      <Panel
        actions={
          <fieldset className="flex rounded-md bg-paper p-0.5 ring-1 ring-border">
            <legend className="sr-only">{t('Position grouping')}</legend>
            <PositionGroupButton active={groupMode === 'all'} onClick={() => setGroupMode('all')}>
              {t('All')}
            </PositionGroupButton>
            <PositionGroupButton
              active={groupMode === 'account'}
              onClick={() => setGroupMode('account')}
            >
              {t('By account')}
            </PositionGroupButton>
          </fieldset>
        }
        description="One working table for quantity, cost, market value, and PnL. Losses appear first."
        title="Positions"
      >
        {groupMode === 'all' ? (
          <HoldingsTable
            holdings={holdings}
            onOpenAsset={openAsset}
            valueBySubject={valueBySubject}
          />
        ) : (
          <div className="space-y-4">
            {[...holdingsByAccount.entries()].map(([account, accountHoldings]) => (
              <section
                className="overflow-hidden rounded-md border border-border bg-paper"
                key={account}
              >
                <div className="border-b border-border bg-paper-elevated px-4 py-3">
                  <h3 className="text-sm font-semibold text-ink">
                    {account === 'Unassigned'
                      ? t('Unassigned')
                      : resolveEntityLabel(labelIndex, account).title}
                  </h3>
                  <p className="mt-1 text-xs text-ink-faint">
                    {accountHoldings.length} {t('positions')}
                  </p>
                </div>
                <div className="p-3">
                  <HoldingsTable
                    holdings={accountHoldings}
                    onOpenAsset={openAsset}
                    valueBySubject={valueBySubject}
                  />
                </div>
              </section>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Realized PnL">
        <DataTable
          columns={[
            { key: 'date', label: 'Date', sortable: true, sticky: true },
            { key: 'asset', label: 'Asset', sortable: true },
            { key: 'title', label: 'Transaction', sortable: true },
            { key: 'amount', label: 'Realized', align: 'right', sortable: true },
          ]}
          emptyMessage="No realized gains or losses recorded yet."
          rows={realizedPnl.map((entry) => ({
            id: `${entry.date}:${entry.asset}:${entry.title ?? ''}:${entry.amount.amount}`,
            cells: {
              date: entry.date,
              asset: <EntityCell interactive subject={entry.asset} />,
              title: entry.title ?? 'n/a',
              amount: formatMoney(entry.amount),
            },
            sortValues: {
              date: entry.date,
              asset: entry.asset,
              title: entry.title ?? '',
              amount: entry.amount.amount,
            },
          }))}
        />
      </Panel>

      <section className="grid gap-5 lg:grid-cols-3">
        <Panel title="Cash">
          <DataTable
            columns={[
              { key: 'currency', label: 'Currency', sortable: true, sticky: true },
              { key: 'amount', label: 'Amount', align: 'right', sortable: true },
            ]}
            rows={state.portfolio.cash.map((balance) => ({
              id: balance.currency,
              cells: {
                currency: balance.currency,
                amount: balance.amount.toLocaleString(),
              },
              sortValues: {
                currency: balance.currency,
                amount: balance.amount,
              },
            }))}
          />
        </Panel>
        <Panel title="Income">
          <FlowTable flows={state.portfolio.income} />
        </Panel>
        <Panel title="Expenses">
          <FlowTable flows={state.portfolio.expenses} />
        </Panel>
      </section>
    </div>
  )
}

function FlowTable({ flows }: { flows: NavorRendererAppState['portfolio']['income'] }) {
  if (flows.length === 0) {
    return <p className="text-sm text-ink-muted">{t('No flows recorded.')}</p>
  }

  return (
    <DataTable
      columns={[
        { key: 'account', label: 'Account', sortable: true, sticky: true },
        { key: 'amount', label: 'Amount', align: 'right', sortable: true },
      ]}
      rows={flows.map((flow) => ({
        id: `${flow.account}:${flow.amount}:${flow.currency}`,
        cells: {
          account: <EntityCell subject={flow.account} />,
          amount: `${flow.amount} ${flow.currency}`,
        },
        sortValues: {
          account: flow.account,
          amount: flow.amount,
        },
      }))}
    />
  )
}

function HoldingsTable({
  holdings,
  onOpenAsset,
  valueBySubject,
}: {
  holdings: NavorRendererAppState['portfolio']['holdings']
  onOpenAsset: (subject: string) => void
  valueBySubject: Map<string, NavorRendererAppState['market']['portfolioValues'][number]>
}) {
  return (
    <DataTable
      columns={[
        { key: 'asset', label: 'Asset', sortable: true, sticky: true },
        { key: 'quantity', label: 'Quantity', align: 'right', mobileHidden: true, sortable: true },
        { key: 'cost', label: 'Cost', align: 'right', sortable: true },
        { key: 'market', label: 'Market', align: 'right', sortable: true },
        { key: 'pnl', label: 'PnL', align: 'right', sortable: true },
      ]}
      defaultSortDirection="asc"
      defaultSortKey="pnl"
      emptyMessage="No holdings match the current filters."
      onRowClick={(row) => onOpenAsset(row.id)}
      rows={holdings.map((holding) => {
        const value = valueBySubject.get(holding.asset)

        return {
          id: holding.asset,
          cells: {
            asset: <EntityCell interactive meta={holding.commodity} subject={holding.asset} />,
            quantity: (
              <QuantityCommodity commodity={holding.commodity} quantity={holding.quantity} />
            ),
            cost: formatMoney(holding.cost),
            market: formatMoney(value?.marketValue),
            pnl: <MoneyDelta value={value?.pnl} />,
          },
          sortValues: {
            asset: holding.asset,
            quantity: holding.quantity,
            cost: holding.cost?.amount ?? 0,
            market: value?.marketValue.amount ?? 0,
            pnl: value?.pnl?.amount ?? 0,
          },
        }
      })}
    />
  )
}

function PositionGroupButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: string
  onClick: () => void
}) {
  return (
    <button
      aria-pressed={active}
      className={`h-10 rounded-[3px] px-2.5 text-xs font-semibold transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 ${
        active
          ? 'bg-paper-elevated text-ink shadow-[0_1px_2px_rgba(17,19,24,0.08)]'
          : 'text-ink-muted [@media(hover:hover)]:hover:text-ink'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function groupHoldingsByAccount(
  holdings: NavorRendererAppState['portfolio']['holdings'],
  assetExecutionBySubject: Map<
    string,
    NavorRendererAppState['dashboard']['assetExecutions'][number]
  >,
) {
  const groups = new Map<string, NavorRendererAppState['portfolio']['holdings']>()

  for (const holding of holdings) {
    const account = assetExecutionBySubject.get(holding.asset)?.account ?? 'Unassigned'
    const existing = groups.get(account) ?? []
    existing.push(holding)
    groups.set(account, existing)
  }

  return groups
}
