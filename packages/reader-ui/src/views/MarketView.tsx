import type { NavorRendererAppState } from '@navor/contract'

import { DataTable } from '../components/DataTable'
import { formatMoney, formatTimestamp } from '../components/format'
import { Panel } from '../components/Panel'
import { MoneyDelta } from '../components/PortfolioVisuals'
import { Chip, EntityCell, SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'

export function MarketView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const research = state.market.research.filter((item) => matchesFilters(item, filters))
  const staleOrMissing = state.enrichment.prices.filter((price) => price.status !== 'fresh')
  const priceBySubject = new Map(state.market.prices.map((price) => [price.subject, price]))
  const enrichmentBySubject = new Map(
    state.enrichment.prices.map((price) => [price.subject, price]),
  )
  const priceSubjects = [
    ...new Set([...priceBySubject.keys(), ...enrichmentBySubject.keys()]),
  ].filter((subject) =>
    matchesFilters(
      { ...priceBySubject.get(subject), ...enrichmentBySubject.get(subject), subject },
      filters,
    ),
  )

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Price coverage, freshness, and valuation inputs."
        eyebrow="Controls"
        title="Market data"
      />

      <SummaryStrip
        items={[
          { label: 'Tracked prices', value: String(state.market.prices.length) },
          {
            label: 'Needs attention',
            value: String(staleOrMissing.length),
            tone: staleOrMissing.length > 0 ? 'warning' : 'positive',
          },
          { label: 'Portfolio values', value: String(state.market.portfolioValues.length) },
          { label: 'Notes', value: String(state.market.research.length) },
        ]}
      />

      <Panel
        description="One row per asset, combining the valuation input with its freshness and source."
        title="Price coverage"
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
                asset: <EntityCell interactive subject={subject} />,
                price: formatMoney(marketPrice?.price),
                provider: enrichment?.provider ?? marketPrice?.provider ?? 'No provider',
                status: (
                  <div className="space-y-1">
                    <Chip tone={status === 'fresh' ? 'positive' : 'warning'}>{status}</Chip>
                    {enrichment?.message ? (
                      <p className="max-w-[28rem] text-xs leading-5 text-ink-faint">
                        {enrichment.message}
                      </p>
                    ) : null}
                  </div>
                ),
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

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
        <Panel
          description="Market value against carrying cost, using the covered prices above."
          title="Portfolio valuation"
        >
          <DataTable
            columns={[
              { key: 'asset', label: 'Asset', sortable: true, sticky: true },
              { key: 'market', label: 'Market', align: 'right', sortable: true },
              { key: 'cost', label: 'Cost', align: 'right', sortable: true },
              { key: 'pnl', label: 'PnL', align: 'right', sortable: true },
            ]}
            rows={state.market.portfolioValues.map((value) => ({
              id: value.subject,
              cells: {
                asset: <EntityCell interactive subject={value.subject} />,
                market: formatMoney(value.marketValue),
                cost: formatMoney(value.cost),
                pnl: <MoneyDelta value={value.pnlInMarketCurrency} />,
              },
              sortValues: {
                asset: value.subject,
                market: value.marketValue?.amount ?? 0,
                cost: value.cost?.amount ?? 0,
                pnl: value.pnl?.amount ?? 0,
              },
            }))}
          />
        </Panel>

        <Panel
          description="Recent evidence that may change assumptions, sizing, or timing."
          title="Market research"
        >
          {research.length === 0 ? (
            <p className="text-sm text-ink-muted">
              No market research matches the current filters.
            </p>
          ) : (
            <div className="divide-y divide-border border-y border-border/80">
              {research.map((item) => (
                <article className="py-3" key={`${item.date}:${item.subject}:${item.title}`}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-medium leading-5 text-ink">{item.title ?? item.subject}</h3>
                    <time className="shrink-0 text-xs tabular-nums text-ink-faint">
                      {item.date}
                    </time>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">{item.subject}</p>
                  {item.tags.length > 0 ? (
                    <p className="mt-2 text-xs text-ink-faint">{item.tags.join(' · ')}</p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </Panel>
      </section>
    </div>
  )
}
