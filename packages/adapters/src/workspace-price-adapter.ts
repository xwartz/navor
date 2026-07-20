import type { MarketPrice, NavorAst, NavorWorkspaceConfig } from '@navor/core'

import { buildPricePlan } from './price-plan'
import type { PriceAdapter, PriceAdapterFailure, PriceAdapterResult } from './types'
import { fetchYahooQuotes } from './yahoo-quotes'

export type { YahooQuoteFailure, YahooQuoteResult } from './yahoo-quotes'
export { fetchYahooQuote, fetchYahooQuotes } from './yahoo-quotes'

export interface WorkspacePriceAdapterOptions {
  ast: NavorAst
  config?: Pick<NavorWorkspaceConfig, 'symbolMap' | 'staticPrices'>
  fetch?: typeof fetch
}

export function createWorkspacePriceAdapter({
  ast,
  config = {},
  fetch: fetchFn = fetch,
}: WorkspacePriceAdapterOptions): PriceAdapter {
  const pricePlanBySubject = new Map(
    buildPricePlan(ast, config).map((entry) => [entry.subject, entry]),
  )

  return {
    name: 'WorkspacePriceAdapter',
    async fetchPrices(subjects): Promise<PriceAdapterResult> {
      const prices: MarketPrice[] = []
      const failures: PriceAdapterFailure[] = []
      const yahooSubjects: Array<{ subject: string; yahooSymbol: string }> = []

      for (const subject of subjects) {
        const staticPrice = resolveStaticPrice(subject, config.staticPrices)

        if (staticPrice) {
          prices.push(staticPrice)
          continue
        }

        const pricePlan = pricePlanBySubject.get(subject)

        if (!pricePlan?.yahooSymbol) {
          failures.push({
            subject,
            provider: 'WorkspacePriceAdapter',
            message: 'No symbol metadata on asset.',
          })
          continue
        }

        yahooSubjects.push({ subject, yahooSymbol: pricePlan.yahooSymbol })
      }

      if (yahooSubjects.length === 0) {
        return { prices, failures }
      }

      const uniqueSymbols = [...new Set(yahooSubjects.map((entry) => entry.yahooSymbol))]
      const fetched = await fetchYahooQuotes(uniqueSymbols, { fetch: fetchFn })

      for (const entry of yahooSubjects) {
        const quote = fetched.quotes.get(entry.yahooSymbol)

        if (quote) {
          prices.push({
            subject: entry.subject,
            price: quote.price,
            provider: 'Yahoo',
            asOf: quote.asOf,
          })
          continue
        }

        const failure = fetched.failures.find((item) => item.symbol === entry.yahooSymbol)

        failures.push({
          subject: entry.subject,
          provider: 'Yahoo',
          message:
            failure?.message ?? `Yahoo Finance returned no quote for "${entry.yahooSymbol}".`,
        })
      }

      return { prices, failures }
    },
  }
}

function resolveStaticPrice(
  subject: string,
  staticPrices: NavorWorkspaceConfig['staticPrices'],
): MarketPrice | null {
  const entry = staticPrices?.[subject]

  if (!entry) {
    return null
  }

  return {
    subject,
    price: { amount: entry.amount, currency: entry.currency },
    provider: 'WorkspaceStaticPrices',
    asOf: entry.asOf ?? new Date().toISOString(),
  }
}

export { resolveYahooSymbol } from './yahoo-symbol'
