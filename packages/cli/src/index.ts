#!/usr/bin/env node
import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import {
  type CheckNavorWorkspaceResult,
  checkNavorWorkspace,
  checkNavorWorkspaceSummary,
} from './check'
import { type FormatNavorPathResult, formatNavorPath, formatNavorPathSummary } from './format'
import { type ServedNavorWorkspace, serveNavorWorkspace } from './serve'
import { type BuildNavorStaticSiteResult, buildNavorStaticSite } from './static-site'

export type NavorCliResult =
  | (ServedNavorWorkspace & { command: 'serve' })
  | (BuildNavorStaticSiteResult & { command: 'build' })
  | CheckNavorWorkspaceResult
  | FormatNavorPathResult

export type { CheckNavorWorkspaceResult } from './check'
export type { FormatNavorPathResult } from './format'
export type { ServedNavorWorkspace, ServeNavorWorkspaceOptions } from './serve'
export type {
  BuildNavorStaticSiteOptions,
  BuildNavorStaticSiteResult,
} from './static-site'
export { buildNavorStaticSite, checkNavorWorkspace, formatNavorPath, serveNavorWorkspace }

export async function runNavorCli(
  args: string[],
  options: { interactive?: boolean } = {},
): Promise<NavorCliResult> {
  const [command, target, ...rest] = args

  if (!command || !target) {
    throw new Error(
      'Usage: nav <serve|build|check|format> <workspace> [--out <dir>] [--port <port>] [--check]',
    )
  }

  if (command === 'serve') {
    const port = Number(readOption(rest, '--port') ?? 5173)
    const served = await serveNavorWorkspace(target, { port })

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
    const built = await buildNavorStaticSite(target, { outDir, fetchLivePrices })

    console.log(`Navor static site written to ${built.outDir}`)

    return {
      command,
      ...built,
    }
  }

  if (command === 'check') {
    const result = await checkNavorWorkspace(target)

    console.log(checkNavorWorkspaceSummary(result))

    if (result.diagnostics.length > 0) {
      process.exitCode = 1
    }

    return result
  }

  if (command === 'format') {
    const check = rest.includes('--check')
    const result = await formatNavorPath(target, { check })

    console.log(formatNavorPathSummary(result))

    if (check && result.changed.length > 0) {
      process.exitCode = 1
    }

    return result
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
