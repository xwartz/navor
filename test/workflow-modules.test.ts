import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('workflow modules', () => {
  it('keeps the release plan aligned with Changesets and published packages', () => {
    expect(() =>
      execFileSync(process.execPath, ['scripts/release-plan.mjs', '--check']),
    ).not.toThrow()
    const plan = JSON.parse(
      execFileSync(process.execPath, ['scripts/release-plan.mjs', '--json'], { encoding: 'utf8' }),
    )

    expect(plan).toEqual([
      '@navor/contract',
      '@navor/core',
      '@navor/adapters',
      '@navor/renderer',
      '@navor/reader-ui',
      '@navor/cli',
    ])
  })

  it('routes CI and release through the shared verification modules', () => {
    const ci = readFileSync('.github/workflows/ci.yml', 'utf8')
    const release = readFileSync('.github/workflows/release.yml', 'utf8')

    expect(ci).toContain('node scripts/verify-release.mjs')
    expect(ci).toContain('node scripts/verify-distribution.mjs')
    expect(ci).not.toContain('--source=registry')
    expect(release).toContain('node scripts/release-plan.mjs publish')
    expect(release).not.toContain('verify-distribution.mjs')
  })

  it('installs packed packages before the workspace CLI smoke test', () => {
    const distribution = readFileSync('scripts/verify-distribution.mjs', 'utf8')

    expect(distribution).toContain("'pack'")
    expect(distribution).toContain("'install'")
    expect(distribution).toContain("'--ignore-scripts'")
    expect(distribution).toContain("join(installDirectory, 'node_modules/.bin/nav')")
    expect(distribution).not.toContain('registry')
  })
})
