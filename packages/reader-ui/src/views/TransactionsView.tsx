import type { NavorRendererAppState, PortfolioTransactionView } from '@navor/contract'

import { formatMoney } from '../components/format'
import { Panel } from '../components/Panel'
import { QuantityCommodity } from '../components/QuantityCommodity'
import { Chip, EntityCell, SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'
import { formatTransactionCount, t } from '../i18n'
import { groupTransactionsByMonth } from '../transaction-ledger'
import { transactionTone, transactionType } from '../transaction-type'

export function TransactionsView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const transactions = (state.portfolio.transactions ?? []).filter((transaction) =>
    matchesFilters(transaction, filters),
  )
  const typeCounts = transactions.reduce<Record<string, number>>((counts, transaction) => {
    const type = transactionType(transaction)
    counts[type] = (counts[type] ?? 0) + 1
    return counts
  }, {})

  return (
    <div className="space-y-5">
      <ViewHeader description="All portfolio activity." eyebrow="Portfolio" title="Ledger" />

      <SummaryStrip
        items={[
          { label: 'Transactions', value: String(state.portfolio.transactions?.length ?? 0) },
          {
            label: 'Buys',
            value: String(typeCounts.Buy ?? 0),
          },
          {
            label: 'Sells',
            value: String(typeCounts.Sell ?? 0),
          },
          {
            label: 'Income and fees',
            value: String((typeCounts.Income ?? 0) + (typeCounts.Fee ?? 0)),
            detail:
              transactions.length === (state.portfolio.transactions?.length ?? 0)
                ? undefined
                : `${transactions.length} match current filters`,
          },
        ]}
      />

      <Panel
        description="Scan the economic event first, then open a row only when you need its double-entry detail."
        title="Transaction history"
      >
        <TransactionLedger transactions={transactions} />
      </Panel>
    </div>
  )
}

function TransactionLedger({ transactions }: { transactions: PortfolioTransactionView[] }) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-md border border-border bg-paper px-4 py-8 text-center text-sm text-ink-muted">
        {t('No transactions match the current filters.')}
      </div>
    )
  }

  const groups = groupTransactionsByMonth(transactions)

  return (
    <div className="space-y-6">
      {groups.map(([month, monthTransactions]) => (
        <section key={month}>
          <div className="mb-2 flex items-baseline justify-between gap-4 border-b border-border pb-2">
            <h3 className="font-ui text-sm font-semibold text-ink">{formatMonth(month)}</h3>
            <span className="text-xs tabular-nums text-ink-faint">
              {formatTransactionCount(monthTransactions.length)}
            </span>
          </div>
          <div className="divide-y divide-border/80">
            {monthTransactions.map((transaction) => (
              <TransactionRow
                key={`${transaction.date}:${transaction.subject}:${transaction.line}`}
                transaction={transaction}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function TransactionRow({ transaction }: { transaction: PortfolioTransactionView }) {
  const primaryPosting =
    transaction.postings.find(
      (posting) =>
        posting.account.startsWith('Assets:') && !posting.account.startsWith('Assets:Cash:'),
    ) ?? transaction.postings[0]

  return (
    <details className="group">
      <summary className="grid min-h-16 cursor-pointer list-none grid-cols-[4.75rem_minmax(0,1fr)_1rem] items-center gap-x-3 gap-y-1 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 md:grid-cols-[6.5rem_5.5rem_minmax(12rem,1fr)_minmax(10rem,0.75fr)_1rem] md:gap-3 [&::-webkit-details-marker]:hidden">
        <time className="col-start-1 row-start-1 text-xs font-medium tabular-nums text-ink-faint md:col-auto md:row-auto">
          {transaction.date}
        </time>
        <div className="col-start-1 row-start-2 md:col-auto md:row-auto">
          <Chip tone={transactionTone(transaction)}>{transactionType(transaction)}</Chip>
        </div>
        <div className="col-start-2 row-start-1 min-w-0 md:col-auto md:row-auto">
          <EntityCell
            subject={transaction.subject}
            title={transaction.title ?? transaction.subject}
          />
        </div>
        <div className="col-start-2 row-start-2 min-w-0 md:col-auto md:row-auto md:text-right">
          {primaryPosting ? (
            <>
              <p className="font-medium tabular-nums text-ink">
                <QuantityCommodity
                  commodity={primaryPosting.commodity}
                  quantity={primaryPosting.quantity}
                />
              </p>
              {primaryPosting.price ? (
                <p className="text-xs tabular-nums text-ink-faint">
                  {formatPrice(primaryPosting.price)}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
        <span
          aria-hidden
          className="col-start-3 row-span-2 row-start-1 text-right text-xs text-ink-faint transition-transform duration-150 group-open:rotate-90 md:col-auto md:row-auto md:row-span-1"
        >
          ›
        </span>
      </summary>
      <div className="pb-4 md:pl-[12rem]">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
          {t('Double-entry postings')}
        </p>
        <PostingList transaction={transaction} />
      </div>
    </details>
  )
}

function PostingList({ transaction }: { transaction: PortfolioTransactionView }) {
  return (
    <div className="border-y border-border/80">
      {transaction.postings.map((posting) => (
        <div
          className="grid gap-1 border-b border-border/70 py-2 text-xs last:border-b-0 sm:grid-cols-[minmax(0,1fr)_9rem_8rem] sm:items-baseline sm:gap-3"
          key={`${posting.account}:${posting.quantity}:${posting.commodity}:${posting.price?.amount ?? ''}:${posting.price?.currency ?? ''}`}
        >
          <span className="min-w-0 truncate font-medium text-ink">
            {compactAccount(posting.account)}
          </span>
          <span
            className={`tabular-nums sm:text-right ${
              posting.quantity < 0 ? 'text-danger' : 'text-positive'
            }`}
          >
            <QuantityCommodity commodity={posting.commodity} quantity={posting.quantity} />
          </span>
          <span className="tabular-nums text-ink-faint sm:text-right">
            {posting.price ? formatPrice(posting.price) : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

function formatMonth(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)

  if (!year || !monthNumber) {
    return month
  }

  return new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)))
}

function compactAccount(account: string) {
  const parts = account.split(':')

  if (parts.length <= 2) {
    return account
  }

  return parts.slice(-2).join(':')
}

function formatPrice(price: NonNullable<PortfolioTransactionView['postings'][number]['price']>) {
  return `@ ${formatMoney(price)}`
}
