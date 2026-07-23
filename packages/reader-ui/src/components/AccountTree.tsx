import type {
  DashboardAccountExecution,
  DashboardActionItem,
  DashboardAssetExecution,
} from '@navor/contract'
import type { ReactNode } from 'react'

import {
  formatAssetDisclosure,
  formatDashboardActionLabel,
  formatFundedPercent,
  formatMarketAmount,
  formatTargetAmount,
  type MessageKey,
  t,
} from '../i18n'
import { formatMoney, formatMoneyList, formatPercent, formatQuantityCommodity } from './format'
import { ProgressMeter } from './PortfolioVisuals'
import { Chip, EntityCell } from './ViewScaffold'

interface AccountTreeProps {
  accounts: DashboardAccountExecution[]
  assets: DashboardAssetExecution[]
  actions: DashboardActionItem[]
  onSelectAsset: (subject: string) => void
  selectedAssetSubject?: string | null
  renderAssetDetail?: (subject: string) => ReactNode
}

export function AccountTree({
  accounts,
  assets,
  actions,
  onSelectAsset,
  selectedAssetSubject = null,
  renderAssetDetail,
}: AccountTreeProps) {
  const actionsBySubject = new Map(actions.map((item) => [item.subject, item.type]))
  const assetsByAccount = new Map<string, DashboardAssetExecution[]>()

  for (const asset of assets) {
    const key = asset.account ?? '__unassigned__'
    const existing = assetsByAccount.get(key) ?? []
    existing.push(asset)
    assetsByAccount.set(key, existing)
  }

  if (accounts.length === 0) {
    return <p className="text-sm text-ink-muted">{t('No accounts.')}</p>
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => {
        const accountAssets = assetsByAccount.get(account.subject) ?? []

        return (
          <section
            className="overflow-hidden rounded-md border border-border bg-paper-elevated"
            key={account.subject}
          >
            <div className="grid gap-3 border-b border-border bg-paper px-4 py-3 lg:grid-cols-[minmax(0,1fr)_12rem_12rem] lg:items-center">
              <EntityCell subject={account.subject} title={account.title ?? account.subject} />
              <div className="tabular-nums">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  {t('Invested')}
                </p>
                <p className="mt-1 font-medium text-ink">{accountInvestedLabel(account)}</p>
                <p className="text-xs text-ink-faint">{accountFundingLabel(account)}</p>
              </div>
              <ProgressMeter
                label={
                  <span className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                    <span className="shrink-0">
                      {t('Target')} {formatPercent(account.target)}
                    </span>
                    <span className="min-w-0 text-right tabular-nums">
                      {formatMoney(accountRemainingBudget(account))} {t('left')}
                    </span>
                  </span>
                }
                value={account.investedPercent}
              />
            </div>
            <div className="hidden gap-3 border-b border-border bg-paper px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint lg:flex lg:items-center">
              <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_11rem_11rem_10rem] gap-3">
                <span>{t('Asset')}</span>
                <span className="text-right">{t('Funding')}</span>
                <span className="text-right">{t('Position')}</span>
                <span className="text-right">{t('To deploy')}</span>
              </div>
              <span className="min-w-[9.5rem] text-right">{t('Next step')}</span>
            </div>
            <div className="divide-y divide-border">
              {accountAssets.length === 0 ? (
                <p className="px-4 py-3 text-sm text-ink-muted">{t('No assets assigned.')}</p>
              ) : (
                accountAssets.map((asset) => {
                  const isSelected = selectedAssetSubject === asset.subject
                  const actionType = actionsBySubject.get(asset.subject)
                  const nextStep = actionType
                    ? formatDashboardActionLabel(actionType)
                    : statusAction(asset.status)

                  return (
                    <div
                      className={
                        isSelected
                          ? 'bg-paper shadow-[inset_3px_0_0_0_var(--color-accent)]'
                          : '[@media(hover:hover)]:hover:bg-paper'
                      }
                      key={asset.subject}
                    >
                      <div className="flex flex-col gap-3 px-4 py-3.5 lg:flex-row lg:items-center lg:gap-3">
                        <button
                          aria-expanded={isSelected}
                          className="grid min-w-0 w-full flex-1 grid-cols-2 gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_10rem]"
                          onClick={() => onSelectAsset(asset.subject)}
                          type="button"
                        >
                          <div className="col-span-2 min-w-0 lg:col-span-1">
                            <EntityCell
                              subject={asset.subject}
                              title={asset.title ?? asset.subject}
                            />
                          </div>
                          <MetricCell
                            label="Funding"
                            primary={fundingLabel(asset)}
                            secondary={formatTargetAmount(formatMoney(asset.targetAmount))}
                          />
                          <MetricCell
                            label="Position"
                            primary={positionLabel(asset)}
                            secondary={
                              asset.marketValue
                                ? formatMarketAmount(formatMoney(asset.marketValue))
                                : ''
                            }
                          />
                          <MetricCell
                            className="col-span-2 min-w-0 lg:col-span-1"
                            label="To deploy"
                            primary={formatMoney(remainingAmount(asset))}
                            secondary={statusReason(asset)}
                          />
                        </button>
                        <div className="flex shrink-0 items-center justify-end gap-2 lg:min-w-[9.5rem]">
                          <Chip tone={chipTone(asset.status)}>{nextStep}</Chip>
                          {isSelected ? (
                            <button
                              aria-label={formatAssetDisclosure(true, asset.title ?? asset.subject)}
                              className="grid h-7 w-7 place-items-center rounded-md text-sm text-ink-muted transition-[color,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-paper-elevated [@media(hover:hover)]:hover:text-ink"
                              onClick={() => onSelectAsset(asset.subject)}
                              type="button"
                            >
                              <span aria-hidden>⌃</span>
                            </button>
                          ) : (
                            <button
                              aria-label={formatAssetDisclosure(
                                false,
                                asset.title ?? asset.subject,
                              )}
                              className="grid h-7 w-7 place-items-center text-base text-ink-faint transition-[color,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-paper-elevated [@media(hover:hover)]:hover:text-ink"
                              onClick={() => onSelectAsset(asset.subject)}
                              type="button"
                            >
                              <span aria-hidden>›</span>
                            </button>
                          )}
                        </div>
                      </div>
                      {isSelected && renderAssetDetail ? (
                        <div className="border-t border-border">
                          {renderAssetDetail(asset.subject)}
                        </div>
                      ) : null}
                    </div>
                  )
                })
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function accountInvestedLabel(account: DashboardAccountExecution) {
  return account.investedCost.length === 0 ? t('Not funded') : formatMoneyList(account.investedCost)
}

function accountFundingLabel(account: DashboardAccountExecution) {
  if (account.investedCost.length === 0) {
    return formatFundedPercent('0.0%')
  }

  return formatPercent(account.investedPercent)
}

function accountRemainingBudget(account: DashboardAccountExecution) {
  if (account.remainingBudget) {
    return account.remainingBudget
  }

  return account.investedCost.length === 0 ? account.targetAmount : null
}

function MetricCell({
  label,
  primary,
  secondary,
  className = '',
}: {
  label: MessageKey
  primary: string
  secondary?: string
  className?: string
}) {
  return (
    <div className={`min-w-0 tabular-nums lg:text-right ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint lg:hidden">
        {t(label)}
      </p>
      <p className="truncate font-medium text-ink">{primary}</p>
      {secondary ? <p className="truncate text-xs text-ink-faint">{secondary}</p> : null}
    </div>
  )
}

function fundingLabel(asset: DashboardAssetExecution) {
  if (asset.status === 'not_started') {
    return t('Not funded')
  }

  if (asset.status === 'currency_mismatch') {
    return t('FX mismatch')
  }

  if (asset.investedPercent === null) {
    return t('Not measurable')
  }

  return formatFundedPercent(formatPercent(asset.investedPercent))
}

function positionLabel(asset: DashboardAssetExecution) {
  if (!asset.holding) {
    return t('No position')
  }

  return formatQuantityCommodity(asset.holding.quantity, asset.holding.commodity)
}

function remainingAmount(asset: DashboardAssetExecution) {
  if (asset.remainingBudget) {
    return asset.remainingBudget
  }

  return asset.status === 'not_started' ? asset.targetAmount : null
}

function statusReason(asset: DashboardAssetExecution) {
  switch (asset.status) {
    case 'not_started':
      return t('No transaction yet')
    case 'currency_mismatch':
      return t('Currency mismatch')
    case 'over_invested':
      return t('Over target')
    case 'above_max':
      return t('Above target range')
    case 'below_min':
      return t('Below target range')
    case 'complete':
      return t('Target reached')
    case 'building':
      return t('Still building')
  }
}

function chipTone(status: DashboardAssetExecution['status']) {
  if (status === 'above_max' || status === 'over_invested') {
    return 'danger' as const
  }

  if (status === 'below_min' || status === 'not_started' || status === 'currency_mismatch') {
    return 'warning' as const
  }

  return 'positive' as const
}

function statusAction(status: DashboardAssetExecution['status']) {
  switch (status) {
    case 'not_started':
      return t('Start')
    case 'building':
      return t('Build')
    case 'complete':
      return t('Hold')
    case 'over_invested':
      return t('Review')
    case 'above_max':
      return t('Trim')
    case 'below_min':
      return t('Add')
    case 'currency_mismatch':
      return t('Check FX')
  }
}
