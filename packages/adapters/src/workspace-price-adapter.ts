import type { MarketPrice, NavorAst, NavorWorkspaceConfig } from '@navor/core'

import { buildPricePlan } from './price-plan'
import type { PriceAdapter, PriceAdapterFailure, PriceAdapterResult } from './types'
import { fetchYahooQuote } from './yahoo-quotes'

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

      await Promise.all(
        subjects.map(async (subject) => {
          const staticPrice = resolveStaticPrice(subject, config.staticPrices)

          if (staticPrice) {
            prices.push(staticPrice)
            return
          }

          const pricePlan = pricePlanBySubject.get(subject)

          if (!pricePlan?.yahooSymbol) {
            failures.push({
              subject,
              provider: 'WorkspacePriceAdapter',
              message: 'No symbol metadata on asset.',
            })
            return
          }

          try {
            const quote = await fetchYahooQuote(pricePlan.yahooSymbol, fetchFn)

            prices.push({
              subject,
              price: quote.price,
              provider: 'YahooFinance',
              asOf: quote.asOf,
            })
          } catch (error) {
            failures.push({
              subject,
              provider: 'YahooFinance',
              message: error instanceof Error ? error.message : String(error),
            })
          }
        }),
      )

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
