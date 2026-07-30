import type { NavorRendererAppState } from '@navor/contract'
import { useEffect, useState } from 'react'

import { DataTable } from '../components/DataTable'
import { joinKnowledgeMeta, KnowledgeTable } from '../components/KnowledgeTable'
import { Panel } from '../components/Panel'
import { Chip, EntityCell, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'
import { formatReviewDeadline, t } from '../i18n'

export type CaseTab = 'cases' | 'market' | 'evidence' | 'theses' | 'decisions'

const CASE_TABS: Array<{
  id: CaseTab
  label: 'Cases' | 'Market context' | 'Evidence' | 'Theses' | 'Decisions'
}> = [
  { id: 'cases', label: 'Cases' },
  { id: 'market', label: 'Market context' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'theses', label: 'Theses' },
  { id: 'decisions', label: 'Decisions' },
]

export function ResearchView({
  state,
  filters,
  initialTab = 'cases',
  onActiveTabChange,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
  initialTab?: CaseTab
  onActiveTabChange?: (tab: CaseTab) => void
}) {
  const [activeTab, setActiveTab] = useState<CaseTab>(initialTab)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const selectTab = (tab: CaseTab) => {
    setActiveTab(tab)
    onActiveTabChange?.(tab)
  }
  const research = state.knowledge.research.filter((item) => matchesFilters(item, filters))
  const theses = state.knowledge.theses.filter((item) => matchesFilters(item, filters))
  const decisions = state.knowledge.decisions.filter((item) => matchesFilters(item, filters))
  const marketResearch = research.filter((item) => item.subject.startsWith('Market:'))
  const planBySubject = new Map(state.plan.current.map((item) => [item.subject, item]))
  const actionsBySubject = new Map<string, number>()
  for (const action of state.dashboard.actionInbox) {
    actionsBySubject.set(action.subject, (actionsBySubject.get(action.subject) ?? 0) + 1)
  }
  const caseSubjects = [
    ...new Set([
      ...research.filter((item) => item.subject.startsWith('Asset:')).map((item) => item.subject),
      ...theses.filter((item) => item.subject.startsWith('Asset:')).map((item) => item.subject),
      ...decisions.filter((item) => item.subject.startsWith('Asset:')).map((item) => item.subject),
      ...state.plan.current
        .filter((item) => item.subject.startsWith('Asset:'))
        .map((item) => item.subject),
    ]),
  ]
  const cases = caseSubjects
    .map((subject) => {
      const caseResearch = research.filter((item) => item.subject === subject)
      const caseTheses = theses.filter((item) => item.subject === subject)
      const caseDecisions = decisions.filter((item) => item.subject === subject)
      const latestThesis = caseTheses.toSorted((left, right) =>
        right.date.localeCompare(left.date),
      )[0]
      const latestDecision = caseDecisions.toSorted((left, right) =>
        right.date.localeCompare(left.date),
      )[0]
      const reviewBy = caseTheses
        .map((item) => item.reviewBy)
        .filter((date): date is string => Boolean(date))
        .sort()[0]
      const title =
        state.dashboard.assetExecutions.find((asset) => asset.subject === subject)?.title ??
        state.allocation.assets.find((asset) => asset.subject === subject)?.title ??
        latestThesis?.title ??
        latestDecision?.title ??
        caseResearch.toSorted((left, right) => right.date.localeCompare(left.date))[0]?.title ??
        subject

      return {
        subject,
        title,
        evidence: caseResearch.length,
        thesis: latestThesis?.title ?? latestThesis?.status ?? 'n/a',
        decision: latestDecision?.action ?? latestDecision?.title ?? 'n/a',
        plan: planBySubject.get(subject)?.title ?? 'n/a',
        reviewBy: reviewBy ? formatReviewDeadline(reviewBy) : 'n/a',
        reviewSort: reviewBy ?? '9999-12-31',
        actions: actionsBySubject.get(subject) ?? 0,
        matches: [caseResearch, caseTheses, caseDecisions, planBySubject.get(subject)].some(
          (item) =>
            Array.isArray(item)
              ? item.some((member) => matchesFilters(member, filters))
              : item
                ? matchesFilters(item, filters)
                : false,
        ),
      }
    })
    .filter((item) => item.matches)
    .sort(
      (left, right) =>
        right.actions - left.actions || left.reviewSort.localeCompare(right.reviewSort),
    )
  return (
    <div className="space-y-5">
      <ViewHeader
        description="One evidence trail from research to a recorded decision."
        eyebrow="Investment process"
        title="Investment cases"
      />

      <div
        aria-label="Investment case views"
        className="meta-scroll -mx-1 flex gap-1 overflow-x-auto border-b border-border/80 px-1 pb-3"
        role="tablist"
      >
        {CASE_TABS.map((tab) => {
          const selected = activeTab === tab.id
          return (
            <button
              aria-selected={selected}
              className={`press-scale min-h-10 shrink-0 rounded-md px-3 text-xs font-semibold transition-[background-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 ${
                selected
                  ? 'bg-paper-elevated text-ink shadow-[inset_0_-1px_0_var(--color-accent)]'
                  : 'text-ink-muted [@media(hover:hover)]:hover:bg-paper-elevated [@media(hover:hover)]:hover:text-ink'
              }`}
              key={tab.id}
              onClick={() => selectTab(tab.id)}
              role="tab"
              type="button"
            >
              {t(tab.label)}
            </button>
          )
        })}
      </div>

      {activeTab === 'cases' && (
        <Panel
          description="One row per investment subject, connecting evidence, thesis, decisions, plans, and review dates."
          title="Case index"
        >
          <DataTable
            columns={[
              { key: 'case', label: 'Asset', sortable: true, sticky: true },
              { key: 'thesis', label: 'Latest thesis', sortable: true },
              { key: 'decision', label: 'Latest decision', sortable: true },
              { key: 'plan', label: 'Current plan', sortable: true },
              { key: 'review', label: 'Review due', sortable: true },
              { key: 'actions', label: 'Open actions', align: 'right', sortable: true },
              { key: 'evidence', label: 'Evidence', align: 'right', sortable: true },
            ]}
            emptyMessage="No investment cases match the current filters."
            rows={cases.map((item) => ({
              id: item.subject,
              cells: {
                case: <EntityCell interactive subject={item.subject} title={item.title} />,
                evidence: String(item.evidence),
                thesis: item.thesis,
                decision: item.decision,
                plan: item.plan,
                review: item.reviewBy,
                actions:
                  item.actions > 0 ? <Chip tone="warning">{String(item.actions)}</Chip> : '0',
              },
              sortValues: {
                case: item.title,
                evidence: item.evidence,
                thesis: item.thesis,
                decision: item.decision,
                plan: item.plan,
                review: item.reviewSort,
                actions: item.actions,
              },
            }))}
          />
        </Panel>
      )}

      {activeTab === 'market' && (
        <section>
          <Panel
            description="Market-level evidence stays separate from an individual asset case, so the case index remains decision-ready."
            title="Market context"
          >
            <KnowledgeTable
              emptyMessage="No market context matches the current filters."
              rows={marketResearch.map((item) => ({
                id: `${item.date}:${item.subject}:${item.title}`,
                title: item.title ?? item.subject,
                subject: item.subject,
                meta: joinKnowledgeMeta(item.date, item.source),
                tags: item.tags,
                body: item.body,
              }))}
            />
          </Panel>
        </section>
      )}

      {activeTab === 'evidence' && (
        <section>
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
        </section>
      )}

      {(activeTab === 'theses' || activeTab === 'decisions') && (
        <section>
          {activeTab === 'theses' && (
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
          )}

          {activeTab === 'decisions' && (
            <Panel title="Decision ledger">
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
          )}
        </section>
      )}
    </div>
  )
}
