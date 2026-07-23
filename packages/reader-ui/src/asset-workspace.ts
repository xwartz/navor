import type { NavorRendererAppState } from '@navor/contract'

type AssetWorkspaceFacts = {
  allocation: NavorRendererAppState['allocation']['assets'][number] | null
  execution: NavorRendererAppState['dashboard']['assetExecutions'][number] | null
  holding: NavorRendererAppState['portfolio']['holdings'][number] | null
  market: NavorRendererAppState['market']['portfolioValues'][number] | null
  drift: NavorRendererAppState['drift']['entries'][number] | null
  plan: NavorRendererAppState['plan']['entries'][number] | null
  plans: NavorRendererAppState['plan']['entries']
  price: NavorRendererAppState['market']['prices'][number] | null
  priceStatus: NavorRendererAppState['enrichment']['prices'][number] | null
  transactions: NavorRendererAppState['portfolio']['transactions']
  watchlist: NavorRendererAppState['process']['watchlist'][number] | null
  actions: NavorRendererAppState['dashboard']['actionInbox']
  research: NavorRendererAppState['knowledge']['research']
  theses: NavorRendererAppState['knowledge']['theses']
  decisions: NavorRendererAppState['knowledge']['decisions']
}

export interface AssetWorkspaceIndex {
  get: (subject: string) => AssetWorkspaceFacts | null
  has: (subject: string | null | undefined) => boolean
}

export function buildAssetWorkspaceIndex(state: NavorRendererAppState): AssetWorkspaceIndex {
  const subjects = new Set<string>()
  const add = (subject: string | null | undefined) => {
    if (subject?.startsWith('Asset:')) subjects.add(subject)
  }

  for (const item of state.allocation.assets) add(item.subject)
  for (const item of state.dashboard.assetExecutions) add(item.subject)
  for (const item of state.portfolio.holdings) add(item.asset)
  for (const item of state.drift.entries) add(item.subject)
  for (const item of state.plan.entries) add(item.subject)
  for (const item of state.process.watchlist) add(item.subject)
  for (const item of state.knowledge.research) add(item.subject)
  for (const item of state.knowledge.theses) add(item.subject)
  for (const item of state.knowledge.decisions) add(item.subject)

  const executionBySubject = new Map(
    state.dashboard.assetExecutions.map((item) => [item.subject, item]),
  )
  const holdingBySubject = new Map(state.portfolio.holdings.map((item) => [item.asset, item]))
  const marketBySubject = new Map(state.market.portfolioValues.map((item) => [item.subject, item]))
  const driftBySubject = new Map(state.drift.entries.map((item) => [item.subject, item]))
  const watchlistBySubject = new Map(state.process.watchlist.map((item) => [item.subject, item]))
  const allocationBySubject = new Map(state.allocation.assets.map((item) => [item.subject, item]))
  const priceBySubject = new Map(state.market.prices.map((item) => [item.subject, item]))
  const priceStatusBySubject = new Map(state.enrichment.prices.map((item) => [item.subject, item]))
  const currentPlanBySubject = new Map(state.plan.current.map((plan) => [plan.subject, plan]))

  return {
    has: (subject) => Boolean(subject && subjects.has(subject)),
    get: (subject) => {
      if (!subjects.has(subject)) return null
      return {
        allocation: allocationBySubject.get(subject) ?? null,
        execution: executionBySubject.get(subject) ?? null,
        holding: holdingBySubject.get(subject) ?? null,
        market: marketBySubject.get(subject) ?? null,
        drift: driftBySubject.get(subject) ?? null,
        plan: currentPlanBySubject.get(subject) ?? null,
        plans: state.plan.entries
          .filter((item) => item.subject === subject)
          .sort((left, right) => right.date.localeCompare(left.date)),
        price: priceBySubject.get(subject) ?? null,
        priceStatus: priceStatusBySubject.get(subject) ?? null,
        transactions: state.portfolio.transactions
          .filter((item) => item.subject === subject)
          .sort((left, right) => right.date.localeCompare(left.date)),
        watchlist: watchlistBySubject.get(subject) ?? null,
        actions: state.dashboard.actionInbox.filter((item) => item.subject === subject),
        research: state.knowledge.research.filter((item) => item.subject === subject),
        theses: state.knowledge.theses.filter((item) => item.subject === subject),
        decisions: state.knowledge.decisions.filter((item) => item.subject === subject),
      }
    },
  }
}
