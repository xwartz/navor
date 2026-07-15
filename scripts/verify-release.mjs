import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

function run(command, args) {
  execFileSync(command, args, { stdio: 'inherit' })
}

function assertFile(path) {
  if (!existsSync(path)) {
    throw new Error(`Expected release artifact "${path}".`)
  }
}

run('pnpm', ['check'])
run('pnpm', ['test'])
run('pnpm', ['build'])
run('pnpm', ['build:example'])
assertFile(resolve('dist/site/index.html'))
assertFile(resolve('dist/site/navor-data.json'))
run('pnpm', ['build:demo'])
assertFile(resolve('apps/demo/dist/index.html'))
assertFile(resolve('apps/demo/dist/navor-data.json'))
