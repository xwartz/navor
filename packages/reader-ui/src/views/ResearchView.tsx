import type { NavorRendererAppState } from '@navor/contract'

import { DataTable } from '../components/DataTable'
import { joinKnowledgeMeta, KnowledgeTable } from '../components/KnowledgeTable'
import { Panel } from '../components/Panel'
import {
  Chip,
  EntityCell,
  SummaryStrip,
  TimelineFeed,
  ViewHeader,
} from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'
import { formatReviewDeadline } from '../i18n'

export function ResearchView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const research = state.knowledge.research.filter((item) => matchesFilters(item, filters))
  const theses = state.knowledge.theses.filter((item) => matchesFilters(item, filters))
  const decisions = state.knowledge.decisions.filter((item) => matchesFilters(item, filters))
  const sources = new Set(state.knowledge.research.map((item) => item.source).filter(Boolean))
  const activeTheses = state.knowledge.theses.filter(
    (item) => item.status?.toLowerCase() === 'active',
  )
  const reviewable = state.knowledge.theses.filter((item) => item.reviewBy)
  const timeline = [
    ...research.map((item) => ({
      id: `research:${item.date}:${item.subject}:${item.title}`,
      date: item.date,
      label: item.source ?? 'Research',
      title: item.title ?? item.subject,
      subject: item.subject,
    })),
    ...theses.map((item) => ({
      id: `thesis:${item.date}:${item.subject}:${item.title}`,
      date: item.date,
      label: 'Thesis',
      title: item.title ?? item.subject,
      subject: [item.status, item.confidence].filter(Boolean).join(' · ') || item.subject,
    })),
    ...decisions.map((item) => ({
      id: `decision:${item.date}:${item.subject}:${item.title}`,
      date: item.date,
      label: 'Decision',
      title: item.title ?? item.subject,
      subject: item.action ?? item.subject,
    })),
  ].sort((left, right) => right.date.localeCompare(left.date))

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Evidence, thesis, and committed decisions."
        eyebrow="Investment process"
        title="Research"
      />

      <SummaryStrip
        items={[
          { label: 'Notes', value: String(state.knowledge.research.length) },
          { label: 'Theses', value: String(state.knowledge.theses.length) },
          { label: 'Decisions', value: String(state.knowledge.decisions.length) },
          {
            label: 'Review due',
            value: String(reviewable.length),
            tone: reviewable.length > 0 ? 'warning' : 'positive',
          },
        ]}
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel title="Evidence">
          <KnowledgeTable
            emptyMessage="No research notes match the current filters."
            rows={research.map((item) => ({
              id: `${item.date}:${item.subject}:${item.title}`,
              title: item.title ?? item.subject,
              subject: item.subject,
              meta: joinKnowledgeMeta(item.date, item.source),
              tags: item.tags,
              body: item.body,
            }))}
          />
        </Panel>

        <Panel title="Timeline">
          <TimelineFeed items={timeline} emptyMessage="No research context yet." />
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Panel title="Theses">
          <KnowledgeTable
            emptyMessage="No theses match the current filters."
            rows={theses.map((item) => ({
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

        <Panel title="Decisions">
          <DataTable
            columns={[
              { key: 'decision', label: 'Decision', sortable: true, sticky: true },
              { key: 'date', label: 'Date', sortable: true },
              { key: 'action', label: 'Action', sortable: true },
              { key: 'target', label: 'Target', align: 'right', sortable: true },
              { key: 'confidence', label: 'Confidence', sortable: true },
            ]}
            emptyMessage="No decisions match the current filters."
            rows={decisions.map((item) => ({
              id: `${item.date}:${item.subject}:${item.title}`,
              cells: {
                decision: (
                  <EntityCell
                    interactive
                    subject={item.subject}
                    title={item.title ?? item.subject}
                  />
                ),
                date: item.date,
                action: item.action ? <Chip tone="accent">{item.action}</Chip> : 'n/a',
                target: item.targetWeight ?? 'n/a',
                confidence: item.confidence ?? 'n/a',
              },
              sortValues: {
                decision: item.title ?? item.subject,
                date: item.date,
                action: item.action ?? '',
                target: item.targetWeight ?? '',
                confidence: item.confidence ?? '',
              },
            }))}
          />
        </Panel>
      </section>

      <Panel title="Research quality">
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <QualityMetric label="Sources" value={String(sources.size)} />
          <QualityMetric label="Active theses" value={String(activeTheses.length)} />
          <QualityMetric
            label="With basis"
            value={String(state.knowledge.decisions.filter((item) => item.basedOn).length)}
          />
        </div>
      </Panel>
    </div>
  )
}

function QualityMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-paper px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{value}</p>
    </div>
  )
}
