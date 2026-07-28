import { mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { NavorRendererAppState } from '@navor/contract'
import type { CompileNavorWorkspaceOptions } from '@navor/renderer'
import { compileNavorWorkspace } from '@navor/renderer'
import { build } from 'vite'

import { finalizeReaderArtifacts, writeReaderState } from './artifact-assembly'
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
  await writeReaderState(outDir, state)

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

  return {
    outDir,
    files: await finalizeReaderArtifacts(outDir, state),
    state,
  }
}
