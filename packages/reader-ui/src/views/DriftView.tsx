import type { NavorRendererAppState } from '@navor/contract'
import { useAssetWorkspace } from '../asset-workspace-context'
import { Panel } from '../components/Panel'
import { Chip, InsetList, LabelCaps, SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'
import { t } from '../i18n'

export function DriftView({
  state,
  filters,
}: {
  state: NavorRendererAppState
  filters: ReaderFilters
}) {
  const { openAsset } = useAssetWorkspace()
  const { type: category, ...baseFilters } = filters
  const actions = state.dashboard.actionInbox.filter(
    (item) => matchesFilters(item, baseFilters) && (!category || item.category === category),
  )
  const categoryCounts = new Map([
    [
      'investment_risk',
      state.dashboard.actionInbox.filter((item) => item.category === 'investment_risk').length,
    ],
    [
      'process_due',
      state.dashboard.actionInbox.filter((item) => item.category === 'process_due').length,
    ],
    [
      'data_integrity',
      state.dashboard.actionInbox.filter((item) => item.category === 'data_integrity').length,
    ],
  ])

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Ranked work that can change risk, process quality, or data confidence."
        eyebrow="Monitor"
        title="Action center"
      />

      <SummaryStrip
        items={[
          {
            label: 'Open actions',
            value: String(state.dashboard.actionInbox.length),
            tone: state.dashboard.actionInbox.length > 0 ? 'warning' : 'positive',
          },
          {
            label: 'Allocation risk',
            value: String(categoryCounts.get('investment_risk') ?? 0),
            tone: (categoryCounts.get('investment_risk') ?? 0) > 0 ? 'warning' : 'positive',
          },
          {
            label: 'Process due',
            value: String(categoryCounts.get('process_due') ?? 0),
            tone: (categoryCounts.get('process_due') ?? 0) > 0 ? 'warning' : 'positive',
          },
          {
            label: 'Data integrity',
            value: String(categoryCounts.get('data_integrity') ?? 0),
            tone: (categoryCounts.get('data_integrity') ?? 0) > 0 ? 'warning' : 'positive',
          },
        ]}
      />

      <Panel
        description="Open an item for its evidence, position context, and next action."
        title="Next actions"
      >
        {actions.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('No actions match the current filters.')}</p>
        ) : (
          <InsetList>
            {actions.map((item, index) => (
              <button
                aria-haspopup="dialog"
                className="grid min-h-16 w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-4 py-3.5 text-left transition-[background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-paper-subtle/40"
                key={item.id}
                onClick={() => openAsset(item.subject)}
                type="button"
              >
                <div className="min-w-0">
                  <LabelCaps>
                    {t('Priority')} {index + 1} · {actionCategoryLabel(item.category)}
                  </LabelCaps>
                  <p className="mt-1 truncate text-sm font-semibold text-ink">
                    {item.title ?? item.subject}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">{item.message}</p>
                  <p className="mt-1 text-xs font-medium text-accent-ink">{item.action}</p>
                </div>
                <Chip
                  tone={
                    item.severity === 'high'
                      ? 'danger'
                      : item.severity === 'medium'
                        ? 'warning'
                        : 'neutral'
                  }
                >
                  {item.severity}
                </Chip>
              </button>
            ))}
          </InsetList>
        )}
      </Panel>
    </div>
  )
}

function actionCategoryLabel(
  category: NavorRendererAppState['dashboard']['actionInbox'][number]['category'],
) {
  if (category === 'investment_risk') return t('Allocation risk')
  if (category === 'process_due') return t('Process due')
  return t('Data integrity')
}
