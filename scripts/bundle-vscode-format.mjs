#!/usr/bin/env node
/**
 * Verify extensions/vscode/format.cjs stays aligned with @navor/core formatNavor.
 */
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outfile = join(root, 'extensions/vscode/format.cjs')
const coreEntry = join(root, 'packages/core/dist/index.mjs')
const require = createRequire(import.meta.url)

let core
try {
  core = await import(pathToFileURL(coreEntry).href)
} catch {
  console.error('Run `pnpm build` before bundle:vscode so @navor/core dist exists.')
  process.exit(1)
}

const local = require(outfile)

const sample = `2026-02-01 txn Asset:Equity:US:NVDA "Buy"
  Assets:Equity:US:NVDA 10 NVDA @ 900 USD
  Assets:Cash:USD -9,000 USD


; comment
2026-02-02 note Portfolio:Core "x"
  ---
  body
  ---
`

const fromCore = core.formatNavor(sample)
const fromExt = local.formatNavor(sample)

if (fromCore !== fromExt) {
  console.error('extensions/vscode/format.cjs drifted from @navor/core formatNavor')
  console.error('Update extensions/vscode/format.cjs to match packages/core/src/format.ts')
  process.exit(1)
}

console.log('extensions/vscode/format.cjs matches @navor/core formatNavor')
