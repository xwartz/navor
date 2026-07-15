import { parseList } from './core/values'
import { generatePortfolio } from './engine/portfolio'
import type { MarketPrice, MarketView, NavorAst, PortfolioResult } from './types'

export interface GenerateMarketViewOptions {
  prices?: MarketPrice[]
  portfolio?: PortfolioResult
  research?: MarketView['research']
}

export function generateMarketView(
  ast: NavorAst,
  options: GenerateMarketViewOptions = {},
): MarketView {
  const portfolio = options.portfolio ?? generatePortfolio(ast)
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

  return buildMarketView({ portfolio, research, prices: options.prices ?? [] })
}

export function buildMarketView({
  portfolio,
  research,
  prices,
}: {
  portfolio: PortfolioResult
  research: MarketView['research']
  prices: MarketPrice[]
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
    const pnl =
      holding.cost && holding.cost.currency === marketValue.currency
        ? {
            amount: marketValue.amount - holding.cost.amount,
            currency: marketValue.currency,
          }
        : null

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
