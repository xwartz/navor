import type { PortfolioTransactionView } from '@navor/contract'

export type TransactionKind = 'Buy' | 'Sell' | 'Income' | 'Fee' | 'Cash'

export function isAssetHoldingPosting(posting: PortfolioTransactionView['postings'][number]) {
  return posting.account.startsWith('Assets:') && !posting.account.startsWith('Assets:Cash:')
}

export function transactionType(transaction: PortfolioTransactionView): TransactionKind {
  const title = `${transaction.title ?? ''} ${transaction.subject}`.toLowerCase()
  const holdingPostings = transaction.postings.filter(isAssetHoldingPosting)
  const hasAssetIn = holdingPostings.some((posting) => posting.quantity > 0)
  const hasAssetOut = holdingPostings.some((posting) => posting.quantity < 0)
  const hasIncome = transaction.postings.some((posting) => posting.account.startsWith('Income:'))
  const hasExpense = transaction.postings.some((posting) => posting.account.startsWith('Expenses:'))

  if (hasIncome || title.includes('dividend')) {
    return 'Income'
  }

  if (matchesSellTitle(title) || hasAssetOut) {
    return 'Sell'
  }

  if (matchesBuyTitle(title) || hasAssetIn) {
    return 'Buy'
  }

  if (hasExpense || title.includes('fee')) {
    return 'Fee'
  }

  return 'Cash'
}

export function transactionTone(transaction: PortfolioTransactionView) {
  switch (transactionType(transaction)) {
    case 'Buy':
      return 'accent'
    case 'Sell':
      return 'warning'
    case 'Income':
      return 'positive'
    case 'Fee':
      return 'danger'
    default:
      return 'neutral'
  }
}

function matchesBuyTitle(title: string) {
  return (
    title.includes('buy') ||
    title.includes('买入') ||
    title.includes('建仓') ||
    title.includes('定投')
  )
}

function matchesSellTitle(title: string) {
  return (
    title.includes('sell') ||
    title.includes('trim') ||
    title.includes('卖出') ||
    title.includes('减持') ||
    title.includes('清仓')
  )
}
