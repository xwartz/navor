import type { NavorRendererAppState } from '@navor/contract'
import { useAssetWorkspace } from '../asset-workspace-context'
import { AccountTree } from '../components/AccountTree'
import { formatMoney, formatMoneyList, groupMoneyValues } from '../components/format'
import { Panel } from '../components/Panel'
import { PortfolioSectionNav, SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import { t } from '../i18n'

export function AccountsView({ state }: { state: NavorRendererAppState }) {
  const { openAsset } = useAssetWorkspace()
  const targetAmounts = state.dashboard.accountExecutions.map((account) => account.targetAmount)
  const targetCurrencies = groupMoneyValues(targetAmounts)
  const fundedAssetCount = state.dashboard.assetExecutions.filter(
    (asset) => asset.investedCost,
  ).length

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Capital sleeves and funding progress."
        eyebrow="Portfolio"
        title="Accounts"
      />

      <PortfolioSectionNav active="accounts" />

      <SummaryStrip
        items={[
          { label: 'Accounts', value: String(state.dashboard.accountExecutions.length) },
          { label: 'Assets', value: String(state.dashboard.assetExecutions.length) },
          {
            label: 'Target capital',
            value:
              targetCurrencies.length === 1
                ? formatMoney(targetCurrencies[0])
                : t('Multiple currencies'),
            detail: formatMoneyList(targetAmounts),
          },
          {
            label: 'Funded assets',
            value: String(fundedAssetCount),
            detail: formatMoneyList(
              state.dashboard.accountExecutions.flatMap((account) => account.investedCost),
            ),
          },
        ]}
      />

      <Panel title="Accounts">
        <AccountTree
          accounts={state.dashboard.accountExecutions}
          actions={state.dashboard.actionInbox}
          assets={state.dashboard.assetExecutions}
          onSelectAsset={openAsset}
        />
      </Panel>
    </div>
  )
}
