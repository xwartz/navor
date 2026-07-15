#!/usr/bin/env node
import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { type ServedNavorWorkspace, serveNavorWorkspace } from './serve'
import { type BuildNavorStaticSiteResult, buildNavorStaticSite } from './static-site'

export type NavorCliResult =
  | (ServedNavorWorkspace & { command: 'serve' })
  | (BuildNavorStaticSiteResult & { command: 'build' })

export type { ServedNavorWorkspace, ServeNavorWorkspaceOptions } from './serve'
export type {
  BuildNavorStaticSiteOptions,
  BuildNavorStaticSiteResult,
} from './static-site'
export { buildNavorStaticSite, serveNavorWorkspace }

export async function runNavorCli(
  args: string[],
  options: { interactive?: boolean } = {},
): Promise<NavorCliResult> {
  const [command, workspace, ...rest] = args

  if (!command || !workspace) {
    throw new Error('Usage: nav <serve|build> <workspace> [--out <dir>] [--port <port>]')
  }

  if (command === 'serve') {
    const port = Number(readOption(rest, '--port') ?? 5173)
    const served = await serveNavorWorkspace(workspace, { port })

    if (options.interactive) {
      console.log(`Navor Reader ready at ${served.url}`)

      await new Promise<void>((resolve) => {
        const shutdown = async () => {
          await served.close()
          resolve()
        }

        process.once('SIGINT', shutdown)
        process.once('SIGTERM', shutdown)
      })
    }

    return {
      command,
      url: served.url,
      state: served.state,
      close: served.close,
    }
  }

  if (command === 'build') {
    const outDir = readOption(rest, '--out')

    if (!outDir) {
      throw new Error('Usage: nav build <workspace> --out <dir>')
    }

    const fetchLivePrices = rest.includes('--fetch-prices')
    const built = await buildNavorStaticSite(workspace, { outDir, fetchLivePrices })

    console.log(`Navor static site written to ${built.outDir}`)

    return {
      command,
      ...built,
    }
  }

  throw new Error(`Unknown nav command "${command}".`)
}

function readOption(args: string[], name: string) {
  const index = args.indexOf(name)

  if (index === -1) {
    return null
  }

  return args[index + 1] ?? null
}

function isCliEntry() {
  const entry = process.argv[1]
  if (!entry) {
    return false
  }

  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(entry)
  } catch {
    return false
  }
}

if (isCliEntry()) {
  runNavorCli(process.argv.slice(2), { interactive: true }).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
