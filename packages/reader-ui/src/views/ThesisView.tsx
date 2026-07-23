import type { NavorRendererAppState } from '@navor/contract'

import { joinKnowledgeMeta, KnowledgeTable } from '../components/KnowledgeTable'
import { Panel } from '../components/Panel'
import { SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'
import { formatReviewDeadline } from '../i18n'

export function ThesisView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const items = state.knowledge.theses.filter((item) => matchesFilters(item, filters))
  const active = state.knowledge.theses.filter((item) => item.status?.toLowerCase() === 'active')
  const reviewable = state.knowledge.theses.filter((item) => item.reviewBy)

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Beliefs, confidence, and invalidation rules."
        eyebrow="Investment process"
        title="Thesis"
      />

      <SummaryStrip
        items={[
          { label: 'Theses', value: String(state.knowledge.theses.length) },
          { label: 'Active', value: String(active.length), tone: 'positive' },
          { label: 'Review dated', value: String(reviewable.length) },
        ]}
      />

      <Panel title="Investment theses">
        <KnowledgeTable
          emptyMessage="No theses match the current filters."
          rows={items.map((item) => ({
            id: `${item.date}:${item.subject}:${item.title}`,
            title: item.title ?? item.subject,
            subject: item.subject,
            meta: joinKnowledgeMeta(
              item.date,
              item.status,
              item.sentiment,
              item.confidence,
              item.reviewBy ? formatReviewDeadline(item.reviewBy) : null,
            ),
            tags: item.invalidIf ? [`Invalid if ${item.invalidIf}`] : undefined,
            body: item.body,
          }))}
        />
      </Panel>
    </div>
  )
}
