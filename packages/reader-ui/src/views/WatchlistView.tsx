import type { NavorRendererAppState } from '@navor/contract'

import { DataTable } from '../components/DataTable'
import { Panel } from '../components/Panel'
import { EntityCell, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'

export function WatchlistView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const items = state.process.watchlist.filter((asset) =>
    matchesFilters({ ...asset, status: nextRequired(asset.subject, state) }, filters),
  )
  return (
    <div className="space-y-5">
      <ViewHeader
        description="Advance each candidate to its next decision."
        eyebrow="Monitor"
        title="Watchlist"
      />

      <Panel
        description="The next missing step keeps research work moving without mixing it into the action queue."
        title="Candidates"
      >
        <DataTable
          columns={[
            { key: 'asset', label: 'Asset', sortable: true, sticky: true },
            { key: 'account', label: 'Account', sortable: true },
            { key: 'next', label: 'Next required', sortable: true },
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
              next: nextRequired(asset.subject, state),
              reason: asset.watchReason ?? 'No reason recorded',
            },
            sortValues: {
              asset: asset.title ?? asset.subject,
              account: asset.account ?? '',
              next: nextRequired(asset.subject, state),
            },
          }))}
        />
      </Panel>
    </div>
  )
}

function nextRequired(subject: string, state: NavorRendererAppState) {
  if (!state.knowledge.research.some((item) => item.subject === subject)) return 'Capture evidence'
  if (!state.knowledge.theses.some((item) => item.subject === subject)) return 'Form thesis'
  if (!state.knowledge.decisions.some((item) => item.subject === subject)) return 'Decide'
  return 'Review case'
}
