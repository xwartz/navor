import type { AllocationAccount, AllocationAsset, NavorRendererAppState } from '@navor/contract'

import { DataTable } from '../components/DataTable'
import { DiagnosticList } from '../components/DiagnosticList'
import { formatMoney, formatMoneyList, formatPercent } from '../components/format'
import { Panel } from '../components/Panel'
import { DonutChart } from '../components/PortfolioVisuals'
import { EntityCell, SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import { useEntityLabelIndex } from '../EntityLabelContext'
import { formatSubjectSublabel } from '../entity-labels'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'
import { t } from '../i18n'

export function AllocationView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const labelIndex = useEntityLabelIndex()
  const assets = state.allocation.assets.filter((asset) => matchesFilters(asset, filters))
  const accounts = state.allocation.accounts
  const accountBySubject = new Map(accounts.map((account) => [account.subject, account]))
  const groups = groupAssetsByAccount({ accounts, assets, accountBySubject })

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Target structure: account sleeves and how asset targets resolve into portfolio weight."
        eyebrow="Portfolio"
        title="Allocation"
      />

      <SummaryStrip
        items={[
          { label: 'Accounts', value: String(accounts.length) },
          { label: 'Assets', value: String(state.allocation.assets.length) },
          {
            label: 'Target capital',
            value: state.allocation.capital
              ? formatMoney(state.allocation.capital)
              : `${accounts.length} ${t('sleeves')}`,
            detail: formatMoneyList(accounts.map((account) => account.baseAmount)),
          },
          {
            label: 'Diagnostics',
            value: String(state.allocation.diagnostics.length),
            tone: state.allocation.diagnostics.length > 0 ? 'warning' : 'positive',
          },
        ]}
      />

      <Panel
        description="Strategic mix across accounts. Asset-level distance from target lives on Drift."
        title="Account targets"
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(16rem,0.75fr)_minmax(0,1.25fr)] xl:items-center">
          <DonutChart
            centerLabel="Target"
            centerValue="100%"
            items={accounts.map((account) => ({
              id: account.subject,
              label: account.title ?? account.subject,
              sublabel: formatSubjectSublabel(labelIndex, account.subject),
              value: account.target ?? 0,
            }))}
          />
          <div>
            <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_7rem] gap-x-4 border-b border-border/70 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
              <span>{t('Account')}</span>
              <span className="text-right">{t('Target')}</span>
              <span className="text-right">{t('Capital')}</span>
            </div>
            <ul className="divide-y divide-border/60">
              {accounts.map((account) => (
                <li
                  className="grid grid-cols-[minmax(0,1fr)_4.5rem_7rem] items-center gap-x-4 py-2.5"
                  key={account.subject}
                >
                  <EntityCell subject={account.subject} title={account.title ?? account.subject} />
                  <span className="text-right text-sm font-semibold tabular-nums text-ink">
                    {formatPercent(account.target)}
                  </span>
                  <span className="text-right text-sm tabular-nums text-ink-muted">
                    {formatOverviewMoney(account.baseAmount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>

      <Panel
        description="Account-scoped target × sleeve weight = portfolio weight. Amounts are the resolved capital targets."
        title="Asset targets"
      >
        {groups.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('No assets match the current filters.')}</p>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <AccountAssetGroup group={group} key={group.key} />
            ))}
          </div>
        )}
      </Panel>

      {state.allocation.diagnostics.length > 0 ? (
        <Panel title="Allocation diagnostics">
          <DiagnosticList diagnostics={state.allocation.diagnostics} />
        </Panel>
      ) : null}
    </div>
  )
}

interface AssetGroup {
  key: string
  account: AllocationAccount | null
  label: string
  assets: AllocationAsset[]
}

function AccountAssetGroup({ group }: { group: AssetGroup }) {
  const sleeveTarget = group.account?.target ?? null
  const assetCountLabel = `${group.assets.length} ${group.assets.length === 1 ? 'asset' : 'assets'}`

  return (
    <section className="overflow-hidden rounded-md border border-border bg-paper">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-border bg-paper-elevated px-4 py-3">
        <div className="min-w-0">
          {group.account ? (
            <EntityCell subject={group.account.subject} title={group.label} />
          ) : (
            <h3 className="text-sm font-semibold text-ink">{group.label}</h3>
          )}
          <p className="mt-1 text-xs text-ink-faint">{assetCountLabel}</p>
        </div>
        <div className="shrink-0 text-right text-xs tabular-nums text-ink-muted">
          <p>
            {sleeveTarget !== null ? (
              <>
                <span className="text-ink-faint">{t('Sleeve')} </span>
                <span className="font-medium text-ink">{formatPercent(sleeveTarget)}</span>
              </>
            ) : (
              'No sleeve target'
            )}
          </p>
          {group.account?.baseAmount ? (
            <p className="mt-0.5">
              <span className="text-ink-faint">{t('Capital')} </span>
              {formatOverviewMoney(group.account.baseAmount)}
            </p>
          ) : null}
        </div>
      </div>
      <div className="p-3">
        <DataTable
          columns={[
            { key: 'asset', label: 'Asset', sortable: true, sticky: true },
            { key: 'accountTarget', label: 'Account target', align: 'right', sortable: true },
            { key: 'portfolioWeight', label: 'Portfolio weight', align: 'right', sortable: true },
            { key: 'targetAmount', label: 'Target amount', align: 'right', sortable: true },
          ]}
          defaultSortDirection="desc"
          defaultSortKey="portfolioWeight"
          emptyMessage="No assets in this account."
          rows={group.assets.map((asset) => ({
            id: asset.subject,
            cells: {
              asset: (
                <EntityCell
                  interactive
                  subject={asset.subject}
                  title={asset.title ?? asset.subject}
                />
              ),
              accountTarget: formatPercent(asset.target),
              portfolioWeight: formatPercent(asset.derivedPortfolioWeight),
              targetAmount: formatOverviewMoney(asset.targetAmount),
            },
            sortValues: {
              asset: asset.title ?? asset.subject,
              accountTarget: asset.target ?? 0,
              portfolioWeight: asset.derivedPortfolioWeight ?? 0,
              targetAmount: asset.targetAmount?.amount ?? 0,
            },
          }))}
        />
      </div>
    </section>
  )
}

function groupAssetsByAccount({
  accounts,
  assets,
  accountBySubject,
}: {
  accounts: AllocationAccount[]
  assets: AllocationAsset[]
  accountBySubject: Map<string, AllocationAccount>
}): AssetGroup[] {
  const byAccount = new Map<string, AllocationAsset[]>()
  const unassigned: AllocationAsset[] = []

  for (const asset of assets) {
    if (!asset.account) {
      unassigned.push(asset)
      continue
    }
    const list = byAccount.get(asset.account) ?? []
    list.push(asset)
    byAccount.set(asset.account, list)
  }

  const sortByPortfolioWeight = (left: AllocationAsset, right: AllocationAsset) =>
    (right.derivedPortfolioWeight ?? 0) - (left.derivedPortfolioWeight ?? 0)

  const groups: AssetGroup[] = []

  for (const account of accounts) {
    const list = (byAccount.get(account.subject) ?? []).sort(sortByPortfolioWeight)
    if (list.length === 0) {
      continue
    }
    groups.push({
      key: account.subject,
      account,
      label: account.title ?? account.subject,
      assets: list,
    })
  }

  for (const [subject, list] of byAccount) {
    if (accountBySubject.has(subject)) {
      continue
    }
    groups.push({
      key: subject,
      account: null,
      label: subject,
      assets: list.sort(sortByPortfolioWeight),
    })
  }

  if (unassigned.length > 0) {
    groups.push({
      key: '__unassigned__',
      account: null,
      label: 'Unassigned',
      assets: unassigned.sort(sortByPortfolioWeight),
    })
  }

  return groups
}

function formatOverviewMoney(value: { amount: number; currency: string } | null | undefined) {
  if (!value) {
    return 'n/a'
  }

  const magnitude = Math.abs(value.amount)
  const amount =
    magnitude > 0 && magnitude < 1
      ? value.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : value.amount.toLocaleString(undefined, {
          maximumFractionDigits: magnitude >= 100 ? 0 : 1,
        })

  return `${amount} ${value.currency}`
}
