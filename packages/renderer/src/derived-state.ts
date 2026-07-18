import type { PriceAdapterFailure } from '@navor/adapters/browser'
import { buildPriceEnrichment } from '@navor/adapters/browser'
import type { NavorRendererAppState, PriceManifest } from '@navor/contract'
import {
  buildDashboardView,
  buildMarketView,
  generateDrift,
  type MarketPrice,
} from '@navor/core/browser'

type ReaderStateFacts = Pick<
  NavorRendererAppState,
  'allocation' | 'portfolio' | 'knowledge' | 'process' | 'plan'
> & {
  baseCurrency: string | null
  fxRates: Record<string, number>
  marketResearch: NavorRendererAppState['market']['research']
  priceManifest: PriceManifest
  recentTransactions: NavorRendererAppState['dashboard']['recentTransactions']
}

export function rebuildReaderDerivedState({
  facts,
  prices,
  failures = [],
  today,
  stalePriceAfterDays = facts.priceManifest.stalePriceAfterDays,
}: {
  facts: ReaderStateFacts
  prices: MarketPrice[]
  failures?: PriceAdapterFailure[]
  today?: string
  stalePriceAfterDays?: number
}) {
  const subjects = facts.priceManifest.entries.map((entry) => entry.subject)
  const market = buildMarketView({
    portfolio: facts.portfolio,
    research: facts.marketResearch,
    prices,
    baseCurrency: facts.baseCurrency,
    fxRates: facts.fxRates,
  })
  const drift = generateDrift({
    allocation: facts.allocation,
    market,
    plan: facts.plan,
    baseCurrency: facts.baseCurrency,
    fxRates: facts.fxRates,
  })
  const priceEnrichment = buildPriceEnrichment({
    subjects,
    prices,
    failures,
    today,
    stalePriceAfterDays,
  })
  const dashboard = buildDashboardView({
    today,
    allocation: facts.allocation,
    portfolio: facts.portfolio,
    knowledge: facts.knowledge,
    process: facts.process,
    market,
    drift,
    priceStates: priceEnrichment,
    recentTransactions: facts.recentTransactions,
  })

  return { dashboard, drift, market, priceEnrichment }
}
