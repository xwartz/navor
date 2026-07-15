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
    prices: result.prices,
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
  }
}
