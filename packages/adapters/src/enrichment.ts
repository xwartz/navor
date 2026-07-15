import type { PriceEnrichmentState } from '@navor/contract'
import type { MarketPrice } from '@navor/core/browser'

import type { PriceAdapterFailure } from './types'

export interface BuildPriceEnrichmentOptions {
  subjects: string[]
  prices: MarketPrice[]
  failures?: PriceAdapterFailure[]
  today?: string
  stalePriceAfterDays?: number
}

export function buildPriceEnrichment({
  subjects,
  prices,
  failures = [],
  today,
  stalePriceAfterDays,
}: BuildPriceEnrichmentOptions): PriceEnrichmentState[] {
  const priceBySubject = new Map(prices.map((price) => [price.subject, price]))
  const failureBySubject = new Map(failures.map((failure) => [failure.subject, failure]))

  return subjects.map((subject) => {
    const price = priceBySubject.get(subject)

    if (price) {
      return {
        subject,
        provider: price.provider,
        asOf: price.asOf,
        status: isStale(price.asOf, today, stalePriceAfterDays) ? 'stale' : ('fresh' as const),
      }
    }

    const failure = failureBySubject.get(subject)

    if (failure) {
      return {
        subject,
        provider: failure.provider,
        asOf: null,
        status: 'failed' as const,
        message: failure.message,
      }
    }

    return {
      subject,
      provider: null,
      asOf: null,
      status: 'missing' as const,
    }
  })
}

function isStale(asOf: string, today?: string, stalePriceAfterDays?: number) {
  if (!today || !stalePriceAfterDays) {
    return false
  }

  const ageMs = Date.parse(today) - Date.parse(asOf)
  const ageDays = ageMs / 86_400_000

  return ageDays > stalePriceAfterDays
}
