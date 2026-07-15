import type { NavorAst, NavorWorkspaceConfig } from '@navor/core'

import { resolveYahooSymbol } from './yahoo-symbol'

export interface PricePlanEntry {
  subject: string
  symbol: string | null
  yahooSymbol: string | null
}

export function buildPricePlan(
  ast: NavorAst,
  config: Pick<NavorWorkspaceConfig, 'symbolMap'> = {},
): PricePlanEntry[] {
  return ast.directives
    .filter((directive) => directive.directive === 'open' && directive.subject.startsWith('Asset:'))
    .map((directive) => {
      const symbol = directive.metadata.symbol ?? null

      return {
        subject: directive.subject,
        symbol,
        yahooSymbol: symbol
          ? resolveYahooSymbol({
              subject: directive.subject,
              symbol,
              symbolMap: config.symbolMap,
              market: directive.metadata.market ?? null,
              type: directive.metadata.type ?? null,
              currency: directive.metadata.currency ?? null,
            })
          : null,
      }
    })
}
