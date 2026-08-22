import type {
  DashboardAccountExecution,
  DashboardActionItem,
  DashboardAssetExecution,
} from '@navor/contract'

import {
  formatDashboardActionLabel,
  formatFundedPercent,
  formatMarketAmount,
  formatTargetAmount,
  type MessageKey,
  t,
} from '../i18n'
import { formatMoney, formatMoneyList, formatPercent, formatQuantityCommodity } from './format'
import { ProgressMeter } from './PortfolioVisuals'
import { Chip, EntityCell, GroupedSection, LabelCaps } from './ViewScaffold'

interface AccountTreeProps {
  accounts: DashboardAccountExecution[]
  assets: DashboardAssetExecution[]
  actions: DashboardActionItem[]
  onSelectAsset: (subject: string) => void
}

export function AccountTree({ accounts, assets, actions, onSelectAsset }: AccountTreeProps) {
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
          <GroupedSection
            header={
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_12rem] lg:items-center">
                <EntityCell subject={account.subject} title={account.title ?? account.subject} />
                <div className="tabular-nums">
                  <LabelCaps>{t('Invested')}</LabelCaps>
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
            }
            key={account.subject}
          >
            <div className="hidden gap-3 border-b border-border/50 bg-paper-subtle/30 px-5 py-2 lg:flex lg:items-center">
              <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_11rem_11rem_10rem] gap-3">
                <LabelCaps className="mb-0">{t('Asset')}</LabelCaps>
                <LabelCaps className="mb-0 text-right">{t('Funding')}</LabelCaps>
                <LabelCaps className="mb-0 text-right">{t('Position')}</LabelCaps>
                <LabelCaps className="mb-0 text-right">{t('To deploy')}</LabelCaps>
              </div>
              <LabelCaps className="mb-0 min-w-[9.5rem] text-right">{t('Next step')}</LabelCaps>
            </div>
            {accountAssets.length === 0 ? (
              <p className="px-5 py-3 text-sm text-ink-muted">{t('No assets assigned.')}</p>
            ) : (
              accountAssets.map((asset) => {
                const actionType = actionsBySubject.get(asset.subject)
                const nextStep = actionType
                  ? formatDashboardActionLabel(actionType)
                  : statusAction(asset.status)

                return (
                  <div
                    className="[@media(hover:hover)]:hover:bg-paper-subtle/40"
                    key={asset.subject}
                  >
                    <button
                      className="grid w-full grid-cols-2 gap-3 px-5 py-3.5 text-left transition-[background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-paper-subtle/40 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_10rem_9.5rem]"
                      onClick={() => onSelectAsset(asset.subject)}
                      type="button"
                    >
                      <div className="col-span-2 min-w-0 lg:col-span-1">
                        <EntityCell subject={asset.subject} title={asset.title ?? asset.subject} />
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
                      <div className="flex shrink-0 items-center justify-end lg:min-w-[9.5rem]">
                        <Chip tone={chipTone(asset.status)}>{nextStep}</Chip>
                      </div>
                    </button>
                  </div>
                )
              })
            )}
          </GroupedSection>
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
      <LabelCaps className="mb-1 lg:hidden lg:mb-0">{t(label)}</LabelCaps>
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
