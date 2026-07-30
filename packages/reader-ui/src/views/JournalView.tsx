import type { NavorRendererAppState } from '@navor/contract'

import { joinKnowledgeMeta, KnowledgeTable } from '../components/KnowledgeTable'
import { Panel } from '../components/Panel'
import { ViewHeader } from '../components/ViewScaffold'
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
  const items = state.process.journal.filter((item) =>
    matchesFilters({ ...item, status: item.mood ?? '' }, filters),
  )
  return (
    <div className="space-y-5">
      <ViewHeader
        description="Record the reasoning and behaviour behind a decision."
        eyebrow="Investment process"
        title="Journal"
      />

      <Panel
        description="Read chronologically, then filter by asset, directive, or mood."
        title="Entries"
      >
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
