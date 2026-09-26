import type { NavorRendererAppState } from '@navor/contract'

import { t } from '../i18n'
import { formatFxCoverage, formatTimestamp } from './format'

interface WorkspaceStatusProps {
  state: NavorRendererAppState
  liveEnabled: boolean
  loading: boolean
  isRail?: boolean
}

type StatusTone = 'live' | 'partial' | 'offline'

const DOT_TONE: Record<StatusTone, string> = {
  live: 'bg-accent shadow-[0_0_0_3px_oklch(0.715_0.115_155/0.18)]',
  partial: 'bg-warning shadow-[0_0_0_3px_oklch(0.785_0.135_82/0.16)]',
  offline: 'bg-sidebar-muted/60',
}

export function WorkspaceStatus({
  state,
  liveEnabled,
  loading,
  isRail = false,
}: WorkspaceStatusProps) {
  const trackedCount = state.priceManifest.entries.filter((entry) => entry.yahooSymbol).length
  const freshCount = state.enrichment.prices.filter((price) => price.status === 'fresh').length
  const latestAsOf = state.enrichment.prices
    .map((price) => price.asOf)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1)
  const hasLiveValuation = state.drift.totalMarketValue !== null
  const fxCoverage = formatFxCoverage(state.drift.fxRates, state.drift.unconvertedCurrencies)
  const isRefreshing = loading && trackedCount > 0
  const valuationMode = isRefreshing
    ? t('Refreshing prices')
    : hasLiveValuation
      ? t('Live market value')
      : trackedCount > 0
        ? t('Cost basis')
        : t('Ledger only')
  const tone: StatusTone = isRefreshing
    ? 'partial'
    : hasLiveValuation && liveEnabled
      ? freshCount >= trackedCount
        ? 'live'
        : 'partial'
      : 'offline'
  const coverage =
    trackedCount === 0
      ? null
      : liveEnabled
        ? `${freshCount}/${trackedCount} ${t('fresh')}`
        : `${trackedCount} ${t('tracked')}，${t('proxy off')}`
  const pricing = [coverage, latestAsOf ? formatTimestamp(latestAsOf) : null]
    .filter(Boolean)
    .join(' · ')
  const currency = [
    state.drift.baseCurrency ? `${t('Base')} ${state.drift.baseCurrency}` : null,
    fxCoverage ? fxCoverage.replace(/^(FX: |汇率 )/, '') : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const summary = [valuationMode, pricing, currency].filter(Boolean).join('\n')

  return (
    <section aria-label={t('Workspace valuation status')} className="min-w-0" title={summary}>
      <div className={`min-w-0 ${isRail ? 'lg:hidden' : ''}`}>
        <p className="flex items-center gap-2 text-xs font-semibold text-sidebar-ink">
          <StatusDot isPulsing={isRefreshing} tone={tone} />
          <span className="truncate">{valuationMode}</span>
        </p>
        <dl className="mt-1.5 space-y-0.5 pl-3.5 text-[11px] leading-4 tabular-nums text-sidebar-muted">
          {pricing ? (
            <div>
              <dt className="sr-only">{t('Prices as of')}</dt>
              <dd className="truncate">{pricing}</dd>
            </div>
          ) : null}
          {currency ? (
            <div>
              <dt className="sr-only">{t('Base')}</dt>
              <dd className="truncate">{currency}</dd>
            </div>
          ) : null}
        </dl>
      </div>
      {isRail ? (
        <span className="hidden h-8 place-items-center lg:grid">
          <StatusDot isPulsing={isRefreshing} tone={tone} />
          <span className="sr-only">{summary}</span>
        </span>
      ) : null}
    </section>
  )
}

function StatusDot({ tone, isPulsing }: { tone: StatusTone; isPulsing: boolean }) {
  return (
    <span
      aria-hidden
      className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_TONE[tone]} ${
        isPulsing ? 'motion-safe:animate-pulse' : ''
      }`}
    />
  )
}
