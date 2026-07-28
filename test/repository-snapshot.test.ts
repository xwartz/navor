import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadNavorRepositorySnapshot } from '@navor/core'
import { describe, expect, it } from 'vitest'

describe('Repository snapshot', () => {
  it('retains a configuration diagnostic instead of treating invalid JSON as absent', async () => {
    const root = await mkdtemp(join(tmpdir(), 'navor-snapshot-'))
    await writeFile(join(root, 'activity.nav'), '2026-01-01 note Portfolio:Core "Note"\n')
    await writeFile(join(root, 'navor.config.json'), '{ invalid')

    const snapshot = await loadNavorRepositorySnapshot(root)

    expect(snapshot.fingerprint).toContain('activity.nav')
    expect(snapshot.workspace.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ file: join(root, 'navor.config.json'), line: 1 }),
      ]),
    )
  })
})
