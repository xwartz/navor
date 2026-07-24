import { loadNavorWorkspace, type NavorDiagnostic } from '@navor/core'

export type CheckNavorWorkspaceResult = {
  command: 'check'
  path: string
  files: string[]
  diagnostics: NavorDiagnostic[]
}

export async function checkNavorWorkspace(root: string): Promise<CheckNavorWorkspaceResult> {
  const workspace = await loadNavorWorkspace(root)

  return {
    command: 'check',
    path: root,
    files: workspace.files,
    diagnostics: workspace.diagnostics,
  }
}

export function checkNavorWorkspaceSummary(result: CheckNavorWorkspaceResult): string {
  if (result.diagnostics.length === 0) {
    return `Checked ${result.files.length} file(s); no diagnostics.`
  }

  return [
    `Found ${result.diagnostics.length} diagnostic(s) in ${result.files.length} file(s):`,
    ...result.diagnostics.map(formatDiagnostic),
  ].join('\n')
}

function formatDiagnostic(diagnostic: NavorDiagnostic): string {
  const location = diagnostic.file
    ? `${diagnostic.file}:${diagnostic.line}`
    : `line ${diagnostic.line}`

  return `${location}: ${diagnostic.message}`
}
