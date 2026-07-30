import type { NavorRendererAppState, PortfolioTransactionView } from '@navor/contract'
import { useState } from 'react'
import { DataTable, type DataTableRow } from '../components/DataTable'
import { formatMoney } from '../components/format'
import { Panel } from '../components/Panel'
import { QuantityCommodity } from '../components/QuantityCommodity'
import { Chip, EntityCell, SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'
import { type MessageKey, t } from '../i18n'
import { transactionTone, transactionType } from '../transaction-type'

export function TransactionsView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'realized' | 'flows'>('transactions')
  const { type: transactionTypeFilter, ...baseFilters } = filters
  const transactions = (state.portfolio.transactions ?? []).filter(
    (transaction) =>
      matchesFilters(transaction, baseFilters) &&
      (!transactionTypeFilter || transactionType(transaction) === transactionTypeFilter),
  )
  const typeCounts = transactions.reduce<Record<string, number>>((counts, transaction) => {
    const type = transactionType(transaction)
    counts[type] = (counts[type] ?? 0) + 1
    return counts
  }, {})

  return (
    <div className="space-y-5">
      <ViewHeader description="All portfolio activity." eyebrow="Portfolio" title="Ledger" />

      <div
        aria-label="Ledger views"
        className="meta-scroll -mx-1 flex gap-1 overflow-x-auto border-b border-border/80 px-1 pb-3"
        role="tablist"
      >
        {(
          [
            { id: 'transactions' as const, label: 'Transactions' },
            { id: 'realized' as const, label: 'Realized PnL' },
            { id: 'flows' as const, label: 'Cash & flows' },
          ] as Array<{ id: 'transactions' | 'realized' | 'flows'; label: MessageKey }>
        ).map((tab) => {
          const selected = activeTab === tab.id
          return (
            <button
              aria-selected={selected}
              className={`press-scale min-h-10 shrink-0 rounded-md px-3 text-xs font-semibold transition-[background-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 ${selected ? 'bg-paper-elevated text-ink shadow-[inset_0_-1px_0_var(--color-accent)]' : 'text-ink-muted [@media(hover:hover)]:hover:bg-paper-elevated [@media(hover:hover)]:hover:text-ink'}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              {t(tab.label)}
            </button>
          )
        })}
      </div>

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

      {activeTab === 'transactions' && (
        <Panel
          description="Scan the economic event first, then open a row only when you need its double-entry detail."
          title="Transaction history"
        >
          <TransactionLedger transactions={transactions} />
        </Panel>
      )}
      {activeTab === 'realized' && <RealizedPnlTable state={state} />}
      {activeTab === 'flows' && <CashAndFlows state={state} />}
    </div>
  )
}

function RealizedPnlTable({ state }: { state: NavorRendererAppState }) {
  return (
    <Panel
      description="Closed-position gains and losses, kept with the economic ledger rather than current holdings."
      title="Realized PnL"
    >
      <DataTable
        columns={[
          { key: 'date', label: 'Date', sortable: true, sticky: true },
          { key: 'asset', label: 'Asset', sortable: true },
          { key: 'title', label: 'Transaction', sortable: true },
          { key: 'amount', label: 'Realized', align: 'right', sortable: true },
        ]}
        emptyMessage="No realized gains or losses recorded yet."
        rows={(state.portfolio.realizedPnl ?? []).map((entry) => ({
          id: `${entry.date}:${entry.asset}:${entry.title ?? ''}:${entry.amount.amount}`,
          cells: {
            date: entry.date,
            asset: <EntityCell interactive subject={entry.asset} />,
            title: entry.title ?? 'n/a',
            amount: formatMoney(entry.amount),
          },
          sortValues: {
            date: entry.date,
            asset: entry.asset,
            title: entry.title ?? '',
            amount: entry.amount.amount,
          },
        }))}
      />
    </Panel>
  )
}

function CashAndFlows({ state }: { state: NavorRendererAppState }) {
  return (
    <section className="grid gap-5 lg:grid-cols-3">
      <Panel title="Cash">
        <DataTable
          columns={[
            { key: 'currency', label: 'Currency', sortable: true, sticky: true },
            { key: 'amount', label: 'Amount', align: 'right', sortable: true },
          ]}
          rows={state.portfolio.cash.map((balance) => ({
            id: balance.currency,
            cells: { currency: balance.currency, amount: balance.amount.toLocaleString() },
            sortValues: { currency: balance.currency, amount: balance.amount },
          }))}
        />
      </Panel>
      <Panel title="Income">
        <FlowTable flows={state.portfolio.income} />
      </Panel>
      <Panel title="Expenses">
        <FlowTable flows={state.portfolio.expenses} />
      </Panel>
    </section>
  )
}

function FlowTable({ flows }: { flows: NavorRendererAppState['portfolio']['income'] }) {
  if (flows.length === 0) return <p className="text-sm text-ink-muted">{t('No flows recorded.')}</p>
  return (
    <DataTable
      columns={[
        { key: 'account', label: 'Account', sortable: true, sticky: true },
        { key: 'amount', label: 'Amount', align: 'right', sortable: true },
      ]}
      rows={flows.map((flow) => ({
        id: `${flow.account}:${flow.amount}:${flow.currency}`,
        cells: {
          account: <EntityCell subject={flow.account} />,
          amount: `${flow.amount} ${flow.currency}`,
        },
        sortValues: { account: flow.account, amount: flow.amount },
      }))}
    />
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

  const rows = transactions.map((transaction) => transactionRow(transaction))
  const transactionsById = new Map(
    transactions.map((transaction) => [transactionId(transaction), transaction]),
  )

  return (
    <DataTable
      columns={[
        { key: 'type', label: 'Type', sortable: true },
        { key: 'date', label: 'Date', sortable: true, sticky: true, hideable: false },
        { key: 'asset', label: 'Asset', sortable: true },
        { key: 'quantity', label: 'Quantity', align: 'right', sortable: true },
        { key: 'price', label: 'Price', align: 'right', mobileHidden: true, sortable: true },
        { key: 'account', label: 'Market', sortable: true },
      ]}
      defaultSortDirection="desc"
      defaultSortKey="date"
      emptyMessage="No transactions match the current filters."
      renderExpandedRow={(row) => {
        const transaction = transactionsById.get(row.id)
        return transaction ? <TransactionDetails transaction={transaction} /> : null
      }}
      rows={rows}
      storageKey="ledger"
    />
  )
}

function transactionRow(transaction: PortfolioTransactionView): DataTableRow {
  const primaryPosting =
    transaction.postings.find(
      (posting) =>
        posting.account.startsWith('Assets:') && !posting.account.startsWith('Assets:Cash:'),
    ) ?? transaction.postings[0]

  return {
    id: transactionId(transaction),
    cells: {
      type: <Chip tone={transactionTone(transaction)}>{transactionType(transaction)}</Chip>,
      date: <time className="tabular-nums text-ink-muted">{transaction.date}</time>,
      asset: (
        <EntityCell
          subject={transaction.subject}
          title={transaction.title ?? transaction.subject}
        />
      ),
      quantity: primaryPosting ? (
        <QuantityCommodity
          commodity={primaryPosting.commodity}
          quantity={primaryPosting.quantity}
        />
      ) : (
        '—'
      ),
      price: primaryPosting?.price ? formatPrice(primaryPosting.price) : '—',
      account: primaryPosting ? marketCategory(primaryPosting.account) : '—',
    },
    sortValues: {
      type: transactionType(transaction),
      date: transaction.date,
      asset: transaction.title ?? transaction.subject,
      quantity: primaryPosting?.quantity ?? 0,
      price: primaryPosting?.price?.amount ?? 0,
      account: primaryPosting?.account ?? '',
    },
  }
}

function TransactionDetails({ transaction }: { transaction: PortfolioTransactionView }) {
  return (
    <div className="max-w-3xl">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
        {t('Double-entry postings')}
      </p>
      <PostingList transaction={transaction} />
    </div>
  )
}

function transactionId(transaction: PortfolioTransactionView) {
  return `${transaction.date}:${transaction.subject}:${transaction.line}`
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

function compactAccount(account: string) {
  const parts = account.split(':')

  if (parts.length <= 2) {
    return account
  }

  return parts.slice(-2).join(':')
}

function marketCategory(account: string) {
  const parts = account.split(':')
  if (parts[1] === 'Crypto') return 'Digital assets'
  if (parts[1] === 'Equity' && parts[2] === 'US') return 'US equities'
  if (parts[1] === 'Equity' && parts[2] === 'CN') return 'A shares'
  if (parts[1] === 'Equity' && parts[2] === 'HK') return 'Hong Kong equities'
  if (parts[1] === 'Cash') return 'Cash'
  return compactAccount(account)
}

function formatPrice(price: NonNullable<PortfolioTransactionView['postings'][number]['price']>) {
  return `@ ${formatMoney(price)}`
}
