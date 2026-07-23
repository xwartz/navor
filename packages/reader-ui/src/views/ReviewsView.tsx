import type { NavorRendererAppState } from '@navor/contract'

import { joinKnowledgeMeta, KnowledgeTable } from '../components/KnowledgeTable'
import { Panel } from '../components/Panel'
import { SummaryStrip, ViewHeader } from '../components/ViewScaffold'
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
  const withAction = state.process.reviews.filter((item) => item.action)

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Scheduled checks and follow-up actions."
        eyebrow="Investment process"
        title="Reviews"
      />

      <SummaryStrip
        items={[
          { label: 'Reviews', value: String(state.process.reviews.length) },
          { label: 'With action', value: String(withAction.length) },
          {
            label: 'Pending thesis reviews',
            value: String(state.dashboard.pendingReviews.length),
            tone: state.dashboard.pendingReviews.length > 0 ? 'warning' : 'positive',
          },
        ]}
      />

      <Panel title="Reviews">
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
