import type {
  AllocationResult,
  DashboardAccountExecution,
  DashboardAssetExecution,
  DashboardPriceState,
  DashboardView,
  DriftResult,
  KnowledgeViews,
  MarketView,
  MoneyAmount,
  NavorAst,
  PortfolioHolding,
  PortfolioResult,
  ProcessViews,
} from '../types'
import { buildInvestmentActionInbox } from './action-inbox'
import { generateAllocation } from './allocation'
import { generateKnowledgeViews } from './knowledge'
import { getPortfolioOptions } from './options'
import { generatePortfolio } from './portfolio'
import { generateProcessViews } from './process'

export interface GenerateDashboardOptions {
  today?: string
  allocation?: AllocationResult
  portfolio?: PortfolioResult
  knowledge?: KnowledgeViews
  process?: ProcessViews
  market?: MarketView
  drift?: DriftResult
  priceStates?: DashboardPriceState[]
  recentTransactions?: DashboardView['recentTransactions']
}

export function generateDashboard(
  ast: NavorAst,
  options: GenerateDashboardOptions = {},
): DashboardView {
  const portfolioOptions = getPortfolioOptions(ast)

  return buildDashboardView({
    today: options.today,
    allocation:
      options.allocation ??
      generateAllocation(ast, {
        baseCurrency: portfolioOptions.baseCurrency,
        fxRates: portfolioOptions.fxRates,
      }),
    portfolio: options.portfolio ?? generatePortfolio(ast),
    knowledge: options.knowledge ?? generateKnowledgeViews(ast, { today: options.today }),
    process: options.process ?? generateProcessViews(ast),
    market: options.market ?? { research: [], prices: [], portfolioValues: [] },
    drift: options.drift ?? {
      baseCurrency: null,
      totalMarketValue: null,
      fxRates: {},
      unconvertedCurrencies: [],
      entries: [],
      diagnostics: [],
    },
    priceStates: options.priceStates ?? [],
    recentTransactions:
      options.recentTransactions ??
      ast.directives
        .filter((directive) => directive.directive === 'txn')
        .map((directive) => ({
          date: directive.date,
          subject: directive.subject,
          title: directive.title,
        })),
  })
}

export function buildDashboardView({
  today,
  allocation,
  portfolio,
  knowledge,
  process,
  market,
  drift,
  priceStates = [],
  recentTransactions,
}: {
  today?: string
  allocation: AllocationResult
  portfolio: PortfolioResult
  knowledge: KnowledgeViews
  process: ProcessViews
  market: MarketView
  drift: DriftResult
  priceStates?: DashboardPriceState[]
  recentTransactions: DashboardView['recentTransactions']
}): DashboardView {
  const pendingReviews = knowledge.theses
    .filter((thesis) => today && thesis.reviewBy && thesis.reviewBy < today)
    .map((thesis) => ({
      subject: thesis.subject,
      title: thesis.title,
      reviewBy: thesis.reviewBy as string,
    }))
  const assetExecutions = generateAssetExecutions({ allocation, portfolio, market, drift })
  const accountExecutions = generateAccountExecutions({ allocation, assetExecutions })
  const actionInbox = buildInvestmentActionInbox({
    today,
    pendingReviews,
    assetExecutions,
    drift,
    priceStates,
  })

  return {
    capital: allocation.capital,
    cash: portfolio.cash,
    accounts: allocation.accounts,
    assets: allocation.assets,
    accountExecutions,
    assetExecutions,
    actionInbox,
    holdings: portfolio.holdings,
    pendingReviews,
    watchlist: process.watchlist,
    recentTransactions,
    diagnostics: [...allocation.diagnostics, ...portfolio.diagnostics, ...knowledge.diagnostics],
  }
}

function generateAssetExecutions({
  allocation,
  portfolio,
  market,
  drift,
}: {
  allocation: AllocationResult
  portfolio: PortfolioResult
  market: MarketView
  drift: DriftResult
}): DashboardAssetExecution[] {
  const holdingByAsset = new Map(portfolio.holdings.map((holding) => [holding.asset, holding]))
  const marketValueByAsset = new Map(
    market.portfolioValues.map((value) => [value.subject, value.marketValue]),
  )
  const driftByAsset = new Map(drift.entries.map((entry) => [entry.subject, entry]))

  return allocation.assets.map((asset) => {
    const holding = holdingByAsset.get(asset.subject) ?? null
    const investedCost = holding?.cost ?? null
    const investedPercent = computePercent({
      numerator: investedCost,
      denominator: asset.targetAmount,
    })
    const remainingBudget = subtractMoney(asset.targetAmount, investedCost)
    const driftEntry = driftByAsset.get(asset.subject)

    return {
      subject: asset.subject,
      title: asset.title,
      account: asset.account,
      target: asset.target,
      targetAmount: asset.targetAmount,
      investedCost,
      investedPercent,
      remainingBudget,
      marketValue: marketValueByAsset.get(asset.subject) ?? null,
      drift: driftEntry?.drift ?? null,
      status: resolveAssetExecutionStatus({
        targetAmount: asset.targetAmount,
        investedPercent,
        driftStatus: driftEntry?.status ?? 'unknown',
        holding,
      }),
      holding,
    }
  })
}

function generateAccountExecutions({
  allocation,
  assetExecutions,
}: {
  allocation: AllocationResult
  assetExecutions: DashboardAssetExecution[]
}): DashboardAccountExecution[] {
  return allocation.accounts.map((account) => {
    const assets = assetExecutions.filter((asset) => asset.account === account.subject)
    const investedCost = sumMoney(assets.map((asset) => asset.investedCost))
    const marketValue = sumMoney(assets.map((asset) => asset.marketValue))
    const targetAmount = account.baseAmount ?? account.total ?? account.budget
    const accountCost =
      investedCost.find((value) => value.currency === targetAmount?.currency) ?? null
    const investedPercent = computePercent({ numerator: accountCost, denominator: targetAmount })

    return {
      subject: account.subject,
      title: account.title,
      target: account.target,
      targetAmount,
      investedCost,
      investedPercent,
      remainingBudget: subtractMoney(targetAmount, accountCost),
      marketValue,
      drift: null,
    }
  })
}

function resolveAssetExecutionStatus({
  targetAmount,
  investedPercent,
  driftStatus,
  holding,
}: {
  targetAmount: MoneyAmount | null
  investedPercent: number | null
  driftStatus: DriftResult['entries'][number]['status']
  holding: PortfolioHolding | null
}): DashboardAssetExecution['status'] {
  if (
    holding?.cost &&
    targetAmount &&
    holding.cost.currency !== targetAmount.currency &&
    investedPercent === null
  ) {
    return 'currency_mismatch'
  }

  if ((investedPercent ?? 0) > 100) {
    return 'over_invested'
  }

  if (driftStatus === 'above_max' || driftStatus === 'below_min') {
    return driftStatus
  }

  if (!holding && (investedPercent ?? 0) === 0) {
    return 'not_started'
  }

  if ((investedPercent ?? 0) >= 99.5) {
    return 'complete'
  }

  return 'building'
}

function computePercent({
  numerator,
  denominator,
}: {
  numerator: MoneyAmount | null
  denominator: MoneyAmount | null
}) {
  if (
    !numerator ||
    !denominator ||
    numerator.currency !== denominator.currency ||
    denominator.amount === 0
  ) {
    return null
  }

  return (numerator.amount / denominator.amount) * 100
}

function subtractMoney(left: MoneyAmount | null, right: MoneyAmount | null) {
  if (!left || !right || left.currency !== right.currency) {
    return null
  }

  return {
    amount: left.amount - right.amount,
    currency: left.currency,
  }
}

function sumMoney(values: Array<MoneyAmount | null>): MoneyAmount[] {
  const totals = new Map<string, number>()

  for (const value of values) {
    if (!value) {
      continue
    }

    totals.set(value.currency, (totals.get(value.currency) ?? 0) + value.amount)
  }

  return Array.from(totals.entries()).map(([currency, amount]) => ({ amount, currency }))
}
