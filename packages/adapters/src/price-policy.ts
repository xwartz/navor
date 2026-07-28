import type { MarketPrice } from '@navor/core'

export interface PriceSources {
  staticPrices?: MarketPrice[]
  explicitPrices?: MarketPrice[]
  livePrices?: MarketPrice[]
}

/** Applies Navor's price precedence: live, then explicit, then static. */
export function resolvePriceSources({
  staticPrices = [],
  explicitPrices = [],
  livePrices = [],
}: PriceSources): MarketPrice[] {
  const prices = new Map<string, MarketPrice>()
  for (const source of [staticPrices, explicitPrices, livePrices]) {
    for (const price of source) prices.set(price.subject, price)
  }
  return [...prices.values()]
}
