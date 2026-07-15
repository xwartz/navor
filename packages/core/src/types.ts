export interface NavorDirective {
  line: number
  file?: string
  date: string
  directive: string
  subject: string
  title: string | null
  metadata: Record<string, string>
  postings: NavorPosting[]
  body: string | null
}

export interface NavorAst {
  directives: NavorDirective[]
}

export interface NavorDiagnostic {
  line: number
  message: string
  file?: string
}

export interface ParseNavorResult {
  ast: NavorAst
  diagnostics: NavorDiagnostic[]
}

export interface MoneyAmount {
  amount: number
  currency: string
}

export interface AllocationAccount {
  subject: string
  title: string | null
  target: number | null
  total: MoneyAmount | null
  budget: MoneyAmount | null
  /** Resolved sleeve capital: budget ?? total ?? capital×target (FX-adjusted). */
  baseAmount: MoneyAmount | null
  allocatedPercent: number | null
}

export interface AllocationAsset {
  subject: string
  title: string | null
  account: string | null
  target: number | null
  targetAmount: MoneyAmount | null
  derivedPortfolioWeight: number | null
}

export interface AllocationResult {
  capital: (MoneyAmount & { subject: string }) | null
  accounts: AllocationAccount[]
  assets: AllocationAsset[]
  diagnostics: NavorDiagnostic[]
}

export interface PortfolioHolding {
  asset: string
  commodity: string
  quantity: number
  cost: MoneyAmount | null
}

export interface PortfolioCash {
  currency: string
  amount: number
}

export interface PortfolioFlow {
  account: string
  amount: number
  currency: string
}

export interface PortfolioRealizedPnl {
  asset: string
  date: string
  title: string | null
  amount: MoneyAmount
}

export interface PortfolioTransactionPosting {
  account: string
  quantity: number
  commodity: string
  price: MoneyAmount | null
}

export interface PortfolioTransactionView {
  date: string
  subject: string
  title: string | null
  file?: string
  line: number
  postings: PortfolioTransactionPosting[]
}

export interface PortfolioResult {
  transactions: PortfolioTransactionView[]
  holdings: PortfolioHolding[]
  cash: PortfolioCash[]
  income: PortfolioFlow[]
  expenses: PortfolioFlow[]
  realizedPnl: PortfolioRealizedPnl[]
  diagnostics: NavorDiagnostic[]
}

export interface KnowledgeViews {
  research: ResearchView[]
  theses: ThesisView[]
  decisions: DecisionView[]
  diagnostics: NavorDiagnostic[]
}

export interface ResearchView {
  date: string
  subject: string
  title: string | null
  source: string | null
  reliability: string | null
  tags: string[]
  body: string | null
}

export interface ThesisView {
  date: string
  subject: string
  title: string | null
  horizon: string | null
  sentiment: string | null
  confidence: string | null
  status: string | null
  invalidIf: string | null
  reviewBy: string | null
  body: string | null
}

export interface DecisionView {
  date: string
  subject: string
  title: string | null
  action: string | null
  targetWeight: string | null
  basedOn: string | null
  confidence: string | null
}

export interface WatchlistView {
  subject: string
  title: string | null
  account: string | null
  watchReason: string | null
}

export interface ReviewView {
  date: string
  subject: string
  title: string | null
  status: string | null
  action: string | null
  drift: string | null
  body: string | null
}

export interface JournalView {
  date: string
  directive: 'journal' | 'note'
  subject: string
  title: string | null
  mood: string | null
  related: string | null
  body: string | null
}

export interface ProcessViews {
  watchlist: WatchlistView[]
  reviews: ReviewView[]
  journal: JournalView[]
}

export interface PlanEntry {
  date: string
  subject: string
  title: string | null
  target: number | null
  min: number | null
  max: number | null
  rebalance: string | null
  actionWhenBelow: string | null
  actionWhenAbove: string | null
}

export interface PlanResult {
  entries: PlanEntry[]
  diagnostics: NavorDiagnostic[]
}

export interface DriftEntry {
  subject: string
  title: string | null
  targetWeight: number | null
  actualWeight: number | null
  drift: number | null
  status: 'on_track' | 'below_min' | 'above_max' | 'unknown'
  marketValue: MoneyAmount | null
  marketValueInBase: MoneyAmount | null
  planMin: number | null
  planMax: number | null
}

export interface DriftResult {
  baseCurrency: string | null
  totalMarketValue: MoneyAmount | null
  fxRates: Record<string, number>
  unconvertedCurrencies: string[]
  entries: DriftEntry[]
  diagnostics: NavorDiagnostic[]
}

export interface PortfolioOptions {
  baseCurrency: string | null
  timezone: string | null
  fxRates: Record<string, number>
}

export interface DashboardView {
  capital: AllocationResult['capital']
  cash: PortfolioCash[]
  accounts: AllocationAccount[]
  assets: AllocationAsset[]
  accountExecutions: DashboardAccountExecution[]
  assetExecutions: DashboardAssetExecution[]
  actionInbox: DashboardActionItem[]
  holdings: PortfolioHolding[]
  pendingReviews: Array<{
    subject: string
    title: string | null
    reviewBy: string
  }>
  watchlist: WatchlistView[]
  recentTransactions: Array<{
    date: string
    subject: string
    title: string | null
  }>
  diagnostics: NavorDiagnostic[]
}

export interface DashboardAccountExecution {
  subject: string
  title: string | null
  target: number | null
  targetAmount: MoneyAmount | null
  investedCost: MoneyAmount[]
  investedPercent: number | null
  remainingBudget: MoneyAmount | null
  marketValue: MoneyAmount[]
  drift: number | null
}

export interface DashboardAssetExecution {
  subject: string
  title: string | null
  account: string | null
  target: number | null
  targetAmount: MoneyAmount | null
  investedCost: MoneyAmount | null
  investedPercent: number | null
  remainingBudget: MoneyAmount | null
  marketValue: MoneyAmount | null
  drift: number | null
  status:
    | 'not_started'
    | 'building'
    | 'complete'
    | 'over_invested'
    | 'above_max'
    | 'below_min'
    | 'currency_mismatch'
  holding: PortfolioHolding | null
}

export interface DashboardPriceState {
  subject: string
  provider: string | null
  asOf: string | null
  status: 'fresh' | 'stale' | 'missing' | 'failed'
  message?: string
}

export interface DashboardActionItem {
  id: string
  type:
    | 'review_due'
    | 'above_max'
    | 'below_min'
    | 'missing_price'
    | 'stale_price'
    | 'failed_price'
    | 'over_invested'
    | 'currency_mismatch'
  severity: 'high' | 'medium' | 'low'
  category: 'investment_risk' | 'data_integrity' | 'process_due'
  priorityScore: number
  reason: DashboardActionReason
  impactAmount: MoneyAmount | null
  impactPercent: number | null
  subject: string
  title: string | null
  message: string
  action: string
  date: string | null
}

export type DashboardActionReason =
  | { kind: 'review_due'; overdueDays: number; impactPercent: number | null }
  | {
      kind: 'above_max' | 'below_min'
      drift: number | null
      impactPercent: number | null
    }
  | { kind: 'over_invested'; investedExcess: number; impactPercent: number | null }
  | { kind: 'currency_mismatch'; impactPercent: number | null }
  | {
      kind: 'failed_price' | 'missing_price' | 'stale_price'
      impactPercent: number | null
    }

export interface MarketPrice {
  subject: string
  price: MoneyAmount
  provider: string
  asOf: string
}

export interface MarketView {
  research: Array<{
    date: string
    subject: string
    title: string | null
    source: string | null
    tags: string[]
  }>
  prices: Array<MarketPrice & { source: 'external' }>
  portfolioValues: Array<{
    subject: string
    marketValue: MoneyAmount
    cost: MoneyAmount | null
    pnl: MoneyAmount | null
  }>
}

export interface NavorWorkspace {
  source: string
  ast: NavorAst
  diagnostics: NavorDiagnostic[]
  files: string[]
  config: NavorWorkspaceConfig
}

export interface NavorWorkspaceConfig {
  stalePriceAfterDays?: number
  baseCurrency?: string
  symbolMap?: Record<string, string>
  staticPrices?: Record<string, { amount: number; currency: string; asOf?: string }>
  fxRates?: Record<string, number>
}

export interface NavorPosting {
  account: string
  quantity: number
  commodity: string
  price: MoneyAmount | null
}
