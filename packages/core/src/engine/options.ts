import { parseFxRates } from '../core/fx'
import type { NavorAst, PortfolioOptions } from '../types'

export function getPortfolioOptions(ast: NavorAst): PortfolioOptions {
  const optionDirective = ast.directives.find((directive) => directive.directive === 'option')

  return {
    baseCurrency: optionDirective?.metadata.base_currency ?? null,
    timezone: optionDirective?.metadata.timezone ?? null,
    fxRates: parseFxRates(optionDirective?.metadata.fx_rates ?? null),
  }
}
