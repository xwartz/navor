import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildNavorStaticSite } from '@navor/cli'
import type { NavorRendererAppState } from '@navor/contract'
import { describe, expect, it } from 'vitest'

describe('buildNavorStaticSite', () => {
  it('uses the Portfolio option subject for the document title before capital', async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), 'navor-title-workspace-'))
    const outDir = await mkdtemp(join(tmpdir(), 'navor-title-site-'))
    await writeFile(
      join(workspaceRoot, 'portfolio.nav'),
      `2026-01-01 capital Portfolio:Legacy "Initial capital"
  amount: 1 USD

2026-01-01 option Portfolio:2629 "2629 workspace"
  base_currency: USD
`,
    )

    await buildNavorStaticSite(workspaceRoot, { outDir })

    const html = await readFile(join(outDir, 'index.html'), 'utf8')
    expect(html).toContain('<title>2629 - Navor</title>')
  })

  it('writes a view-only static site with serialized Navor app state and bundled assets', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'navor-static-'))

    const result = await buildNavorStaticSite('fixtures/core', {
      outDir,
      today: '2026-07-08',
    })

    const html = await readFile(join(outDir, 'index.html'), 'utf8')
    const js = await readFile(join(outDir, 'assets', 'app.js'), 'utf8')
    const css = await readFile(join(outDir, 'assets', 'app.css'), 'utf8')
    const manifest = JSON.parse(await readFile(join(outDir, 'manifest.webmanifest'), 'utf8')) as {
      name: string
      display: string
      icons: Array<{ src: string; sizes: string }>
    }
    const serviceWorker = await readFile(join(outDir, 'sw.js'), 'utf8')
    const data = JSON.parse(
      await readFile(join(outDir, 'navor-data.json'), 'utf8'),
    ) as NavorRendererAppState

    expect(result.outDir).toBe(outDir)
    expect(result.files).toEqual([
      'index.html',
      'manifest.webmanifest',
      'sw.js',
      'favicon.svg',
      'pwa-192.png',
      'pwa-512.png',
      'assets/app.js',
      'assets/app.css',
      'navor-data.json',
    ])
    expect(html).toContain('<title>Core - Navor</title>')
    expect(html).toContain('navor-data.json')
    expect(html).toContain('manifest.webmanifest')
    expect(js.length).toBeGreaterThan(100)
    expect(css.length).toBeGreaterThan(100)
    expect(manifest).toMatchObject({ name: 'Core - Navor', display: 'standalone' })
    expect(manifest.icons).toContainEqual({
      src: 'pwa-192.png',
      sizes: '192x192',
      type: 'image/png',
    })
    expect(serviceWorker).toContain('navor-data.json')
    expect(serviceWorker).not.toContain('/api/prices')
    expect(data.workspace.files).toHaveLength(7)
    expect(data.dashboard.accounts.map((account) => account.subject)).toEqual([
      'Account:US',
      'Account:Crypto',
      'Account:HKA',
    ])
  })
})
