import type { NavorRendererAppState } from '@navor/contract'
import { useState } from 'react'

import { AccountTree } from '../components/AccountTree'
import { AssetDetailPanel } from '../components/AssetDetailPanel'
import { formatMoneyList } from '../components/format'
import { Panel } from '../components/Panel'
import { SummaryStrip, ViewHeader } from '../components/ViewScaffold'

export function AccountsView({ state }: { state: NavorRendererAppState }) {
  const [selectedAssetSubject, setSelectedAssetSubject] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Capital sleeves and funding progress."
        eyebrow="Portfolio"
        title="Accounts"
      />

      <SummaryStrip
        items={[
          { label: 'Accounts', value: String(state.dashboard.accountExecutions.length) },
          { label: 'Assets', value: String(state.dashboard.assetExecutions.length) },
          {
            label: 'Budget',
            value: `${state.dashboard.accountExecutions.length} sleeves`,
            detail: formatMoneyList(
              state.dashboard.accountExecutions.map((account) => account.targetAmount),
            ),
          },
          {
            label: 'Invested',
            value: `${state.dashboard.assetExecutions.filter((asset) => asset.investedCost).length} funded`,
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
          onSelectAsset={(subject) =>
            setSelectedAssetSubject((current) => (current === subject ? null : subject))
          }
          renderAssetDetail={(subject) => (
            <AssetDetailPanel
              onClose={() => setSelectedAssetSubject(null)}
              state={state}
              subject={subject}
              variant="compact"
            />
          )}
          selectedAssetSubject={selectedAssetSubject}
        />
      </Panel>
    </div>
  )
}
