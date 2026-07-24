import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runNavorCli } from '@navor/cli'
import { describe, expect, it } from 'vitest'

describe('runNavorCli', () => {
  it('uses the public nav name in command errors', async () => {
    await expect(runNavorCli([])).rejects.toThrow(
      'Usage: nav <serve|build|check|format> <workspace> [--out <dir>] [--port <port>] [--check]',
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

  it('formats and checks .nav files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'navor-cli-format-'))
    const file = join(dir, 'ledger.nav')
    await writeFile(
      file,
      `2026-01-01 txn Account:US "Cash"
  Assets:Cash:USD 10 USD
  Equity:Capital -10 USD
`,
      'utf8',
    )

    const checkBefore = await runNavorCli(['format', file, '--check'])
    expect(checkBefore.command).toBe('format')
    if (checkBefore.command === 'format') {
      expect(checkBefore.changed).toEqual([file])
    }

    const formatted = await runNavorCli(['format', file])
    expect(formatted.command).toBe('format')
    if (formatted.command === 'format') {
      expect(formatted.changed).toEqual([file])
    }

    const checkAfter = await runNavorCli(['format', file, '--check'])
    expect(checkAfter.command).toBe('format')
    if (checkAfter.command === 'format') {
      expect(checkAfter.changed).toEqual([])
      expect(checkAfter.unchanged).toEqual([file])
    }
  })

  it('checks a workspace and returns its diagnostics', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'navor-cli-check-'))
    const file = join(dir, 'knowledge.nav')
    await writeFile(
      file,
      `2026-01-01 research Asset:Equity:US:TEST "Test"
  source: Test
 ---
  Body
  ---
`,
      'utf8',
    )

    const previousExitCode = process.exitCode

    try {
      const checked = await runNavorCli(['check', dir])

      expect(checked.command).toBe('check')
      if (checked.command === 'check') {
        expect(checked.files).toEqual([file])
        expect(checked.diagnostics).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              file,
              line: 3,
              message: 'Line is not a valid directive.',
            }),
          ]),
        )
      }
      expect(process.exitCode).toBe(1)
    } finally {
      process.exitCode = previousExitCode
    }
  })
})
