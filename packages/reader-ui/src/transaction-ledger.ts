import type { PortfolioTransactionView } from '@navor/contract'

/** Newest date first, matching Dashboard recent activity. */
export function compareTransactionsNewestFirst(
  left: PortfolioTransactionView,
  right: PortfolioTransactionView,
) {
  const dateComparison = right.date.localeCompare(left.date)
  if (dateComparison !== 0) {
    return dateComparison
  }

  const subjectComparison = left.subject.localeCompare(right.subject)
  if (subjectComparison !== 0) {
    return subjectComparison
  }

  return (left.line ?? 0) - (right.line ?? 0)
}

export function groupTransactionsByMonth(transactions: PortfolioTransactionView[]) {
  const ordered = [...transactions].sort(compareTransactionsNewestFirst)
  const groups = new Map<string, PortfolioTransactionView[]>()

  for (const transaction of ordered) {
    const month = transaction.date.slice(0, 7)
    const group = groups.get(month) ?? []
    group.push(transaction)
    groups.set(month, group)
  }

  return [...groups.entries()]
}
