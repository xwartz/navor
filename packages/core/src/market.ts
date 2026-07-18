import { convertToBaseCurrency } from './core/fx'
import { parseList } from './core/values'
import { getPortfolioOptions } from './engine/options'
import { generatePortfolio } from './engine/portfolio'
import type { MarketPrice, MarketView, MoneyAmount, NavorAst, PortfolioResult } from './types'

export interface GenerateMarketViewOptions {
  prices?: MarketPrice[]
  portfolio?: PortfolioResult
  research?: MarketView['research']
  baseCurrency?: string | null
  fxRates?: Record<string, number>
}

export function generateMarketView(
  ast: NavorAst,
  options: GenerateMarketViewOptions = {},
): MarketView {
  const portfolio = options.portfolio ?? generatePortfolio(ast)
  const portfolioOptions = getPortfolioOptions(ast)
  const research =
    options.research ??
    ast.directives
      .filter(
        (directive) =>
          directive.directive === 'research' && directive.subject.startsWith('Market:'),
      )
      .map((directive) => ({
        date: directive.date,
        subject: directive.subject,
        title: directive.title,
        source: directive.metadata.source ?? null,
        tags: parseList(directive.metadata.tags ?? null),
      }))

  return buildMarketView({
    portfolio,
    research,
    prices: options.prices ?? [],
    baseCurrency: options.baseCurrency ?? portfolioOptions.baseCurrency,
    fxRates: options.fxRates ?? portfolioOptions.fxRates,
  })
}

export function buildMarketView({
  portfolio,
  research,
  prices,
  baseCurrency = null,
  fxRates = {},
}: {
  portfolio: PortfolioResult
  research: MarketView['research']
  prices: MarketPrice[]
  baseCurrency?: string | null
  fxRates?: Record<string, number>
}): MarketView {
  const priceBySubject = new Map(prices.map((price) => [price.subject, price]))
  const portfolioValues = portfolio.holdings.flatMap((holding) => {
    const price = priceBySubject.get(holding.asset)

    if (!price) {
      return []
    }

    const marketValue = {
      amount: holding.quantity * price.price.amount,
      currency: price.price.currency,
    }
    const pnl = calculatePnl(holding.cost, marketValue, { baseCurrency, fxRates })

    return [
      {
        subject: holding.asset,
        marketValue,
        cost: holding.cost,
        pnl,
      },
    ]
  })

  return {
    research,
    prices: prices.map((price) => ({
      ...price,
      source: 'external' as const,
    })),
    portfolioValues,
  }
}

function calculatePnl(
  cost: MoneyAmount | null,
  marketValue: MoneyAmount,
  options: { baseCurrency: string | null; fxRates: Record<string, number> },
): MoneyAmount | null {
  if (!cost) {
    return null
  }

  if (!options.baseCurrency) {
    return cost.currency === marketValue.currency
      ? {
          amount: marketValue.amount - cost.amount,
          currency: marketValue.currency,
        }
      : null
  }

  const costInBase = convertToBaseCurrency(cost, options.baseCurrency, options.fxRates)
  const marketValueInBase = convertToBaseCurrency(
    marketValue,
    options.baseCurrency,
    options.fxRates,
  )

  if (!costInBase || !marketValueInBase) {
    return null
  }

  return {
    amount: marketValueInBase.amount - costInBase.amount,
    currency: options.baseCurrency,
  }
}
