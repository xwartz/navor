import type { NavorRendererAppState } from '@navor/contract'
import { type ReactNode, useEffect, useRef, useState } from 'react'

import type { AssetNarrativeIndex } from '../asset-workspace'
import { useAssetWorkspace } from '../asset-workspace-context'
import { useEntityLabel } from '../EntityLabelContext'
import { readableEntityTitle, shortSubjectLabel } from '../entity-labels'
import {
  formatDashboardActionInstruction,
  formatDashboardActionLabel,
  formatDashboardActionReason,
  formatReviewDeadline,
  type MessageKey,
  t,
} from '../i18n'
import {
  averagePrice,
  formatMoney,
  formatPercent,
  formatQuantityCommodity,
  formatSignedMoney,
  formatSignedPercent,
  formatTimestamp,
} from './format'
import { ProgressMeter, WeightGap } from './PortfolioVisuals'
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
  const invested = execution?.investedCost ?? holding?.cost ?? null
  const average = holding ? averagePrice(holding.cost, holding.quantity) : null
  const heroValue = market?.marketValue ?? invested
  const pnlPercent =
    market?.pnl && market.cost?.amount ? (market.pnl.amount / market.cost.amount) * 100 : null
  const bandMin = plan?.min ?? drift?.planMin ?? null
  const bandMax = plan?.max ?? drift?.planMax ?? null
  const targetWeight = drift?.targetWeight ?? plan?.target ?? null
  const actualWeight = drift?.actualWeight ?? null
  const bandAction =
    actualWeight !== null && bandMax !== null && actualWeight > bandMax
      ? plan?.actionWhenAbove
      : actualWeight !== null && bandMin !== null && actualWeight < bandMin
        ? plan?.actionWhenBelow
        : null
  const hasWeight = actualWeight !== null || targetWeight !== null
  const hasFunding = Boolean(execution?.targetAmount)
  const positionFacts: Array<[MessageKey, string | null, string?]> = [
    ['Quantity', holding ? formatQuantityCommodity(holding.quantity, holding.commodity) : null],
    ['Price', price ? formatMoney(price.price) : null],
    ['Average price', average ? formatMoney(average) : null],
    ['Cost', invested ? formatMoney(invested) : null],
    ['Price updated', price?.asOf ? formatTimestamp(price.asOf) : null, price?.asOf],
  ]

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
          className="fixed inset-0 z-[60] bg-ink/25 backdrop-blur-[2px] xl:hidden"
          onClick={onClose}
          tabIndex={-1}
          type="button"
        />
      ) : null}
      <aside
        aria-labelledby="asset-workspace-title"
        className={`workspace-enter fixed inset-y-0 right-0 z-[70] flex w-full flex-col border-l border-border/60 bg-paper-elevated sm:w-[30rem] xl:w-[22rem] 2xl:w-[30rem] ${
          isModal ? 'shadow-[var(--shadow-lg)]' : 'shadow-[var(--shadow-md)]'
        }`}
        ref={panelRef}
        role={isModal ? 'dialog' : 'complementary'}
        {...(isModal ? { 'aria-modal': true } : {})}
      >
        <header className="flex items-start gap-3 border-b border-border/60 px-5 pt-5 pb-4">
          <div className="min-w-0 flex-1">
            <h2
              className="truncate font-display text-xl font-bold leading-7 tracking-[-0.02em] text-ink"
              id="asset-workspace-title"
            >
              {readableEntityTitle(label, subject)}
            </h2>
            <p className="mt-1 flex min-w-0 items-center gap-2 text-xs text-ink-muted">
              <span className="shrink-0 font-mono text-[11px] text-ink-faint">
                {label?.symbol ?? shortSubjectLabel(subject)}
              </span>
              <span aria-hidden className="text-ink-faint/60">
                ·
              </span>
              <span className="truncate">{accountTitle?.title ?? t('No account assigned')}</span>
            </p>
          </div>
          <button
            aria-label={t('Close asset workspace')}
            className="control-btn press-scale -mt-1 -mr-1 grid h-10 w-10 shrink-0 p-0 text-lg text-ink-muted [@media(hover:hover)]:hover:bg-accent-soft [@media(hover:hover)]:hover:text-ink"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <span aria-hidden>×</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {actions.length > 0 ? (
            <div className="border-b border-border/60 bg-warning-soft/35 px-5 py-3.5" id="actions">
              <p className="label-caps">{t('Next actions')}</p>
              <ul className="mt-2 space-y-2.5">
                {actions.map((item) => (
                  <li key={item.id}>
                    <p className="text-sm font-semibold text-ink">
                      {formatDashboardActionLabel(item.type)}
                      <span className="ml-2 text-[11px] font-medium text-ink-faint">
                        {severityLabel(item.severity)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                      {formatDashboardActionReason(item.reason)}
                    </p>
                    {item.action ? (
                      <p className="mt-1 text-xs font-medium text-accent-ink">
                        {formatDashboardActionInstruction(item.type)}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <section className="px-5 pt-5 pb-5" id="snapshot">
            <div className="flex items-center justify-between gap-3">
              <p className="label-caps">{t(market ? 'Market value' : 'Cost basis')}</p>
              {execution ? (
                <Chip tone={statusTone(execution.status)}>{statusLabel(execution.status)}</Chip>
              ) : (
                <Chip>{t('Tracked')}</Chip>
              )}
            </div>
            <p className="mt-1.5 font-display text-[1.75rem] font-semibold leading-9 tracking-[-0.02em] tabular-nums text-ink">
              {heroValue ? formatMoney(heroValue) : t('Not available')}
            </p>
            {market?.pnl ? (
              <p
                className={`mt-0.5 text-sm font-medium tabular-nums ${
                  market.pnl.amount < 0 ? 'text-danger' : 'text-positive'
                }`}
              >
                {formatSignedMoney(market.pnl)}
                {pnlPercent !== null ? (
                  <span className="ml-2 text-xs opacity-80">{formatSignedPercent(pnlPercent)}</span>
                ) : null}
                <span className="ml-2 text-xs font-normal text-ink-faint">
                  {t('Unrealized PnL')}
                </span>
              </p>
            ) : null}
            <p className="mt-3 text-sm leading-6 text-ink-muted">
              {execution
                ? statusDescription(execution.status)
                : (watchlist?.watchReason ?? t('No funded position or execution target yet.'))}
            </p>
          </section>

          {hasWeight || hasFunding ? (
            <WorkspaceSection id="judgment" title="Decision basis">
              {hasWeight ? (
                <div>
                  <div className="flex items-baseline justify-between gap-3 text-xs">
                    <span className="text-ink-muted">{t('Portfolio weight')}</span>
                    <span className="tabular-nums text-ink-faint">
                      <span className="text-sm font-semibold text-ink">
                        {formatPercent(actualWeight)}
                      </span>
                      {targetWeight !== null ? (
                        <>
                          {' '}
                          / {formatPercent(targetWeight)} {t('target')}
                        </>
                      ) : null}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <WeightGap
                      actual={actualWeight}
                      bandMax={bandMax}
                      bandMin={bandMin}
                      target={targetWeight}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-[11px] tabular-nums text-ink-faint">
                    <span>
                      {bandMin !== null && bandMax !== null
                        ? `${t('Plan band')} ${formatPercent(bandMin)} – ${formatPercent(bandMax)}`
                        : t('No plan band')}
                    </span>
                    {drift?.drift !== null && drift?.drift !== undefined ? (
                      <span
                        className={`font-semibold ${
                          drift.drift > 0
                            ? 'text-danger'
                            : drift.drift < 0
                              ? 'text-warning'
                              : 'text-ink-faint'
                        }`}
                      >
                        {formatSignedPercent(drift.drift)}
                      </span>
                    ) : null}
                  </div>
                  {bandAction ? (
                    <p className="mt-3 border-l-2 border-accent/50 pl-3 text-xs leading-5 text-ink-muted">
                      <span className="font-semibold text-ink">{t('Plan says')}</span> {bandAction}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {hasFunding && execution ? (
                <div className={hasWeight ? 'mt-5' : ''}>
                  <div className="flex items-baseline justify-between gap-3 text-xs">
                    <span className="text-ink-muted">{t('Funding progress')}</span>
                    <span className="tabular-nums text-ink-faint">
                      <span className="text-sm font-semibold text-ink">
                        {formatPercent(execution.investedPercent)}
                      </span>
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <ProgressMeter
                      tone={statusTone(execution.status) === 'danger' ? 'danger' : 'accent'}
                      value={execution.investedPercent}
                    />
                  </div>
                  <p className="mt-2 text-[11px] tabular-nums text-ink-faint">
                    {formatMoney(execution.investedCost)} / {formatMoney(execution.targetAmount)}
                  </p>
                </div>
              ) : null}
            </WorkspaceSection>
          ) : null}

          {positionFacts.some(([, value]) => value) ? (
            <WorkspaceSection id="position" title="Position details">
              <dl className="divide-y divide-border/50">
                {positionFacts.map(([factLabel, value, title]) =>
                  value ? (
                    <FactRow key={factLabel} label={factLabel} title={title} value={value} />
                  ) : null,
                )}
              </dl>
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
              <ul className="divide-y divide-border/50">
                {facts.transactions.slice(0, RECENT_TRANSACTION_LIMIT).map((transaction) => (
                  <li
                    className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 py-2.5 first:pt-0 last:pb-0"
                    key={`${transaction.date}:${transaction.line}`}
                  >
                    <span className="pt-px text-xs tabular-nums text-ink-faint">
                      {transaction.date}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {readableEntityTitle(label, transaction.subject, transaction.title)}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                        {formatTransactionDecision(transaction)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <QuietMessage>{t('No transactions are recorded for this asset.')}</QuietMessage>
            )}
          </WorkspaceSection>
        </div>
      </aside>
    </>
  )
}

const RECENT_TRANSACTION_LIMIT = 5

function WorkspaceSection({
  children,
  count,
  id,
  title,
}: {
  children: ReactNode
  count?: number
  id?: string
  title: MessageKey
}) {
  return (
    <section className="border-t border-border/60 px-5 py-5" id={id}>
      <h3 className="mb-3.5 flex items-center gap-2 font-display text-sm font-semibold text-ink">
        {t(title)}
        {count ? (
          <span className="rounded-full bg-warning-soft px-1.5 py-px text-[10px] font-semibold tabular-nums text-warning">
            {count}
          </span>
        ) : null}
      </h3>
      {children}
    </section>
  )
}

function FactRow({ label, value, title }: { label: MessageKey; value: string; title?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0">
      <dt className="shrink-0 text-xs text-ink-muted">{t(label)}</dt>
      <dd className="min-w-0 text-right text-sm font-medium tabular-nums text-ink" title={title}>
        {value}
      </dd>
    </div>
  )
}

function QuietMessage({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-6 text-ink-faint">{children}</p>
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
