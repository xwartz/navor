import type { NavorRendererAppState } from '@navor/contract'

import { DataTable } from '../components/DataTable'
import { Panel } from '../components/Panel'
import { EntityCell, SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'

export function WatchlistView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const items = state.process.watchlist.filter((asset) => matchesFilters(asset, filters))
  const accounts = new Set(state.process.watchlist.map((item) => item.account).filter(Boolean))

  return (
    <div className="space-y-5">
      <ViewHeader description="Candidates before allocation." eyebrow="Command" title="Watchlist" />

      <SummaryStrip
        items={[
          { label: 'Candidates', value: String(state.process.watchlist.length) },
          { label: 'Accounts', value: String(accounts.size) },
          { label: 'With reason', value: String(items.filter((item) => item.watchReason).length) },
        ]}
      />

      <Panel title="Candidates">
        <DataTable
          columns={[
            { key: 'asset', label: 'Asset', sortable: true, sticky: true },
            { key: 'account', label: 'Account', sortable: true },
            { key: 'reason', label: 'Reason' },
          ]}
          emptyMessage="No watchlist items match the current filters."
          rows={items.map((asset) => ({
            id: asset.subject,
            cells: {
              asset: (
                <EntityCell
                  interactive
                  subject={asset.subject}
                  title={asset.title ?? asset.subject}
                />
              ),
              account: asset.account ? <EntityCell subject={asset.account} /> : 'n/a',
              reason: asset.watchReason ?? 'No reason recorded',
            },
            sortValues: {
              asset: asset.title ?? asset.subject,
              account: asset.account ?? '',
            },
          }))}
        />
      </Panel>
    </div>
  )
}
