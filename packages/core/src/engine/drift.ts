import { convertToBaseCurrency } from '../core/fx'
import type {
  AllocationResult,
  DriftEntry,
  DriftResult,
  MarketView,
  MoneyAmount,
  PlanResult,
} from '../types'

export interface GenerateDriftOptions {
  allocation: AllocationResult
  market: MarketView
  plan: PlanResult
  baseCurrency?: string | null
  fxRates?: Record<string, number>
}

export function generateDrift({
  allocation,
  market,
  plan,
  baseCurrency = null,
  fxRates = {},
}: GenerateDriftOptions): DriftResult {
  const planBySubject = new Map(plan.current.map((entry) => [entry.subject, entry]))
  const valueBySubject = new Map(market.portfolioValues.map((value) => [value.subject, value]))
  const titleBySubject = new Map(allocation.assets.map((asset) => [asset.subject, asset.title]))
  const unconvertedCurrencies = new Set<string>()

  const valuedAssets = allocation.assets.flatMap((asset) => {
    const marketValue = valueBySubject.get(asset.subject)?.marketValue ?? null

    if (!marketValue) {
      return []
    }

    if (!baseCurrency) {
      return [{ asset, marketValue, marketValueInBase: marketValue }]
    }

    const marketValueInBase = convertToBaseCurrency(marketValue, baseCurrency, fxRates)

    if (!marketValueInBase) {
      unconvertedCurrencies.add(marketValue.currency)
      return []
    }

    return [{ asset, marketValue, marketValueInBase }]
  })

  const totalAmount = valuedAssets.reduce((sum, item) => sum + item.marketValueInBase.amount, 0)
  const totalMarketValue: MoneyAmount | null =
    totalAmount > 0 && baseCurrency ? { amount: totalAmount, currency: baseCurrency } : null

  const entries: DriftEntry[] = allocation.assets.map((asset) => {
    const planEntry = planBySubject.get(asset.subject)
    const marketValue = valueBySubject.get(asset.subject)?.marketValue ?? null
    const marketValueInBase =
      marketValue && baseCurrency
        ? convertToBaseCurrency(marketValue, baseCurrency, fxRates)
        : marketValue
    const targetWeight = planEntry?.target ?? asset.derivedPortfolioWeight
    const actualWeight =
      marketValueInBase && totalAmount > 0 ? (marketValueInBase.amount / totalAmount) * 100 : null
    const drift =
      targetWeight !== null && actualWeight !== null ? actualWeight - targetWeight : null
    const planMin = planEntry?.min ?? null
    const planMax = planEntry?.max ?? null

    if (marketValue && baseCurrency && !marketValueInBase) {
      unconvertedCurrencies.add(marketValue.currency)
    }

    return {
      subject: asset.subject,
      title: asset.title ?? titleBySubject.get(asset.subject) ?? null,
      targetWeight,
      actualWeight,
      drift,
      status: resolveDriftStatus({ drift, planMin, planMax, actualWeight }),
      marketValue,
      marketValueInBase: marketValueInBase ?? null,
      planMin,
      planMax,
    }
  })

  return {
    baseCurrency,
    totalMarketValue,
    fxRates,
    unconvertedCurrencies: [...unconvertedCurrencies],
    entries,
    diagnostics: plan.diagnostics,
  }
}

function resolveDriftStatus({
  drift,
  planMin,
  planMax,
  actualWeight,
}: {
  drift: number | null
  planMin: number | null
  planMax: number | null
  actualWeight: number | null
}): DriftEntry['status'] {
  if (actualWeight === null) {
    return 'unknown'
  }

  if (planMin !== null && actualWeight < planMin) {
    return 'below_min'
  }

  if (planMax !== null && actualWeight > planMax) {
    return 'above_max'
  }

  if (drift === null) {
    return 'unknown'
  }

  return 'on_track'
}
