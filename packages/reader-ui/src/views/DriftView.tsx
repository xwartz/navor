import type { NavorRendererAppState } from '@navor/contract'
import { useAssetWorkspace } from '../asset-workspace-context'
import { Panel } from '../components/Panel'
import { Chip, DestinationTabs, EmptyState, ViewHeader } from '../components/ViewScaffold'
import type { ReaderFilters } from '../filters'
import { matchesFilters } from '../filters'
import { t, translateText } from '../i18n'

type ActionCategory = NavorRendererAppState['dashboard']['actionInbox'][number]['category']

const CATEGORY_ORDER: ActionCategory[] = ['investment_risk', 'process_due', 'data_integrity']

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
  const categoryCounts = CATEGORY_ORDER.map((id) => ({
    id,
    count: state.dashboard.actionInbox.filter((item) => item.category === id).length,
  }))

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Ranked work that can change risk, process quality, or data confidence."
        title="Briefing"
      />

      <DestinationTabs active="drift" counts={{ drift: state.dashboard.actionInbox.length }} />

      <Panel
        actions={
          <dl className="flex flex-wrap justify-end gap-x-4 gap-y-1 text-xs">
            {categoryCounts.map((entry) => (
              <div className="flex items-baseline gap-1.5" key={entry.id}>
                <dt className="text-ink-faint">{actionCategoryLabel(entry.id)}</dt>
                <dd
                  className={`font-semibold tabular-nums ${entry.count > 0 ? 'text-warning' : 'text-ink-muted'}`}
                >
                  {entry.count}
                </dd>
              </div>
            ))}
          </dl>
        }
        description="Open an item for its evidence, position context, and next action."
        title="Next actions"
      >
        {actions.length === 0 ? (
          <EmptyState>{t('No actions match the current filters.')}</EmptyState>
        ) : (
          <ul className="panel-bleed divide-y divide-border/50">
            {actions.map((item, index) => (
              <li key={item.id}>
                <button
                  aria-haspopup="dialog"
                  className="grid min-h-16 w-full grid-cols-[1.75rem_minmax(0,1fr)_auto] items-start gap-3 px-5 py-3.5 text-left transition-[background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/35 [@media(hover:hover)]:hover:bg-paper-subtle/60"
                  onClick={() => openAsset(item.subject)}
                  type="button"
                >
                  <span className="pt-px font-mono text-xs tabular-nums text-ink-faint">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-sm font-semibold text-ink">{item.title ?? item.subject}</p>
                      <span className="label-caps">{actionCategoryLabel(item.category)}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-ink-muted">{item.message}</p>
                    <p className="mt-1 text-xs font-medium text-accent-ink">
                      {translateText(item.action)}
                    </p>
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
                    {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                  </Chip>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}

function actionCategoryLabel(category: ActionCategory) {
  if (category === 'investment_risk') return t('Allocation risk')
  if (category === 'process_due') return t('Process due')
  return t('Data integrity')
}
