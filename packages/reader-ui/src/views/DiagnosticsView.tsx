import type { NavorDiagnostic, NavorRendererAppState } from '@navor/contract'

import { DiagnosticList } from '../components/DiagnosticList'
import { Panel } from '../components/Panel'
import { SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import { type MessageKey, t } from '../i18n'

export function DiagnosticsView({ state }: { state: NavorRendererAppState }) {
  const groups = [
    { label: 'Workspace', diagnostics: state.workspace.diagnostics },
    { label: 'Dashboard', diagnostics: state.dashboard.diagnostics },
    { label: 'Portfolio', diagnostics: state.portfolio.diagnostics },
    { label: 'Allocation', diagnostics: state.allocation.diagnostics },
    { label: 'Knowledge', diagnostics: state.knowledge.diagnostics },
    { label: 'Plan', diagnostics: state.plan.diagnostics },
    { label: 'Drift', diagnostics: state.drift.diagnostics },
  ]
  const diagnostics = groups.flatMap((group) =>
    group.diagnostics.map((diagnostic) => ({ ...diagnostic, group: group.label })),
  )

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Warnings that affect data trust and decision quality."
        eyebrow="Controls"
        title="Diagnostics"
      />

      <SummaryStrip
        items={[
          {
            label: 'Warnings',
            value: String(diagnostics.length),
            tone: diagnostics.length > 0 ? 'warning' : 'positive',
          },
          {
            label: 'Affected groups',
            value: String(groups.filter((group) => group.diagnostics.length > 0).length),
          },
          { label: 'Source files', value: String(state.workspace.files.length) },
          { label: 'Price checks', value: String(state.enrichment.prices.length) },
        ]}
      />

      {diagnostics.length === 0 ? (
        <Panel title="All diagnostics">
          <p className="text-sm text-ink-muted">{t('No diagnostics.')}</p>
        </Panel>
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {groups
            .filter((group) => group.diagnostics.length > 0)
            .map((group) => (
              <Panel
                actions={
                  <span className="text-xs tabular-nums text-ink-faint">
                    {group.diagnostics.length}
                  </span>
                }
                key={group.label}
                title={group.label as MessageKey}
              >
                <DiagnosticList diagnostics={group.diagnostics as NavorDiagnostic[]} />
              </Panel>
            ))}
        </section>
      )}
    </div>
  )
}
