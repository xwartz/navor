import type { CompileNavorWorkspaceOptions } from '@navor/renderer'
import { createServer, type ViteDevServer } from 'vite'
import { createNavorReaderViteConfig } from './vite-config'

export interface CreateNavorReaderServerOptions {
  workspaceRoot: string
  host?: string
  port?: number
  compileOptions?: CompileNavorWorkspaceOptions
}

export interface NavorReaderServer {
  url: string
  server: ViteDevServer
  close: () => Promise<void>
}

export async function createNavorReaderServer(
  options: CreateNavorReaderServerOptions,
): Promise<NavorReaderServer> {
  const server = await createServer(
    createNavorReaderViteConfig({
      workspaceRoot: options.workspaceRoot,
      compileOptions: options.compileOptions,
      host: options.host,
      port: options.port,
    }),
  )

  await server.listen()

  const resolved =
    server.resolvedUrls?.local[0] ?? `http://${options.host ?? '127.0.0.1'}:${options.port ?? 5173}`

  return {
    url: resolved,
    server,
    close: async () => {
      await server.close()
    },
  }
}
