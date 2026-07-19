import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import type { NavorRendererAppState } from '@navor/contract'
import type { CompileNavorWorkspaceOptions } from '@navor/renderer'
import { compileNavorWorkspace } from '@navor/renderer'
import { build } from 'vite'

import { documentTitleFromState } from './document-title'
import { createNavorReaderViteConfig } from './vite-config'

export interface BuildNavorReaderAppOptions extends CompileNavorWorkspaceOptions {
  workspaceRoot: string
  outDir: string
}

export interface BuildNavorReaderAppResult {
  outDir: string
  files: string[]
  state: NavorRendererAppState
}

export async function buildNavorReaderApp(
  options: BuildNavorReaderAppOptions,
): Promise<BuildNavorReaderAppResult> {
  const outDir = resolve(options.outDir)
  const state = await compileNavorWorkspace(options.workspaceRoot, {
    ...options,
    fetchLivePrices: options.fetchLivePrices ?? false,
  })
  const title = documentTitleFromState(state)

  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })
  await writeFile(join(outDir, 'navor-data.json'), `${JSON.stringify(state, null, 2)}\n`)

  await build({
    ...createNavorReaderViteConfig({
      workspaceRoot: options.workspaceRoot,
      compileOptions: options,
      appName: title,
    }),
    build: {
      outDir,
      emptyOutDir: false,
    },
    envDir: false,
  })

  const indexPath = join(outDir, 'index.html')
  const html = await readFile(indexPath, 'utf8')
  const withDataSource = html.includes('data-navor-source')
    ? html
    : html.replace(
        '</head>',
        '    <script type="application/json" data-navor-source="./navor-data.json"></script>\n  </head>',
      )
  const escapedTitle = escapeHtml(title)
  const patchedHtml = withDataSource.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapedTitle}</title>`,
  )

  if (patchedHtml !== html) {
    await writeFile(indexPath, patchedHtml)
  }

  return {
    outDir,
    files: [
      'index.html',
      'manifest.webmanifest',
      'sw.js',
      'favicon.svg',
      'pwa-192.png',
      'pwa-512.png',
      'assets/app.js',
      'assets/app.css',
      'navor-data.json',
    ],
    state,
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
