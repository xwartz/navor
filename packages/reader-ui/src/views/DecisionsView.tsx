import type { NavorRendererAppState } from '@navor/contract'

import { DataTable } from '../components/DataTable'
import { Panel } from '../components/Panel'
import { EntityCell, SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'

export function DecisionsView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const items = state.knowledge.decisions.filter((item) => matchesFilters(item, filters))
  const actionTypes = new Set(state.knowledge.decisions.map((item) => item.action).filter(Boolean))

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Committed actions and their basis."
        eyebrow="Investment process"
        title="Decisions"
      />

      <SummaryStrip
        items={[
          { label: 'Decisions', value: String(state.knowledge.decisions.length) },
          { label: 'Action types', value: String(actionTypes.size) },
          {
            label: 'With basis',
            value: String(state.knowledge.decisions.filter((item) => item.basedOn).length),
          },
          { label: 'Visible', value: String(items.length) },
        ]}
      />

      <Panel title="Decision ledger">
        <DataTable
          columns={[
            { key: 'decision', label: 'Decision', sortable: true, sticky: true },
            { key: 'date', label: 'Date', sortable: true },
            { key: 'action', label: 'Action', sortable: true },
            { key: 'target', label: 'Target', align: 'right', sortable: true },
            { key: 'confidence', label: 'Confidence', sortable: true },
            { key: 'basis', label: 'Based on', sortable: true },
          ]}
          emptyMessage="No decisions match the current filters."
          rows={items.map((item) => ({
            id: `${item.date}:${item.subject}:${item.title}`,
            cells: {
              decision: (
                <EntityCell interactive subject={item.subject} title={item.title ?? item.subject} />
              ),
              date: item.date,
              action: item.action ?? 'n/a',
              target: item.targetWeight ?? 'n/a',
              confidence: item.confidence ?? 'n/a',
              basis: item.basedOn ?? 'n/a',
            },
            sortValues: {
              decision: item.title ?? item.subject,
              date: item.date,
              action: item.action ?? '',
              target: item.targetWeight ?? '',
              confidence: item.confidence ?? '',
              basis: item.basedOn ?? '',
            },
          }))}
        />
      </Panel>
    </div>
  )
}
