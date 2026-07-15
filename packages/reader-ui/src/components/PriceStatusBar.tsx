import type { NavorRendererAppState } from '@navor/contract'
import { t } from '../i18n'

interface PriceStatusBarProps {
  state: NavorRendererAppState | null
  loading: boolean
  error: string | null
  liveEnabled: boolean
  onRefresh: () => Promise<void>
}

export function PriceStatusBar({
  state,
  loading,
  error,
  liveEnabled,
  onRefresh,
}: PriceStatusBarProps) {
  if (!state) {
    return null
  }

  const trackedCount = state.priceManifest.entries.filter((entry) => entry.yahooSymbol).length
  const freshCount = state.enrichment.prices.filter((price) => price.status === 'fresh').length
  const hasLiveValuation = state.drift.totalMarketValue !== null
  const showCostBasisNotice = !liveEnabled && trackedCount > 0 && freshCount === 0
  const isHealthy = liveEnabled && !loading && !error && (freshCount > 0 || hasLiveValuation)

  if (isHealthy) {
    return null
  }

  const message = error
    ? `${t('Price refresh failed:')} ${error}`
    : loading
      ? t('Loading live market prices…')
      : showCostBasisNotice
        ? t('Live prices unavailable. Views use cost basis until a price proxy is configured.')
        : trackedCount === 0
          ? t('No market symbols tracked in this workspace.')
          : null

  if (!message) {
    return null
  }

  return (
    <div className="flex min-h-11 flex-wrap items-center justify-between gap-3 border-b border-border bg-warning-soft/35 px-4 py-2.5 lg:px-7">
      <p className={`min-w-0 text-sm ${error ? 'text-warning' : 'text-ink-muted'}`}>{message}</p>
      {trackedCount > 0 ? (
        <button
          className="inline-flex h-9 shrink-0 items-center rounded-md border border-border bg-paper-elevated px-3 text-sm font-medium text-ink transition-[background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 disabled:opacity-60 [@media(hover:hover)]:hover:bg-accent-soft"
          disabled={loading}
          onClick={() => void onRefresh()}
          type="button"
        >
          {loading ? t('Refreshing…') : t('Refresh prices')}
        </button>
      ) : null}
    </div>
  )
}
