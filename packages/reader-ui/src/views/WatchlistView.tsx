import type { NavorRendererAppState } from '@navor/contract'

import { DataTable } from '../components/DataTable'
import { Panel } from '../components/Panel'
import { EntityCell, SectionTabs, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'
import { t } from '../i18n'
import { watchlistStage } from '../toolbar-context'
import { caseSectionTabs } from './ResearchView'

export function WatchlistView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const items = state.process.watchlist.filter((asset) =>
    matchesFilters({ ...asset, status: watchlistStage(asset.subject, state) }, filters),
  )
  return (
    <div className="space-y-5">
      <ViewHeader
        description="Advance each candidate to its next decision."
        tabs={
          <SectionTabs
            active="watchlist"
            ariaLabel="Investment case views"
            tabs={caseSectionTabs(false)}
          />
        }
        title="Investment cases"
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
              account: asset.account ? <EntityCell subject={asset.account} /> : t('Not available'),
              next: t(watchlistStage(asset.subject, state)),
              reason: asset.watchReason ?? t('No reason recorded'),
            },
            sortValues: {
              asset: asset.title ?? asset.subject,
              account: asset.account ?? '',
              next: watchlistStage(asset.subject, state),
            },
          }))}
        />
      </Panel>
    </div>
  )
}
