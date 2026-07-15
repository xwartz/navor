import { execFile, execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { beforeAll, describe, expect, it } from 'vitest'

const execFileAsync = promisify(execFile)
const cliEntry = resolve('packages/cli/dist/index.mjs')

beforeAll(() => {
  if (!existsSync(cliEntry)) {
    execFileSync('pnpm', ['build'], { cwd: process.cwd(), stdio: 'inherit' })
  }
})

describe('compiled nav cli', () => {
  it('builds a static site from dist without bundling vite internals', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'navor-cli-dist-'))

    const { stdout } = await execFileAsync(
      process.execPath,
      [cliEntry, 'build', 'fixtures/core', '--out', outDir],
      { cwd: process.cwd() },
    )

    expect(stdout).toContain(`Navor static site written to ${outDir}`)
    expect(await readFile(join(outDir, 'index.html'), 'utf8')).toContain('<title>Navor</title>')
    expect(await readFile(join(outDir, 'navor-data.json'), 'utf8')).toContain('Account:Crypto')
    const appJs = await readFile(join(outDir, 'assets', 'app.js'), 'utf8')
    expect(appJs).not.toContain('node:fs/promises')
    expect(appJs).not.toContain('loadNavorWorkspace')
  })

  it('runs through the packaged nav entry point', async () => {
    const packageManifest = JSON.parse(await readFile('packages/cli/package.json', 'utf8'))
    const cliShim = cliEntry
    const outDir = await mkdtemp(join(tmpdir(), 'navor-cli-shim-'))

    expect(packageManifest.bin).toEqual({ nav: './dist/index.mjs' })

    const { stdout } = await execFileAsync(cliShim, ['build', 'fixtures/core', '--out', outDir], {
      cwd: process.cwd(),
    })

    expect(stdout).toContain(`Navor static site written to ${outDir}`)
    expect(await readFile(join(outDir, 'index.html'), 'utf8')).toContain('<title>Navor</title>')
  })
})
