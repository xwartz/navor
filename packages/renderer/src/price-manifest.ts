import { buildPricePlan } from '@navor/adapters'
import type { PriceManifest } from '@navor/contract'
import type { NavorAst, NavorWorkspaceConfig } from '@navor/core'

export function buildPriceManifest(
  ast: NavorAst,
  config: Pick<NavorWorkspaceConfig, 'symbolMap' | 'stalePriceAfterDays'> = {},
): PriceManifest {
  const entries = buildPricePlan(ast, config)

  return {
    entries,
    stalePriceAfterDays: config.stalePriceAfterDays,
    livePricesPath: '/api/prices',
  }
}
