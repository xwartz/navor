import type {
  AllocationResult,
  DashboardAccountExecution,
  DashboardActionItem,
  DashboardActionReason,
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
  const actionInbox = generateActionInbox({
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

function generateActionInbox({
  today,
  pendingReviews,
  assetExecutions,
  drift,
  priceStates,
}: {
  today?: string
  pendingReviews: DashboardView['pendingReviews']
  assetExecutions: DashboardAssetExecution[]
  drift: DriftResult
  priceStates: DashboardPriceState[]
}): DashboardActionItem[] {
  const assetBySubject = new Map(assetExecutions.map((asset) => [asset.subject, asset]))
  const heldSubjects = new Set(
    assetExecutions.filter((asset) => asset.holding).map((asset) => asset.subject),
  )
  const driftBySubject = new Map(drift.entries.map((entry) => [entry.subject, entry]))
  const actions: DashboardActionItem[] = []

  for (const review of pendingReviews) {
    actions.push({
      id: `review_due:${review.subject}:${review.reviewBy}`,
      type: 'review_due',
      severity: 'high',
      category: 'process_due',
      ...priorityDetails({
        type: 'review_due',
        today,
        drift: driftBySubject.get(review.subject),
        reviewBy: review.reviewBy,
      }),
      subject: review.subject,
      title: review.title,
      message: `Review due ${review.reviewBy}.`,
      action: 'Review thesis',
      date: review.reviewBy,
    })
  }

  for (const entry of drift.entries) {
    if (entry.status !== 'above_max' && entry.status !== 'below_min') {
      continue
    }

    actions.push({
      id: `${entry.status}:${entry.subject}`,
      type: entry.status,
      severity: entry.status === 'above_max' ? 'high' : 'medium',
      category: 'investment_risk',
      ...priorityDetails({ type: entry.status, drift: entry }),
      subject: entry.subject,
      title: entry.title,
      message: `${entry.title ?? entry.subject} is ${entry.status === 'above_max' ? 'above max' : 'below min'}.`,
      action: entry.status === 'above_max' ? 'Consider trim' : 'Consider accumulate',
      date: null,
    })
  }

  for (const asset of assetExecutions) {
    if (asset.status === 'currency_mismatch') {
      actions.push({
        id: `currency_mismatch:${asset.subject}`,
        type: 'currency_mismatch',
        severity: 'medium',
        category: 'data_integrity',
        ...priorityDetails({
          type: 'currency_mismatch',
          drift: driftBySubject.get(asset.subject),
        }),
        subject: asset.subject,
        title: asset.title,
        message: `${asset.title ?? asset.subject} target is in ${asset.targetAmount?.currency} but invested cost is in ${asset.investedCost?.currency}.`,
        action: 'Check currency conversion',
        date: null,
      })
      continue
    }

    if ((asset.investedPercent ?? 0) <= 100) {
      continue
    }

    actions.push({
      id: `over_invested:${asset.subject}`,
      type: 'over_invested',
      severity: 'high',
      category: 'investment_risk',
      ...priorityDetails({
        type: 'over_invested',
        drift: driftBySubject.get(asset.subject),
        investedPercent: asset.investedPercent,
      }),
      subject: asset.subject,
      title: asset.title,
      message: `${asset.title ?? asset.subject} is ${(asset.investedPercent ?? 0).toFixed(1)}% invested.`,
      action: 'Review target amount',
      date: null,
    })
  }

  for (const priceState of priceStates) {
    if (!heldSubjects.has(priceState.subject) || priceState.status === 'fresh') {
      continue
    }

    const asset = assetBySubject.get(priceState.subject)
    const type =
      priceState.status === 'failed'
        ? 'failed_price'
        : priceState.status === 'stale'
          ? 'stale_price'
          : 'missing_price'

    actions.push({
      id: `${type}:${priceState.subject}`,
      type,
      severity: priceState.status === 'failed' ? 'high' : 'medium',
      category: 'data_integrity',
      ...priorityDetails({
        type,
        drift: driftBySubject.get(priceState.subject),
      }),
      subject: priceState.subject,
      title: asset?.title ?? priceState.subject,
      message:
        priceState.status === 'failed'
          ? (priceState.message ?? 'Price refresh failed.')
          : priceState.status === 'stale'
            ? 'Price is stale.'
            : 'Held asset has no market price.',
      action: 'Check price source',
      date: priceState.asOf,
    })
  }

  return actions.sort(compareDashboardActions)
}

function priorityDetails({
  type,
  today,
  drift,
  reviewBy,
  investedPercent,
}: {
  type: DashboardActionItem['type']
  today?: string
  drift?: DriftResult['entries'][number]
  reviewBy?: string
  investedPercent?: number | null
}) {
  const impactAmount = drift?.marketValueInBase ?? null
  const impactPercent = drift?.actualWeight ?? null
  const exposureScore = impactPercent === null ? 0 : Math.min(Math.round(impactPercent), 99)
  const driftScore =
    type === 'above_max' || type === 'below_min'
      ? Math.min(Math.round(Math.abs(drift?.drift ?? 0) * 2), 99)
      : 0
  const overdueDays = reviewBy && today ? daysBetween(reviewBy, today) : 0
  const investedExcess =
    type !== 'over_invested' || investedPercent === null || investedPercent === undefined
      ? 0
      : Math.max(investedPercent - 100, 0)
  const baseScore = priorityBaseScore(type)
  const priorityScore = Math.round(
    baseScore +
      exposureScore +
      driftScore +
      (type === 'review_due' ? Math.min(overdueDays, 99) : 0) +
      Math.min(investedExcess, 99),
  )

  return {
    priorityScore,
    reason: priorityReason({
      type,
      impactPercent,
      drift: drift?.drift ?? null,
      overdueDays,
      investedExcess,
    }),
    impactAmount,
    impactPercent,
  }
}

function priorityBaseScore(type: DashboardActionItem['type']) {
  switch (type) {
    case 'failed_price':
      return 900
    case 'above_max':
      return 760
    case 'over_invested':
      return 730
    case 'review_due':
      return 680
    case 'currency_mismatch':
      return 620
    case 'missing_price':
      return 580
    case 'stale_price':
      return 540
    case 'below_min':
      return 500
  }
}

function priorityReason({
  type,
  impactPercent,
  drift,
  overdueDays,
  investedExcess,
}: {
  type: DashboardActionItem['type']
  impactPercent: number | null
  drift: number | null
  overdueDays: number
  investedExcess: number
}): DashboardActionReason {
  if (type === 'review_due') {
    return { kind: 'review_due', overdueDays, impactPercent }
  }

  if (type === 'above_max' || type === 'below_min') {
    return { kind: type, drift, impactPercent }
  }

  if (type === 'over_invested') {
    return { kind: 'over_invested', investedExcess, impactPercent }
  }

  if (type === 'currency_mismatch') {
    return { kind: 'currency_mismatch', impactPercent }
  }

  return { kind: type, impactPercent }
}

function daysBetween(start: string, end: string) {
  const startTime = Date.parse(`${start}T00:00:00Z`)
  const endTime = Date.parse(`${end}T00:00:00Z`)

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return 0
  }

  return Math.max(Math.floor((endTime - startTime) / 86_400_000), 0)
}

function compareDashboardActions(left: DashboardActionItem, right: DashboardActionItem) {
  if (left.priorityScore !== right.priorityScore) {
    return right.priorityScore - left.priorityScore
  }

  if (left.severity !== right.severity) {
    return severityRank(right.severity) - severityRank(left.severity)
  }

  return left.id.localeCompare(right.id)
}

function severityRank(severity: DashboardActionItem['severity']) {
  return severity === 'high' ? 3 : severity === 'medium' ? 2 : 1
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
