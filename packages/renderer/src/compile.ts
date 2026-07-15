import type { PriceAdapter } from '@navor/adapters'
import { createWorkspacePriceAdapter, resolveConfigStaticPrices } from '@navor/adapters'
import type { NavorRendererAppState } from '@navor/contract'
import {
  generateAllocation,
  generateKnowledgeViews,
  generateMarketView,
  generatePlanViews,
  generatePortfolio,
  generateProcessViews,
  getNavorWorkspaceFingerprint,
  getPortfolioOptions,
  loadNavorWorkspace,
  type MarketPrice,
  mergeFxRates,
} from '@navor/core'
import { rebuildReaderDerivedState } from './derived-state'
import { buildPriceManifest } from './price-manifest'

export interface CompileNavorWorkspaceOptions {
  today?: string
  prices?: MarketPrice[]
  priceAdapter?: PriceAdapter | null
  stalePriceAfterDays?: number
  useDefaultPriceAdapter?: boolean
  fetchLivePrices?: boolean
}

interface CompileCacheEntry {
  fingerprint: string
  optionsKey: string
  state?: NavorRendererAppState
  promise?: Promise<NavorRendererAppState>
}

const compileCache = new Map<string, CompileCacheEntry>()

export function invalidateNavorCompileCache(root?: string) {
  if (!root) {
    compileCache.clear()
    return
  }

  const prefix = `${root}\0`

  for (const key of compileCache.keys()) {
    if (key.startsWith(prefix)) {
      compileCache.delete(key)
    }
  }
}

function createCompileOptionsKey(options: CompileNavorWorkspaceOptions) {
  return JSON.stringify({
    today: options.today ?? null,
    stalePriceAfterDays: options.stalePriceAfterDays ?? null,
    useDefaultPriceAdapter: options.useDefaultPriceAdapter ?? false,
    fetchLivePrices: options.fetchLivePrices ?? false,
    prices: options.prices ?? null,
    priceAdapter: options.priceAdapter === null ? '__none__' : (options.priceAdapter?.name ?? null),
  })
}

export async function compileNavorWorkspace(
  root: string,
  options: CompileNavorWorkspaceOptions = {},
): Promise<NavorRendererAppState> {
  const fingerprint = await getNavorWorkspaceFingerprint(root)
  const optionsKey = createCompileOptionsKey(options)
  const cacheKey = `${root}\0${fingerprint}\0${optionsKey}`
  const cached = compileCache.get(cacheKey)

  if (cached?.state) {
    return cached.state
  }

  if (cached?.promise) {
    return cached.promise
  }

  const promise = compileNavorWorkspaceInternal(root, options).then((state) => {
    const entry = compileCache.get(cacheKey)

    if (entry) {
      entry.state = state
      entry.promise = undefined
    }

    return state
  })

  compileCache.set(cacheKey, {
    fingerprint,
    optionsKey,
    promise,
  })

  return promise
}

async function compileNavorWorkspaceInternal(
  root: string,
  options: CompileNavorWorkspaceOptions,
): Promise<NavorRendererAppState> {
  const workspace = await loadNavorWorkspace(root)
  const stalePriceAfterDays = options.stalePriceAfterDays ?? workspace.config.stalePriceAfterDays
  const portfolioOptions = getPortfolioOptions(workspace.ast)
  const baseCurrency = portfolioOptions.baseCurrency ?? workspace.config.baseCurrency ?? null
  const fxRates = mergeFxRates(workspace.config.fxRates, portfolioOptions.fxRates)
  const allocation = generateAllocation(workspace.ast, { baseCurrency, fxRates })
  const portfolio = generatePortfolio(workspace.ast)
  const plan = generatePlanViews(workspace.ast)
  const knowledge = generateKnowledgeViews(workspace.ast, { today: options.today })
  const process = generateProcessViews(workspace.ast)
  const priceManifest = buildPriceManifest(workspace.ast, workspace.config)
  const trackedSubjects = allocation.assets.map((asset) => asset.subject)
  const staticPrices = resolveConfigStaticPrices(trackedSubjects, workspace.config.staticPrices)
  const priceAdapter = resolvePriceAdapter(workspace, options)
  const adapterResult = priceAdapter ? await priceAdapter.fetchPrices(trackedSubjects) : null
  const prices = mergePrices({
    explicitPrices: options.prices ?? [],
    staticPrices,
    livePrices: adapterResult?.prices ?? [],
  })
  const failures = adapterResult?.failures ?? []
  const marketResearch = generateMarketView(workspace.ast, { portfolio }).research
  const recentTransactions = workspace.ast.directives
    .filter((directive) => directive.directive === 'txn')
    .map((directive) => ({
      date: directive.date,
      subject: directive.subject,
      title: directive.title,
    }))
  const { dashboard, drift, market, priceEnrichment } = rebuildReaderDerivedState({
    facts: {
      allocation,
      portfolio,
      knowledge,
      process,
      plan,
      baseCurrency,
      fxRates,
      marketResearch,
      priceManifest,
      recentTransactions,
    },
    prices,
    failures,
    today: options.today,
    stalePriceAfterDays,
  })

  return {
    workspace: {
      root,
      files: workspace.files,
      diagnostics: workspace.diagnostics,
    },
    dashboard,
    portfolio,
    allocation,
    knowledge,
    process,
    market,
    plan,
    drift,
    enrichment: {
      prices: priceEnrichment,
    },
    priceManifest,
  }
}

function mergePrices({
  explicitPrices,
  staticPrices,
  livePrices,
}: {
  explicitPrices: MarketPrice[]
  staticPrices: MarketPrice[]
  livePrices: MarketPrice[]
}) {
  const merged = new Map<string, MarketPrice>()

  for (const price of [...staticPrices, ...explicitPrices, ...livePrices]) {
    merged.set(price.subject, price)
  }

  return [...merged.values()]
}

function resolvePriceAdapter(
  workspace: Awaited<ReturnType<typeof loadNavorWorkspace>>,
  options: CompileNavorWorkspaceOptions,
) {
  if (options.priceAdapter === null) {
    return null
  }

  if (options.priceAdapter) {
    return options.priceAdapter
  }

  if (options.prices?.length) {
    return null
  }

  const shouldFetchLive =
    options.fetchLivePrices === true || options.useDefaultPriceAdapter === true

  if (!shouldFetchLive) {
    return null
  }

  return createWorkspacePriceAdapter({
    ast: workspace.ast,
    config: workspace.config,
  })
}
