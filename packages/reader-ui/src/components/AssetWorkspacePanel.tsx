import type { NavorRendererAppState } from '@navor/contract'
import { type ReactNode, useEffect, useRef, useState } from 'react'

import type { AssetNarrativeIndex } from '../asset-workspace'
import { useAssetWorkspace } from '../asset-workspace-context'
import { useEntityLabel } from '../EntityLabelContext'
import { readableEntityTitle, shortSubjectLabel } from '../entity-labels'
import {
  formatDashboardActionLabel,
  formatDashboardActionReason,
  formatReviewDeadline,
  t,
} from '../i18n'
import {
  formatMoney,
  formatPercent,
  formatQuantityCommodity,
  formatSignedMoney,
  formatSignedPercent,
  formatTimestamp,
} from './format'
import { Chip, TimelineFeed } from './ViewScaffold'

export function AssetWorkspaceOverlay() {
  const { assetWorkspace, closeAsset, selectedAssetSubject } = useAssetWorkspace()

  if (!selectedAssetSubject) {
    return null
  }

  return (
    <AssetWorkspacePanel
      facts={assetWorkspace.get(selectedAssetSubject)}
      onClose={closeAsset}
      subject={selectedAssetSubject}
    />
  )
}

function AssetWorkspacePanel({
  facts,
  onClose,
  subject,
}: {
  facts: ReturnType<AssetNarrativeIndex['get']>
  onClose: () => void
  subject: string
}) {
  const panelRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [isModal, setIsModal] = useState(true)
  const label = useEntityLabel(subject)
  const execution = facts?.execution ?? null
  const holding = facts?.holding ?? null
  const market = facts?.market ?? null
  const drift = facts?.drift ?? null
  const plan = facts?.plan ?? null
  const price = facts?.price ?? null
  const watchlist = facts?.watchlist ?? null
  const accountTitle = useEntityLabel(execution?.account ?? watchlist?.account)
  const actions = facts?.actions ?? []
  const researchTimeline = buildResearchTimeline(facts)
  const decisionsTimeline = buildDecisionsTimeline(facts)
  const evidenceTimeline = [...researchTimeline, ...decisionsTimeline].toSorted((left, right) =>
    right.date.localeCompare(left.date),
  )

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1279px)')
    const sync = () => setIsModal(media.matches)

    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (isModal) {
      closeButtonRef.current?.focus()
    }

    const panel = panelRef.current
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (!isModal || event.key !== 'Tab' || !panel) {
        return
      }

      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      const first = focusable.item(0)
      const last = focusable.item(focusable.length - 1)

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isModal, onClose])

  useEffect(() => {
    if (!isModal) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isModal])

  return (
    <>
      {isModal ? (
        <button
          aria-label={t('Close asset workspace')}
          className="fixed inset-0 z-[60] bg-ink/25 xl:hidden"
          onClick={onClose}
          tabIndex={-1}
          type="button"
        />
      ) : null}
      <aside
        aria-labelledby="asset-workspace-title"
        className={`fixed inset-y-0 right-0 z-[70] flex w-full flex-col bg-paper-elevated sm:w-[30rem] xl:w-[22rem] 2xl:w-[30rem] ${
          isModal
            ? 'shadow-[-16px_0_48px_rgba(0,0,0,0.45)]'
            : 'border-l border-border shadow-[-8px_0_24px_rgba(0,0,0,0.24)]'
        }`}
        ref={panelRef}
        role={isModal ? 'dialog' : 'complementary'}
        {...(isModal ? { 'aria-modal': true } : {})}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border bg-paper-elevated px-5 py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
              {t('Asset workspace')}
            </p>
            <h2
              className="mt-1 truncate text-xl font-bold tracking-[-0.018em] text-ink"
              id="asset-workspace-title"
            >
              {readableEntityTitle(label, subject)}
            </h2>
            <p className="mt-1 truncate font-mono text-[11px] text-ink-faint">
              {label?.symbol ?? shortSubjectLabel(subject)}
            </p>
          </div>
          <button
            aria-label={t('Close asset workspace')}
            className="press-scale grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border bg-paper text-lg text-ink-muted transition-[background-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-accent-soft [@media(hover:hover)]:hover:text-ink"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <span aria-hidden>×</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-5">
            <section id="snapshot">
              <div className="flex flex-wrap items-center gap-2">
                {execution ? (
                  <Chip tone={statusTone(execution.status)}>{statusLabel(execution.status)}</Chip>
                ) : (
                  <Chip>{t('Tracked')}</Chip>
                )}
                <span className="text-xs text-ink-muted">
                  {accountTitle?.title ?? t('No account assigned')}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {execution
                  ? statusDescription(execution.status)
                  : (watchlist?.watchReason ?? t('No funded position or execution target yet.'))}
              </p>
            </section>

            <section className="grid grid-cols-2 overflow-hidden rounded-md border border-border">
              <WorkspaceMetric label="Market value" value={formatMoney(market?.marketValue)} />
              <WorkspaceMetric
                label="PnL"
                tone={(market?.pnl?.amount ?? 0) < 0 ? 'danger' : 'positive'}
                value={formatSignedMoney(market?.pnl)}
              />
              <WorkspaceMetric label="Actual weight" value={formatPercent(drift?.actualWeight)} />
              <WorkspaceMetric
                label="Drift"
                tone={
                  (drift?.drift ?? 0) > 0
                    ? 'danger'
                    : (drift?.drift ?? 0) < 0
                      ? 'positive'
                      : 'neutral'
                }
                value={formatSignedPercent(drift?.drift)}
              />
            </section>

            <section
              className="overflow-hidden rounded-md border border-border bg-paper"
              id="judgment"
            >
              <div className="border-b border-border px-3 py-2.5">
                <h3 className="text-xs font-semibold text-ink">{t('Decision basis')}</h3>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-3 py-3">
                <WorkspaceFact
                  label="Invested"
                  value={formatMoney(execution?.investedCost ?? holding?.cost)}
                />
                <WorkspaceFact label="Target" value={formatMoney(execution?.targetAmount)} />
                <WorkspaceFact label="Plan target" value={formatPercent(plan?.target)} />
                <WorkspaceFact
                  label="Plan band"
                  value={
                    plan
                      ? `${formatPercent(plan.min)} / ${formatPercent(plan.max)}`
                      : t('Not available')
                  }
                />
              </dl>
            </section>

            <WorkspaceSection id="position" title="Position details">
              <dl className="grid grid-cols-2 gap-4">
                <WorkspaceFact label="Price" value={formatMoney(price?.price)} />
                <WorkspaceFact
                  label="Quantity"
                  value={
                    holding
                      ? formatQuantityCommodity(holding.quantity, holding.commodity)
                      : t('Not available')
                  }
                />
                <WorkspaceFact
                  label="Cost"
                  value={formatMoney(execution?.investedCost ?? holding?.cost)}
                />
                <WorkspaceFact label="Price updated" value={formatTimestamp(price?.asOf)} />
              </dl>
            </WorkspaceSection>

            {actions.length > 0 ? (
              <WorkspaceSection id="actions" title="Next actions">
                <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
                  {actions.map((item) => (
                    <div className="px-3 py-3" key={item.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-ink">
                            {formatDashboardActionLabel(item.type)}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-ink-muted">
                            {formatDashboardActionReason(item.reason)}
                          </p>
                        </div>
                        <Chip tone={item.severity === 'high' ? 'danger' : 'warning'}>
                          {severityLabel(item.severity)}
                        </Chip>
                      </div>
                    </div>
                  ))}
                </div>
              </WorkspaceSection>
            ) : null}

            <WorkspaceSection id="evidence" title="Evidence and decisions">
              {evidenceTimeline.length > 0 ? (
                <TimelineFeed items={evidenceTimeline} />
              ) : (
                <QuietMessage>{t('No research, thesis, or decision is linked yet.')}</QuietMessage>
              )}
            </WorkspaceSection>

            <WorkspaceSection id="transactions" title="Recent transactions">
              {facts?.transactions.length ? (
                <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
                  {facts.transactions.slice(0, 3).map((transaction) => (
                    <div className="px-3 py-3" key={`${transaction.date}:${transaction.line}`}>
                      <p className="text-xs font-semibold text-ink">
                        {readableEntityTitle(label, transaction.subject, transaction.title)}
                      </p>
                      <p className="mt-1 text-xs tabular-nums text-ink-muted">{transaction.date}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {formatTransactionDecision(transaction)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <QuietMessage>{t('No transactions are recorded for this asset.')}</QuietMessage>
              )}
            </WorkspaceSection>
          </div>
        </div>
      </aside>
    </>
  )
}

function WorkspaceMetric({
  label,
  tone = 'neutral',
  value,
}: {
  label: import('../i18n').MessageKey
  tone?: 'neutral' | 'positive' | 'danger'
  value: string
}) {
  return (
    <div className="border-r border-b border-border px-3 py-3 even:border-r-0 nth-[n+3]:border-b-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
        {t(label)}
      </p>
      <p
        className={`mt-1 break-words text-sm font-semibold tabular-nums ${
          tone === 'danger' ? 'text-danger' : tone === 'positive' ? 'text-positive' : 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function WorkspaceSection({
  children,
  id,
  title,
}: {
  children: ReactNode
  id?: string
  title: import('../i18n').MessageKey
}) {
  return (
    <section className="border-t border-border pt-4" id={id}>
      <h3 className="font-ui text-sm font-semibold text-ink">{t(title)}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function WorkspaceFact({ label, value }: { label: import('../i18n').MessageKey; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
        {t(label)}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium tabular-nums text-ink">{value}</dd>
    </div>
  )
}

function QuietMessage({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border-strong/70 bg-paper px-3 py-3 text-sm leading-6 text-ink-muted">
      {children}
    </p>
  )
}

function buildResearchTimeline(facts: ReturnType<AssetNarrativeIndex['get']>) {
  if (!facts) return []

  return facts.researchTimeline.map((item) => {
    if ('tags' in item) {
      return {
        id: `research:${item.date}:${item.title}`,
        date: item.date,
        label: t('Research'),
        title: item.title ?? item.subject,
        subject: item.tags.join(' · '),
      }
    }

    return {
      id: `thesis:${item.date}:${item.title}`,
      date: item.date,
      label: t('Thesis'),
      title: item.title ?? item.subject,
      subject:
        formatReference(item.basedOnReference) ??
        (item.reviewBy ? formatReviewDeadline(item.reviewBy) : item.status),
    }
  })
}

function buildDecisionsTimeline(facts: ReturnType<AssetNarrativeIndex['get']>) {
  if (!facts) return []

  return facts.decisionTimeline
    .map((item) => ({
      id: `decision:${item.date}:${item.title}`,
      date: item.date,
      label: t('Decision'),
      title: item.title ?? item.subject,
      subject: [
        formatReference(item.basedOnReference),
        formatApplicablePlan(facts.plans, item.date),
        item.action,
      ]
        .filter(Boolean)
        .join(' · '),
    }))
    .sort((left, right) => right.date.localeCompare(left.date))
}

function formatApplicablePlan(plans: NavorRendererAppState['plan']['entries'], date: string) {
  const plan = plans.find((item) => date.localeCompare(item.date) !== -1)
  return plan ? `${t('Plan')}: ${plan.title ?? plan.date}` : null
}

function formatReference(
  reference: NavorRendererAppState['knowledge']['decisions'][number]['basedOnReference'],
) {
  if (!reference) return null
  if (reference.status === 'resolved') {
    return `${t('Based on')}: ${reference.target?.title ?? reference.target?.date ?? reference.raw}`
  }
  if (reference.status === 'ambiguous')
    return `${t('Reference needs clarification')}: ${reference.raw}`
  if (reference.status === 'unresolved' || reference.status === 'future') {
    return `${t('Reference does not resolve')}: ${reference.raw}`
  }
  return `${t('Legacy reference')}: ${reference.raw}`
}

function formatTransactionDecision(
  transaction: NavorRendererAppState['portfolio']['transactions'][number],
) {
  const reference = transaction.decisionReference
  if (!reference) return t('No decision is linked to this transaction.')
  if (reference.status === 'resolved') {
    return `${t('Decision')}: ${reference.target?.title ?? reference.target?.date ?? reference.raw}`
  }
  return formatReference(reference) ?? t('No decision is linked to this transaction.')
}

function severityLabel(
  severity: NavorRendererAppState['dashboard']['actionInbox'][number]['severity'],
) {
  if (severity === 'high') return t('High')
  if (severity === 'medium') return t('Medium')
  return t('Low')
}

function statusTone(
  status: NavorRendererAppState['dashboard']['assetExecutions'][number]['status'],
) {
  if (status === 'above_max' || status === 'over_invested') return 'danger' as const
  if (status === 'below_min' || status === 'not_started' || status === 'currency_mismatch') {
    return 'warning' as const
  }
  return 'positive' as const
}

function statusLabel(status: string) {
  switch (status) {
    case 'not_started':
      return t('Not funded')
    case 'building':
      return t('Still building')
    case 'complete':
      return t('Target reached')
    case 'over_invested':
      return t('Over target')
    case 'above_max':
      return t('Above target range')
    case 'below_min':
      return t('Below target range')
    case 'currency_mismatch':
      return t('Currency mismatch')
    default:
      return t('Tracked')
  }
}

function statusDescription(status: string) {
  switch (status) {
    case 'not_started':
      return t('No transaction has been recorded against this target.')
    case 'building':
      return t('The position is funded but remains below its target amount.')
    case 'complete':
      return t('The position is aligned with its target amount.')
    case 'over_invested':
      return t('Invested cost exceeds the configured target amount.')
    case 'above_max':
      return t('Current portfolio weight is above the target range.')
    case 'below_min':
      return t('Current portfolio weight is below the target range.')
    case 'currency_mismatch':
      return t(
        'Target and invested cost use different currencies, so funding progress is not comparable.',
      )
    default:
      return t('Asset tracking')
  }
}
