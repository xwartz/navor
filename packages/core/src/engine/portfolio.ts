import type {
  NavorAst,
  NavorDiagnostic,
  NavorDirective,
  NavorPosting,
  PortfolioFlow,
  PortfolioHolding,
  PortfolioRealizedPnl,
  PortfolioResult,
  PortfolioTransactionView,
} from '../types'

export function generatePortfolio(ast: NavorAst): PortfolioResult {
  const diagnostics: NavorDiagnostic[] = []
  const closedAssets = new Set(
    ast.directives
      .filter(
        (directive) => directive.directive === 'close' && directive.subject.startsWith('Asset:'),
      )
      .map((directive) => directive.subject),
  )
  const holdings = new Map<string, PortfolioHolding>()
  const cash = new Map<string, number>()
  const expenses = new Map<string, PortfolioFlow>()
  const income = new Map<string, PortfolioFlow>()
  const realizedPnl: PortfolioRealizedPnl[] = []

  for (const directive of orderTransactions(ast)) {
    if (closedAssets.has(directive.subject)) {
      diagnostics.push({
        line: directive.line,
        file: directive.file,
        message: `Transaction appears after Asset "${directive.subject}" was closed.`,
      })
    }

    applyTransaction(directive, holdings, cash, expenses, income, realizedPnl, diagnostics)
  }

  return {
    transactions: orderTransactions(ast).map(transactionToView),
    holdings: Array.from(holdings.values()).filter((holding) => holding.quantity !== 0),
    cash: Array.from(cash.entries()).map(([currency, amount]) => ({ currency, amount })),
    income: Array.from(income.values()),
    expenses: Array.from(expenses.values()),
    realizedPnl,
    diagnostics,
  }
}

function transactionToView(directive: NavorDirective): PortfolioTransactionView {
  return {
    date: directive.date,
    subject: directive.subject,
    title: directive.title,
    file: directive.file,
    line: directive.line,
    postings: directive.postings.map((posting) => ({
      account: posting.account,
      quantity: posting.quantity,
      commodity: posting.commodity,
      price: posting.price,
    })),
  }
}

function orderTransactions(ast: NavorAst): NavorDirective[] {
  return ast.directives
    .filter((item) => item.directive === 'txn')
    .sort((left, right) => {
      const dateComparison = left.date.localeCompare(right.date)
      if (dateComparison !== 0) {
        return dateComparison
      }

      const fileComparison = (left.file ?? '').localeCompare(right.file ?? '')
      if (fileComparison !== 0) {
        return fileComparison
      }

      return left.line - right.line
    })
}

function applyTransaction(
  directive: NavorDirective,
  holdings: Map<string, PortfolioHolding>,
  cash: Map<string, number>,
  expenses: Map<string, PortfolioFlow>,
  income: Map<string, PortfolioFlow>,
  realizedPnl: PortfolioRealizedPnl[],
  diagnostics: NavorDiagnostic[],
) {
  const fillRatio = computeTransactionFillRatio(directive, holdings, diagnostics)

  if (fillRatio === 0) {
    return
  }

  for (const posting of directive.postings) {
    const quantity = posting.quantity * fillRatio

    if (posting.account.startsWith('Assets:Cash:')) {
      cash.set(posting.commodity, (cash.get(posting.commodity) ?? 0) + quantity)
      continue
    }

    if (posting.account.startsWith('Expenses:')) {
      addFlow(expenses, posting.account, quantity, posting.commodity)
      continue
    }

    if (posting.account.startsWith('Income:')) {
      addFlow(income, posting.account, quantity, posting.commodity)
      continue
    }

    if (posting.account.startsWith('Assets:')) {
      addHolding(holdings, { ...posting, quantity }, directive, realizedPnl)
    }
  }
}

function computeTransactionFillRatio(
  directive: NavorDirective,
  holdings: Map<string, PortfolioHolding>,
  diagnostics: NavorDiagnostic[],
): number {
  let fillRatio = 1

  for (const posting of directive.postings) {
    if (!isAssetHoldingPosting(posting) || posting.quantity >= 0) {
      continue
    }

    const sellQuantity = Math.abs(posting.quantity)
    const assetSubject = postingAccountToAssetSubject(posting.account)
    const priorQuantity = holdings.get(assetSubject)?.quantity ?? 0

    if (priorQuantity <= 0) {
      diagnostics.push({
        line: directive.line,
        file: directive.file,
        message: `Sell exceeds holdings for "${assetSubject}". Transaction skipped.`,
      })
      return 0
    }

    if (sellQuantity > priorQuantity) {
      diagnostics.push({
        line: directive.line,
        file: directive.file,
        message: `Sell quantity exceeds holdings for "${assetSubject}". Applied partial fill.`,
      })
      fillRatio = Math.min(fillRatio, priorQuantity / sellQuantity)
    }
  }

  return fillRatio
}

function addHolding(
  holdings: Map<string, PortfolioHolding>,
  posting: NavorPosting,
  directive: NavorDirective,
  realizedPnl: PortfolioRealizedPnl[],
) {
  const assetSubject = postingAccountToAssetSubject(posting.account)
  const existing = holdings.get(assetSubject) ?? {
    asset: assetSubject,
    commodity: posting.commodity,
    quantity: 0,
    cost: posting.price ? { amount: 0, currency: posting.price.currency } : null,
  }

  if (posting.quantity > 0) {
    existing.quantity += posting.quantity

    if (posting.price) {
      const currentCost = existing.cost ?? { amount: 0, currency: posting.price.currency }
      currentCost.amount += posting.quantity * posting.price.amount
      existing.cost = currentCost
    }

    holdings.set(assetSubject, existing)
    return
  }

  if (posting.quantity < 0) {
    const sellQuantity = Math.abs(posting.quantity)
    const priorQuantity = existing.quantity
    const averageCostPerUnit =
      existing.cost && priorQuantity > 0 ? existing.cost.amount / priorQuantity : 0
    const costRemoved = sellQuantity * averageCostPerUnit

    if (existing.cost) {
      existing.cost.amount -= costRemoved
      if (existing.cost.amount < 0) {
        existing.cost.amount = 0
      }
    }

    existing.quantity += posting.quantity

    if (posting.price) {
      const proceeds = sellQuantity * posting.price.amount
      realizedPnl.push({
        asset: assetSubject,
        date: directive.date,
        title: directive.title,
        amount: {
          amount: proceeds - costRemoved,
          currency: posting.price.currency,
        },
      })
    }
  }

  holdings.set(assetSubject, existing)
}

function isAssetHoldingPosting(posting: NavorPosting): boolean {
  return posting.account.startsWith('Assets:') && !posting.account.startsWith('Assets:Cash:')
}

function postingAccountToAssetSubject(account: string): string {
  return `Asset:${account.replace(/^Assets:/, '')}`
}

function addFlow(
  flows: Map<string, PortfolioFlow>,
  account: string,
  amount: number,
  currency: string,
) {
  const key = `${account}:${currency}`
  const existing = flows.get(key) ?? { account, amount: 0, currency }
  existing.amount += amount
  flows.set(key, existing)
}
