import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import type { NavorRendererAppState } from '@navor/contract'
import type { CompileNavorWorkspaceOptions } from '@navor/renderer'
import { compileNavorWorkspace } from '@navor/renderer'
import { build } from 'vite'

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
  await mkdir(outDir, { recursive: true })

  await build({
    ...createNavorReaderViteConfig({
      workspaceRoot: options.workspaceRoot,
      compileOptions: options,
    }),
    build: {
      outDir,
      emptyOutDir: true,
    },
    envDir: false,
  })

  await writeFile(join(outDir, 'navor-data.json'), `${JSON.stringify(state, null, 2)}\n`)

  const indexPath = join(outDir, 'index.html')
  const html = await readFile(indexPath, 'utf8')
  const patchedHtml = html.includes('data-navor-source')
    ? html
    : html.replace(
        '</head>',
        '    <script type="application/json" data-navor-source="./navor-data.json"></script>\n  </head>',
      )

  if (patchedHtml !== html) {
    await writeFile(indexPath, patchedHtml)
  }

  return {
    outDir,
    files: ['index.html', 'favicon.svg', 'assets/app.js', 'assets/app.css', 'navor-data.json'],
    state,
  }
}
