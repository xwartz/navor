#!/usr/bin/env node
import { copyFile, readdir, unlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const extDir = join(root, 'extensions/vscode')

await copyFile(join(root, 'LICENSE'), join(extDir, 'LICENSE'))

const verify = spawnSync('pnpm', ['bundle:vscode'], { cwd: root, stdio: 'inherit' })
if (verify.status !== 0) {
  process.exit(verify.status ?? 1)
}

const existing = await readdir(extDir)
for (const name of existing) {
  if (name.endsWith('.vsix')) {
    await unlink(join(extDir, name))
  }
}

const packed = spawnSync(
  'npx',
  ['--yes', '@vscode/vsce', 'package', '--no-dependencies', '--allow-star-activation'],
  { cwd: extDir, stdio: 'inherit' },
)

if (packed.status !== 0) {
  process.exit(packed.status ?? 1)
}

const vsix = (await readdir(extDir)).find((name) => name.endsWith('.vsix'))
if (!vsix) {
  console.error('No .vsix produced in extensions/vscode')
  process.exit(1)
}

const vsixPath = join(extDir, vsix)
console.log(`Packaged ${vsixPath}`)

if (process.env.GITHUB_OUTPUT) {
  const { appendFileSync } = await import('node:fs')
  appendFileSync(process.env.GITHUB_OUTPUT, `vsix=${vsixPath}\n`)
}
