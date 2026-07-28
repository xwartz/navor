import { resolvePriceSources } from '@navor/adapters'
import type { PriceAdapterFailure } from '@navor/adapters/browser'
import type { NavorRendererAppState } from '@navor/contract'
import type { MarketPrice } from '@navor/core/browser'

import { rebuildReaderDerivedState } from './derived-state'

export interface ApplyLivePricesOptions {
  today?: string
  stalePriceAfterDays?: number
}

export function applyLivePrices(
  state: NavorRendererAppState,
  result: { prices: MarketPrice[]; failures?: PriceAdapterFailure[] },
  options: ApplyLivePricesOptions = {},
): NavorRendererAppState {
  const priceSnapshot = {
    ...state.priceSnapshot,
    livePrices: result.prices,
    failures: (result.failures ?? []).map((failure) => ({
      subject: failure.subject,
      provider: failure.provider,
      asOf: null,
      status: 'failed' as const,
      message: failure.message,
    })),
  }
  const { dashboard, drift, market, priceEnrichment } = rebuildReaderDerivedState({
    facts: {
      allocation: state.allocation,
      portfolio: state.portfolio,
      knowledge: state.knowledge,
      process: state.process,
      plan: state.plan,
      baseCurrency: state.drift.baseCurrency,
      fxRates: state.drift.fxRates ?? {},
      marketResearch: state.market.research,
      priceManifest: state.priceManifest,
      recentTransactions: state.dashboard.recentTransactions,
    },
    prices: resolvePriceSources(priceSnapshot),
    failures: result.failures,
    today: options.today,
    stalePriceAfterDays: options.stalePriceAfterDays,
  })

  return {
    ...state,
    dashboard,
    market,
    drift,
    enrichment: {
      prices: priceEnrichment,
    },
    priceSnapshot,
  }
}
