import type { NavorRendererAppState } from '@navor/contract'

import { joinKnowledgeMeta, KnowledgeTable } from '../components/KnowledgeTable'
import { Panel } from '../components/Panel'
import { SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import { useEntityLabelIndex } from '../EntityLabelContext'
import { resolveEntityLabel } from '../entity-labels'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'

export function JournalView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const labelIndex = useEntityLabelIndex()
  const items = state.process.journal.filter((item) => matchesFilters(item, filters))
  const moods = new Set(state.process.journal.map((item) => item.mood).filter(Boolean))

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Process notes and decision context."
        eyebrow="Investment process"
        title="Journal"
      />

      <SummaryStrip
        items={[
          { label: 'Entries', value: String(state.process.journal.length) },
          { label: 'Moods', value: String(moods.size) },
          {
            label: 'Related notes',
            value: String(state.process.journal.filter((item) => item.related).length),
          },
        ]}
      />

      <Panel title="Journal">
        <KnowledgeTable
          emptyMessage="No journal entries match the current filters."
          rows={items.map((item) => ({
            id: `${item.date}:${item.subject}:${item.title}`,
            title: item.title ?? item.subject,
            subject: item.subject,
            meta: joinKnowledgeMeta(item.date, item.directive, item.mood),
            tags: item.related
              ? [`Related ${resolveEntityLabel(labelIndex, item.related).title}`]
              : undefined,
            body: item.body,
          }))}
        />
      </Panel>
    </div>
  )
}
