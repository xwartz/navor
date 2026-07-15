import type { PriceEnrichmentState } from '@navor/contract'
import type { MarketPrice, NavorWorkspaceConfig } from '@navor/core'

export type { BuildPriceEnrichmentOptions } from './enrichment'
export { buildPriceEnrichment } from './enrichment'
export { buildPricePlan, type PricePlanEntry } from './price-plan'
export type {
  PriceProxyHandlerOptions,
  PriceProxyQuoteRequest,
  PriceProxyRequestBody,
  PriceProxyResponseBody,
} from './price-proxy'
export { handlePriceProxyRequest } from './price-proxy'
export type { PriceAdapter, PriceAdapterFailure, PriceAdapterResult } from './types'
export type { WorkspacePriceAdapterOptions } from './workspace-price-adapter'
export {
  createWorkspacePriceAdapter,
  fetchYahooQuotes,
  resolveYahooSymbol,
} from './workspace-price-adapter'

export function resolveConfigStaticPrices(
  subjects: string[],
  staticPrices: NavorWorkspaceConfig['staticPrices'] = {},
): MarketPrice[] {
  if (!staticPrices) {
    return []
  }

  return subjects.flatMap((subject) => {
    const entry = staticPrices[subject]

    if (!entry) {
      return []
    }

    return [
      {
        subject,
        price: { amount: entry.amount, currency: entry.currency },
        provider: 'WorkspaceStaticPrices',
        asOf: entry.asOf ?? new Date().toISOString(),
      },
    ]
  })
}

export function createStaticPriceAdapter(prices: MarketPrice[]): import('./types').PriceAdapter {
  return {
    name: 'StaticPrices',
    async fetchPrices() {
      return { prices }
    },
  }
}

export type { PriceEnrichmentState }
