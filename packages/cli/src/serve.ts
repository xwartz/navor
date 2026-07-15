import type { NavorRendererAppState } from '@navor/contract'
import { createNavorReaderServer } from '@navor/reader-ui'
import { type CompileNavorWorkspaceOptions, compileNavorWorkspace } from '@navor/renderer'

export interface ServeNavorWorkspaceOptions extends CompileNavorWorkspaceOptions {
  port?: number
  host?: string
}

export interface ServedNavorWorkspace {
  url: string
  state: NavorRendererAppState
  close: () => Promise<void>
}

export async function serveNavorWorkspace(
  root: string,
  options: ServeNavorWorkspaceOptions = {},
): Promise<ServedNavorWorkspace> {
  const compileOptions = {
    fetchLivePrices: false,
    ...options,
  }
  const state = await compileNavorWorkspace(root, compileOptions)
  const reader = await createNavorReaderServer({
    workspaceRoot: root,
    host: options.host,
    port: options.port,
    compileOptions,
  })

  return {
    url: reader.url,
    state,
    close: reader.close,
  }
}
