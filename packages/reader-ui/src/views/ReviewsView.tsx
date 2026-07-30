import type { NavorRendererAppState } from '@navor/contract'

import { joinKnowledgeMeta, KnowledgeTable } from '../components/KnowledgeTable'
import { Panel } from '../components/Panel'
import { ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'

export function ReviewsView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const items = state.process.reviews.filter((item) => matchesFilters(item, filters))
  return (
    <div className="space-y-5">
      <ViewHeader
        description="Resolve the next scheduled check and record its follow-up."
        eyebrow="Investment process"
        title="Reviews"
      />

      <Panel
        description="Status and follow-up stay beside the recorded review."
        title="Review queue"
      >
        <KnowledgeTable
          emptyMessage="No reviews match the current filters."
          rows={items.map((item) => ({
            id: `${item.date}:${item.subject}:${item.title}`,
            title: item.title ?? item.subject,
            subject: item.subject,
            meta: joinKnowledgeMeta(item.date, item.status, item.action),
            tags: item.drift ? [`Drift ${item.drift}`] : undefined,
            body: item.body,
          }))}
        />
      </Panel>
    </div>
  )
}
