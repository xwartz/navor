import { resolve } from 'node:path'

import type { CompileNavorWorkspaceOptions } from '@navor/renderer'
import type { Plugin, ViteDevServer } from 'vite'

import { workspaceWatchGlobs } from './vite-config'

export interface NavorWorkspacePluginOptions {
  workspaceRoot: string
  compileOptions?: CompileNavorWorkspaceOptions
}

interface NavorWorkspaceRuntime {
  compileNavorWorkspace: typeof import('@navor/renderer').compileNavorWorkspace
  handlePriceProxyRequest: typeof import('@navor/adapters').handlePriceProxyRequest
  invalidateNavorCompileCache: typeof import('@navor/renderer').invalidateNavorCompileCache
}

export function navorWorkspacePlugin(options: NavorWorkspacePluginOptions): Plugin {
  const workspaceRoot = resolve(options.workspaceRoot)
  const compileOptions = {
    fetchLivePrices: false,
    ...options.compileOptions,
  }

  return {
    name: 'navor-workspace',
    configureServer(server) {
      let compileCacheDirty = true

      for (const pattern of workspaceWatchGlobs(workspaceRoot)) {
        server.watcher.add(pattern)
      }

      server.watcher.on('change', (file) => {
        if (!affectsWorkspaceRuntime(file)) {
          return
        }

        compileCacheDirty = true
        server.ws.send({ type: 'full-reload', path: '*' })
      })

      server.watcher.on('add', (file) => {
        if (!affectsWorkspaceRuntime(file)) {
          return
        }

        compileCacheDirty = true
        server.ws.send({ type: 'full-reload', path: '*' })
      })

      server.watcher.on('unlink', (file) => {
        if (!affectsWorkspaceRuntime(file)) {
          return
        }

        compileCacheDirty = true
        server.ws.send({ type: 'full-reload', path: '*' })
      })

      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/prices' && req.method === 'POST') {
          try {
            const { handlePriceProxyRequest } = await loadWorkspaceRuntime(server)
            const request = await createRequestFromNode(req)
            const response = await handlePriceProxyRequest(request)
            res.statusCode = response.status
            response.headers.forEach((value, key) => {
              res.setHeader(key, value)
            })
            res.end(Buffer.from(await response.arrayBuffer()))
          } catch (error) {
            res.statusCode = 500
            res.end(error instanceof Error ? error.message : String(error))
          }
          return
        }

        if (req.url !== '/navor-data.json') {
          next()
          return
        }

        try {
          const { compileNavorWorkspace, invalidateNavorCompileCache } =
            await loadWorkspaceRuntime(server)

          if (compileCacheDirty) {
            invalidateNavorCompileCache(workspaceRoot)
            compileCacheDirty = false
          }

          const state = await compileNavorWorkspace(workspaceRoot, compileOptions)

          res.setHeader('Content-Type', 'application/json')
          res.end(`${JSON.stringify(state)}\n`)
        } catch (error) {
          res.statusCode = 500
          res.end(error instanceof Error ? error.message : String(error))
        }
      })
    },
  }
}

async function loadWorkspaceRuntime(server: ViteDevServer): Promise<NavorWorkspaceRuntime> {
  const [adapters, renderer] = await Promise.all([
    server.ssrLoadModule('@navor/adapters'),
    server.ssrLoadModule('@navor/renderer'),
  ])

  return {
    compileNavorWorkspace: renderer.compileNavorWorkspace,
    handlePriceProxyRequest: adapters.handlePriceProxyRequest,
    invalidateNavorCompileCache: renderer.invalidateNavorCompileCache,
  } as NavorWorkspaceRuntime
}

function affectsWorkspaceRuntime(file: string) {
  return (
    file.endsWith('.nav') ||
    file.endsWith('navor.config.json') ||
    /[/\\]packages[/\\](?:adapters|contract|core|renderer)[/\\]src[/\\]/.test(file)
  )
}

async function createRequestFromNode(req: import('node:http').IncomingMessage) {
  const host = req.headers.host ?? '127.0.0.1'
  const url = new URL(req.url ?? '/', `http://${host}`)
  const body = await readRequestBody(req)

  return new Request(url, {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: body.length > 0 ? new Uint8Array(body) : undefined,
  })
}

function readRequestBody(req: import('node:http').IncomingMessage) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []

    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}
