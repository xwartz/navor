import type { NavorRendererAppState } from '@navor/contract'

import { t } from '../i18n'
import { formatFxCoverage, formatTimestamp } from './format'

interface WorkspaceMetaBarProps {
  state: NavorRendererAppState
  liveEnabled: boolean
  loading: boolean
}

export function WorkspaceMetaBar({ state, liveEnabled, loading }: WorkspaceMetaBarProps) {
  const trackedCount = state.priceManifest.entries.filter((entry) => entry.yahooSymbol).length
  const freshCount = state.enrichment.prices.filter((price) => price.status === 'fresh').length
  const latestAsOf = state.enrichment.prices
    .map((price) => price.asOf)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1)
  const hasLiveValuation = state.drift.totalMarketValue !== null
  const fxCoverage = formatFxCoverage(state.drift.fxRates, state.drift.unconvertedCurrencies)
  const valuationMode =
    loading && trackedCount > 0
      ? t('Refreshing prices')
      : hasLiveValuation
        ? t('Live market value')
        : trackedCount > 0
          ? t('Cost basis')
          : t('Ledger only')

  return (
    <section
      aria-label={t('Workspace valuation status')}
      className="meta-scroll flex min-h-9 items-center gap-x-5 overflow-x-auto border-b border-white/8 bg-sidebar px-4 py-2 text-[11px] text-sidebar-muted lg:px-5"
    >
      <MetaItem label={t('Valuation')} value={valuationMode} />
      {trackedCount > 0 ? (
        <MetaItem
          label={t('Coverage')}
          value={
            liveEnabled
              ? `${freshCount}/${trackedCount} ${t('fresh')}`
              : `${trackedCount} ${t('tracked')}，${t('proxy off')}`
          }
        />
      ) : null}
      <MetaItem label={t('Base')} value={state.drift.baseCurrency ?? 'n/a'} />
      {fxCoverage ? <MetaItem label="FX" value={fxCoverage.replace(/^FX: /, '')} /> : null}
      {latestAsOf ? (
        <MetaItem
          label={t('Prices as of')}
          title={latestAsOf}
          value={formatTimestamp(latestAsOf)}
        />
      ) : null}
    </section>
  )
}

function MetaItem({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <p className="shrink-0 whitespace-nowrap tabular-nums" title={title}>
      <span className="font-semibold uppercase tracking-[0.09em] text-sidebar-muted/75">
        {label}
      </span>
      <span className="mx-1.5 text-white/20">·</span>
      <span className="text-sidebar-ink">{value}</span>
    </p>
  )
}
