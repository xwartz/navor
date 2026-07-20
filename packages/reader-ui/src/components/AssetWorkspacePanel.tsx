import type { NavorRendererAppState } from '@navor/contract'
import { type ReactNode, useEffect, useRef, useState } from 'react'

import type { AssetWorkspaceIndex } from '../asset-workspace'
import { useAssetWorkspace } from '../asset-workspace-context'
import { useEntityLabel } from '../EntityLabelContext'
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
import { ProgressMeter } from './PortfolioVisuals'
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
  facts: ReturnType<AssetWorkspaceIndex['get']>
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
  const policy = facts?.policy ?? null
  const price = facts?.price ?? null
  const priceStatus = facts?.priceStatus ?? null
  const watchlist = facts?.watchlist ?? null
  const accountTitle = useEntityLabel(execution?.account ?? watchlist?.account)
  const actions = facts?.actions ?? []
  const researchTimeline = buildResearchTimeline(facts)
  const decisionsTimeline = buildDecisionsTimeline(facts)

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
            ? 'shadow-[-16px_0_48px_rgba(27,31,28,0.2)]'
            : 'border-l border-border shadow-[-8px_0_24px_rgba(27,31,28,0.08)]'
        }`}
        ref={panelRef}
        role={isModal ? 'dialog' : 'complementary'}
        {...(isModal ? { 'aria-modal': true } : {})}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border bg-paper-elevated px-4 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
              {t('Asset workspace')}
            </p>
            <h2
              className="mt-1 truncate text-xl font-bold tracking-[-0.018em] text-ink"
              id="asset-workspace-title"
            >
              {label?.title ?? subject}
            </h2>
            <p className="mt-1 truncate font-mono text-[11px] text-ink-faint">
              {label?.symbol ?? subject}
            </p>
          </div>
          <button
            aria-label={t('Close asset workspace')}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border bg-paper text-lg text-ink-muted transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-accent-soft [@media(hover:hover)]:hover:text-ink"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <span aria-hidden>×</span>
          </button>
        </header>

        <nav
          aria-label={t('Asset workspace views')}
          className="meta-scroll flex shrink-0 gap-1 overflow-x-auto border-b border-border px-3 py-2"
        >
          <WorkspaceLink href="#holdings">{t('Holdings')}</WorkspaceLink>
          <WorkspaceLink href="#drift">{t('Drift')}</WorkspaceLink>
          <WorkspaceLink href="#policy">{t('Policy')}</WorkspaceLink>
          <WorkspaceLink href="#research">{t('Research')}</WorkspaceLink>
          <WorkspaceLink href="#decisions">{t('Decisions')}</WorkspaceLink>
        </nav>

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
              <WorkspaceMetric
                label="Invested"
                value={formatMoney(execution?.investedCost ?? holding?.cost)}
              />
              <WorkspaceMetric label="Target" value={formatMoney(execution?.targetAmount)} />
            </section>

            <WorkspaceSection id="market" title="Market snapshot">
              <dl className="grid grid-cols-2 gap-4">
                <WorkspaceFact label="Price" value={formatMoney(price?.price)} />
                <WorkspaceFact
                  label="Price status"
                  value={priceStatusLabel(priceStatus?.status, price)}
                />
                <WorkspaceFact
                  label="Data source"
                  value={priceStatus?.provider ?? price?.provider ?? t('No provider')}
                />
                <WorkspaceFact
                  label="Price as of"
                  value={formatTimestamp(priceStatus?.asOf ?? price?.asOf)}
                />
              </dl>
              {!price ? (
                <p className="mt-3 text-xs leading-5 text-ink-muted">
                  {t('Price unavailable. Market value falls back to cost basis.')}
                </p>
              ) : null}
            </WorkspaceSection>

            <WorkspaceSection id="holdings" title="Position">
              {holding ? (
                <div className="space-y-4">
                  <dl className="grid grid-cols-2 gap-4">
                    <WorkspaceFact
                      label="Quantity"
                      value={formatQuantityCommodity(holding.quantity, holding.commodity)}
                    />
                    <WorkspaceFact label="Cost" value={formatMoney(holding.cost)} />
                  </dl>
                  <div className="border-t border-border pt-4">
                    <h4 className="text-xs font-semibold text-ink">{t('Account allocation')}</h4>
                    <dl className="mt-3 grid grid-cols-2 gap-4">
                      <WorkspaceFact
                        label="Account target"
                        value={formatPercent(execution?.target)}
                      />
                      <WorkspaceFact
                        label="Funding progress"
                        value={formatPercent(execution?.investedPercent)}
                      />
                    </dl>
                    <div className="mt-3">
                      <ProgressMeter value={execution?.investedPercent} />
                    </div>
                  </div>
                </div>
              ) : (
                <QuietMessage>{t('No funded position is recorded for this asset.')}</QuietMessage>
              )}
            </WorkspaceSection>

            <WorkspaceSection id="drift" title="Drift">
              <dl className="grid grid-cols-2 gap-4">
                <WorkspaceFact label="Actual weight" value={formatPercent(drift?.actualWeight)} />
                <WorkspaceFact
                  label="Target"
                  value={formatPercent(policy?.target ?? facts?.allocation?.derivedPortfolioWeight)}
                />
                <WorkspaceFact label="Drift" value={formatSignedPercent(drift?.drift)} />
                <WorkspaceFact
                  label="Market value"
                  value={formatMoney(drift?.marketValueInBase ?? drift?.marketValue)}
                />
              </dl>
            </WorkspaceSection>

            <WorkspaceSection id="policy" title="Policy">
              {policy ? (
                <dl className="grid grid-cols-2 gap-4">
                  <WorkspaceFact label="Target" value={formatPercent(policy.target)} />
                  <WorkspaceFact
                    label="Band"
                    value={`${formatPercent(policy.min)} / ${formatPercent(policy.max)}`}
                  />
                  <WorkspaceFact label="Rebalance" value={policy.rebalance ?? t('Not available')} />
                  <WorkspaceFact label="As of" value={policy.date} />
                  <WorkspaceFact
                    label="Action below band"
                    value={policy.actionWhenBelow ?? t('Not available')}
                  />
                  <WorkspaceFact
                    label="Action above band"
                    value={policy.actionWhenAbove ?? t('Not available')}
                  />
                </dl>
              ) : (
                <QuietMessage>
                  {t('Execution target only. No portfolio band is linked to this asset.')}
                </QuietMessage>
              )}
            </WorkspaceSection>

            {actions.length > 0 ? (
              <WorkspaceSection id="actions" title="Open actions">
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

            <WorkspaceSection id="research" title="Investment context">
              {researchTimeline.length > 0 ? (
                <TimelineFeed items={researchTimeline} />
              ) : (
                <QuietMessage>{t('No research, thesis, or decision is linked yet.')}</QuietMessage>
              )}
            </WorkspaceSection>

            <WorkspaceSection id="decisions" title="Decisions">
              {decisionsTimeline.length > 0 ? (
                <TimelineFeed items={decisionsTimeline} />
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
                        {transaction.title ?? transaction.subject}
                      </p>
                      <p className="mt-1 text-xs tabular-nums text-ink-muted">{transaction.date}</p>
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

function WorkspaceLink({ children, href }: { children: string; href: string }) {
  return (
    <a
      className="inline-flex min-h-10 shrink-0 items-center rounded-md px-2.5 text-xs font-semibold text-accent transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 [@media(hover:hover)]:hover:bg-accent-soft [@media(hover:hover)]:hover:text-accent-ink"
      href={href}
    >
      {children}
    </a>
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

function buildResearchTimeline(facts: ReturnType<AssetWorkspaceIndex['get']>) {
  if (!facts) return []

  return [
    ...facts.research.map((item) => ({
      id: `research:${item.date}:${item.title}`,
      date: item.date,
      label: t('Research'),
      title: item.title ?? item.subject,
      subject: item.tags.join(' · '),
    })),
    ...facts.theses.map((item) => ({
      id: `thesis:${item.date}:${item.title}`,
      date: item.date,
      label: t('Thesis'),
      title: item.title ?? item.subject,
      subject: item.reviewBy ? formatReviewDeadline(item.reviewBy) : item.status,
    })),
  ].sort((left, right) => right.date.localeCompare(left.date))
}

function buildDecisionsTimeline(facts: ReturnType<AssetWorkspaceIndex['get']>) {
  if (!facts) return []

  return facts.decisions
    .map((item) => ({
      id: `decision:${item.date}:${item.title}`,
      date: item.date,
      label: t('Decision'),
      title: item.title ?? item.subject,
      subject: item.action,
    }))
    .sort((left, right) => right.date.localeCompare(left.date))
}

function priceStatusLabel(
  status: NavorRendererAppState['enrichment']['prices'][number]['status'] | undefined,
  price: NavorRendererAppState['market']['prices'][number] | null,
) {
  if (!status) return price ? t('fresh') : t('missing')
  return t(status)
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
      return t('Above policy band')
    case 'below_min':
      return t('Below policy band')
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
      return t('Current portfolio weight is above the policy range.')
    case 'below_min':
      return t('Current portfolio weight is below the policy range.')
    case 'currency_mismatch':
      return t(
        'Target and invested cost use different currencies, so funding progress is not comparable.',
      )
    default:
      return t('Asset tracking')
  }
}
