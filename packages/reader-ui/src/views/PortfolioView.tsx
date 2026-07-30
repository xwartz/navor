import type { NavorRendererAppState } from '@navor/contract'
import { useState } from 'react'
import { useAssetWorkspace } from '../asset-workspace-context'
import { DataTable } from '../components/DataTable'
import {
  convertToBaseCurrency,
  countOtherCurrencies,
  formatMoney,
  formatPercent,
  groupMoneyValues,
  pickMoneyCurrency,
  sumMoneyInBase,
} from '../components/format'
import { Panel } from '../components/Panel'
import { MoneyDelta, RankedExposureList } from '../components/PortfolioVisuals'
import { QuantityCommodity } from '../components/QuantityCommodity'
import {
  EntityCell,
  PortfolioSectionNav,
  SummaryStrip,
  ViewHeader,
} from '../components/ViewScaffold'
import { useEntityLabelIndex } from '../EntityLabelContext'
import { formatSubjectSublabel, resolveEntityLabel } from '../entity-labels'
import type { ReaderFilters } from '../filters'
import { hasActiveFilters, matchesFilters } from '../filters'
import { formatPortfolioPositionCount, formatUnconvertedCurrencyCount, t } from '../i18n'

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
  const assetExecutionBySubject = new Map(
    state.dashboard.assetExecutions.map((asset) => [asset.subject, asset]),
  )
  const holdings = state.portfolio.holdings.filter(
    (holding) =>
      matchesFilters(holding, filters) &&
      (!filters.account || assetExecutionBySubject.get(holding.asset)?.account === filters.account),
  )
  const filtersActive = hasActiveFilters(filters)
  const holdingSubjects = new Set(holdings.map((holding) => holding.asset))
  const portfolioValues = state.market.portfolioValues.filter((value) =>
    holdingSubjects.has(value.subject),
  )
  const valueBySubject = new Map(
    state.market.portfolioValues.map((value) => [value.subject, value]),
  )
  const priceBySubject = new Map(state.market.prices.map((price) => [price.subject, price.price]))
  const holdingsByAccount = groupHoldingsByAccount(holdings, assetExecutionBySubject)
  const marketMix = calculateMarketMix(
    portfolioValues,
    state.drift.baseCurrency,
    state.drift.fxRates,
  )
  const weightBySubject = new Map(
    marketMix.values.map(({ source, amount }) => [
      source.subject,
      marketMix.total > 0 ? (amount / marketMix.total) * 100 : null,
    ]),
  )
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

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Current positions, cost, market value, and unrealized PnL."
        eyebrow="Portfolio"
        title="Holdings"
      />

      <PortfolioSectionNav active="holdings" />

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
        ]}
      />

      <Panel title="Market mix">
        <RankedExposureList
          items={marketMix.values.map(({ source, amount }) => ({
            id: source.subject,
            label:
              assetExecutionBySubject.get(source.subject)?.title ??
              source.subject.replace(/^Asset:/, ''),
            sublabel: formatSubjectSublabel(labelIndex, source.subject),
            value: marketMix.total > 0 ? (amount / marketMix.total) * 100 : 0,
          }))}
          limit={10}
          valueLabel="Weight"
        />
        {marketMix.unconvertedCurrencies.length > 0 ? (
          <p className="mt-3 text-xs text-ink-faint">
            {formatUnconvertedCurrencyCount(marketMix.unconvertedCurrencies.length)}
          </p>
        ) : null}
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
            priceBySubject={priceBySubject}
            valueBySubject={valueBySubject}
            weightBySubject={weightBySubject}
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
                    priceBySubject={priceBySubject}
                    valueBySubject={valueBySubject}
                    weightBySubject={weightBySubject}
                  />
                </div>
              </section>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}

export function calculateMarketMix(
  values: NavorRendererAppState['market']['portfolioValues'],
  baseCurrency: string | null,
  fxRates: Record<string, number>,
) {
  const currencies = new Set(values.map((value) => value.marketValue.currency))
  const comparisonCurrency = baseCurrency ?? (currencies.size === 1 ? [...currencies][0] : null)
  const unconvertedCurrencies = new Set<string>()

  if (!comparisonCurrency) {
    return {
      values: [],
      total: 0,
      unconvertedCurrencies: [...currencies],
    }
  }

  const convertedValues = values.flatMap((source) => {
    const converted = convertToBaseCurrency(source.marketValue, comparisonCurrency, fxRates)

    if (!converted) {
      unconvertedCurrencies.add(source.marketValue.currency)
      return []
    }

    return [{ source, amount: converted.amount }]
  })

  return {
    values: convertedValues,
    total: convertedValues.reduce((sum, value) => sum + value.amount, 0),
    unconvertedCurrencies: [...unconvertedCurrencies],
  }
}

function HoldingsTable({
  holdings,
  onOpenAsset,
  priceBySubject,
  valueBySubject,
  weightBySubject,
}: {
  holdings: NavorRendererAppState['portfolio']['holdings']
  onOpenAsset: (subject: string) => void
  priceBySubject: Map<string, NavorRendererAppState['market']['prices'][number]['price']>
  valueBySubject: Map<string, NavorRendererAppState['market']['portfolioValues'][number]>
  weightBySubject: Map<string, number | null>
}) {
  return (
    <DataTable
      columns={[
        { key: 'asset', label: 'Asset', sortable: true, sticky: true, hideable: false },
        { key: 'quantity', label: 'Quantity', align: 'right', mobileHidden: true, sortable: true },
        { key: 'price', label: 'Price', align: 'right', mobileHidden: true, sortable: true },
        {
          key: 'average',
          label: 'Average cost',
          align: 'right',
          mobileHidden: true,
          sortable: true,
        },
        { key: 'cost', label: 'Cost', align: 'right', sortable: true },
        { key: 'market', label: 'Market', align: 'right', sortable: true },
        { key: 'weight', label: 'Weight', align: 'right', mobileHidden: true, sortable: true },
        { key: 'pnl', label: 'PnL', align: 'right', sortable: true },
      ]}
      defaultSortDirection="asc"
      defaultSortKey="pnl"
      emptyMessage="No holdings match the current filters."
      onRowClick={(row) => onOpenAsset(row.id)}
      storageKey="holdings"
      rows={holdings.map((holding) => {
        const value = valueBySubject.get(holding.asset)
        const price = priceBySubject.get(holding.asset)
        const average =
          holding.cost && holding.quantity !== 0
            ? {
                amount: holding.cost.amount / Math.abs(holding.quantity),
                currency: holding.cost.currency,
              }
            : null

        return {
          id: holding.asset,
          cells: {
            asset: <EntityCell interactive meta={holding.commodity} subject={holding.asset} />,
            quantity: (
              <QuantityCommodity commodity={holding.commodity} quantity={holding.quantity} />
            ),
            price: formatMoney(price),
            average: formatMoney(average),
            cost: formatMoney(holding.cost),
            market: formatMoney(value?.marketValue),
            weight: formatPercent(weightBySubject.get(holding.asset) ?? null),
            pnl: <MoneyDelta value={value?.pnlInMarketCurrency} />,
          },
          sortValues: {
            asset: holding.asset,
            quantity: holding.quantity,
            price: price?.amount ?? 0,
            average: average?.amount ?? 0,
            cost: holding.cost?.amount ?? 0,
            market: value?.marketValue.amount ?? 0,
            weight: weightBySubject.get(holding.asset) ?? 0,
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
