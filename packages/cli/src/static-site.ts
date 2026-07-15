import { buildNavorReaderApp } from '@navor/reader-ui'
import type { CompileNavorWorkspaceOptions } from '@navor/renderer'

export interface BuildNavorStaticSiteOptions extends CompileNavorWorkspaceOptions {
  outDir: string
  fetchLivePrices?: boolean
}

export interface BuildNavorStaticSiteResult {
  outDir: string
  files: string[]
}

export async function buildNavorStaticSite(
  root: string,
  options: BuildNavorStaticSiteOptions,
): Promise<BuildNavorStaticSiteResult> {
  const built = await buildNavorReaderApp({
    workspaceRoot: root,
    outDir: options.outDir,
    today: options.today,
    prices: options.prices,
    priceAdapter: options.priceAdapter,
    stalePriceAfterDays: options.stalePriceAfterDays,
    fetchLivePrices: options.fetchLivePrices,
  })

  return {
    outDir: built.outDir,
    files: built.files,
  }
}
