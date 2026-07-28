#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'

const root = process.cwd()
const { parseNavor } = await import(new URL('../packages/core/dist/index.mjs', import.meta.url))
const fixtureFiles = [
  'portfolio.nav',
  'plan.nav',
  'accounts/accounts.nav',
  'assets/assets.nav',
  'activity/transactions.nav',
  'activity/knowledge.nav',
  'activity/process.nav',
]
const iterations = Number(process.env.NAVOR_PARSE_BENCH_ITERATIONS ?? 100)
const sources = await Promise.all(
  fixtureFiles.map((file) => readFile(join(root, 'fixtures/core', file), 'utf8')),
)

const startedAt = performance.now()
let directiveCount = 0
for (let index = 0; index < iterations; index += 1) {
  for (const source of sources) {
    directiveCount += parseNavor(source).ast.directives.length
  }
}

const elapsedMs = performance.now() - startedAt
console.log(
  JSON.stringify({
    fixture: 'fixtures/core',
    iterations,
    files: sources.length,
    directives: directiveCount,
    elapsedMs: Number(elapsedMs.toFixed(2)),
  }),
)
