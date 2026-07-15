import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runNavorCli } from '@navor/cli'
import { describe, expect, it } from 'vitest'

describe('runNavorCli', () => {
  it('uses the public nav name in command errors', async () => {
    await expect(runNavorCli([])).rejects.toThrow(
      'Usage: nav <serve|build> <workspace> [--out <dir>] [--port <port>]',
    )
    await expect(runNavorCli(['unknown', 'fixtures/core'])).rejects.toThrow(
      'Unknown nav command "unknown".',
    )
  })

  it('dispatches serve and build commands through the renderer workflows', async () => {
    const served = await runNavorCli(['serve', 'fixtures/core', '--port', '0'])

    try {
      expect(served.command).toBe('serve')
      if (served.command === 'serve') {
        expect(served.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/?$/)
        expect(served.state.workspace.files).toHaveLength(7)
      }
    } finally {
      if (served.command === 'serve') {
        await served.close()
      }
    }

    const outDir = await mkdtemp(join(tmpdir(), 'navor-cli-static-'))
    const built = await runNavorCli(['build', 'fixtures/core', '--out', outDir])

    expect(built.command).toBe('build')
    if (built.command === 'build') {
      expect(built.outDir).toBe(outDir)
    }
    expect(await readFile(join(outDir, 'navor-data.json'), 'utf8')).toContain('Account:Crypto')
  })
})
