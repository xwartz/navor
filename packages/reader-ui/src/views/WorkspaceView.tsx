import type { NavorRendererAppState } from '@navor/contract'

import { formatWorkspacePath } from '../components/format'
import { Panel } from '../components/Panel'
import { SummaryStrip, ViewHeader } from '../components/ViewScaffold'
import { t } from '../i18n'
import { buildWorkspaceFileTree, formatWorkspaceFileTree } from '../workspace-file-tree'

export function WorkspaceView({ state }: { state: NavorRendererAppState }) {
  const relativeFiles = state.workspace.files.map((file) =>
    formatWorkspacePath(state.workspace.root, file),
  )
  const treeLines = formatWorkspaceFileTree(buildWorkspaceFileTree(relativeFiles))

  return (
    <div className="space-y-5">
      <ViewHeader
        description="Source files behind this reader."
        eyebrow="Controls"
        title="Workspace"
      />

      <SummaryStrip
        items={[
          {
            label: t('Root'),
            value: state.workspace.root.split('/').pop() ?? state.workspace.root,
          },
          { label: 'Source files', value: String(state.workspace.files.length) },
          {
            label: 'Workspace diagnostics',
            value: String(state.workspace.diagnostics.length),
            tone: state.workspace.diagnostics.length > 0 ? 'warning' : 'positive',
          },
          { label: 'Price states', value: String(state.enrichment.prices.length) },
        ]}
      />

      <Panel description="Directory tree under the workspace root." title="Source files">
        {treeLines.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('No source files in this workspace.')}</p>
        ) : (
          <pre className="overflow-x-auto font-mono text-xs leading-5 text-ink-muted">
            {treeLines.join('\n')}
          </pre>
        )}
      </Panel>
    </div>
  )
}
