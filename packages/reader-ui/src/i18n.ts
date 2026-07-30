export type ReaderLocale = 'en' | 'zh-CN'

const chinese = {
  Monitor: '工作台',
  Briefing: '投资简报',
  Drift: '偏离',
  Actions: '行动中心',
  Watchlist: '观察列表',
  Portfolio: '投资组合',
  Holdings: '持仓',
  Allocation: '配置',
  Accounts: '账户',
  Ledger: '账本',
  'Investment process': '投资流程',
  Operations: '运行与数据',
  Research: '研究',
  'Investment cases': '投资案例',
  Cases: '案例总览',
  'Market evidence': '市场证据',
  'Asset evidence': '标的证据',
  'Market-level evidence stays separate from an individual asset case, so the case index remains decision-ready.':
    '市场层面的证据独立于单一资产案例，以保持案例索引可直接用于决策。',
  'No market evidence matches the current filters.': '没有符合当前筛选条件的市场证据。',
  'Evidence linked directly to an investment subject.': '与具体投资对象直接关联的研究证据。',
  'Case index': '案例清单',
  'One row per investment subject, connecting evidence, thesis, decisions, plans, and review dates.':
    '每个投资对象一行，连接证据、论点、决策、计划与复核日期。',
  'No investment cases match the current filters.': '没有符合当前筛选条件的投资案例。',
  'No asset evidence matches the current filters.': '没有符合当前筛选条件的标的证据。',
  'Latest thesis': '最新论点',
  'Latest decision': '最新决策',
  'Current plan': '当前计划',
  'Investment case views': '投资案例视图',
  Thesis: '投资论点',
  Decisions: '决策',
  Decision: '决策',
  Reviews: '复盘',
  Journal: '投资日志',
  Plan: '计划',
  'Execution plans': '执行计划',
  'Active plans': '生效计划',
  'With actions': '含动作',
  'Targets, limits, and the action each boundary triggers.': '目标、边界及其触发动作。',
  'Portfolio workspace': '组合工作台',
  'Plan date': '计划日期',
  'Account allocation boundaries': '账户配置范围',
  'Asset plans': '资产计划',
  'Portfolio-level boundaries for each account sleeve.': '每个账户资金分组的组合级配置边界。',
  'Asset-specific actions and their revision history.': '资产越界动作及修订历史。',
  'Target allocation': '目标配置',
  'Allowed range': '允许范围',
  Below: '低于',
  Above: '高于',
  to: '至',
  'Show history': '查看历史',
  'Hide history': '收起历史',
  revision: '个修订版本',
  Diagnostics: '诊断',
  'Data health': '数据健康',
  Issues: '问题',
  'Market coverage': '行情覆盖',
  'Input quality and source facts behind this reader. Investment and review actions stay in Actions.':
    '阅读器背后的输入质量与源事实。投资和复核事项保留在行动中心。',
  'One row per valuation input. A non-fresh quote is an input-quality issue, not a portfolio fact.':
    '每项估值输入一行。非最新报价属于输入质量问题，并非投资组合事实。',
  'Data issues': '数据问题',
  'Resolve the source fact before it changes a decision or valuation.':
    '先修复源事实，再处理受影响的决策或估值。',
  'No health issues need attention.': '暂无需要处理的数据健康问题。',
  'Investment ledger': '投资账本',
  'Advance each candidate to its next decision.': '推动每个候选标的进入下一步决策。',
  'The next missing step keeps research work moving without mixing it into the action queue.':
    '显示缺失的下一步，避免将研究工作混入行动队列。',
  'Resolve the next scheduled check and record its follow-up.':
    '完成下一项定期检查，并记录后续动作。',
  'Status and follow-up stay beside the recorded review.': '状态和后续动作与复盘记录保持在一起。',
  'Record the reasoning and behaviour behind a decision.': '记录决策背后的推理与行为。',
  'Read chronologically, then filter by asset, directive, or mood.':
    '按时间阅读，再按资产、指令或心态筛选。',
  'Ranked work that can change risk, process quality, or data confidence.':
    '按风险、流程质量和数据可信度排序的待办。',
  'Open an item for its evidence, position context, and next action.':
    '打开事项以查看证据、持仓背景和下一步。',
  'Next actions': '下一步行动',
  'Evidence and decisions': '证据与决策',
  'One evidence trail from research to a recorded decision.': '从研究到已记录决策的一条证据链。',
  'Facts first. Plans explicit.': '事实优先，计划明确。',
  'A human-first language for long-term investing.': '为长期投资而设计的、以人为本的语言。',
  'Describe capital, accounts, assets, research, thesis, decisions, transactions, and reviews in plain text, then read them here as a portfolio ledger.':
    '用纯文本描述资金、账户、资产、研究、投资论点、决策、交易和复盘，再在这里将它们读作投资组合账本。',
  'Skip to content': '跳至内容',
  'current view': '当前视图',
  'Open navigation': '打开导航',
  'Close navigation': '关闭导航',
  'Expand navigation': '展开导航',
  'Collapse navigation': '收起导航',
  'Reader views': '阅读器视图',
  'Search workspace': '搜索工作区',
  Type: '类型',
  'This view': '当前视图',
  'Entire workspace': '整个工作区',
  'Search this view': '搜索当前视图',
  Columns: '列',
  'Table options': '表格选项',
  'Compact rows': '紧凑行高',
  'Comfortable rows': '标准行高',
  'Clear filters': '清除筛选',
  Subject: '对象',
  Tag: '标签',
  Date: '日期',
  records: '条记录',
  matching: '匹配',
  'Price refresh failed:': '价格刷新失败：',
  'Loading live market prices…': '正在加载实时市场价格…',
  'Live prices unavailable. Views use cost basis until a price proxy is configured.':
    '实时价格不可用。在配置价格代理前，视图将使用成本价。',
  'No market symbols tracked in this workspace.': '此工作区未跟踪任何市场代码。',
  'Refreshing…': '正在刷新…',
  'Refresh prices': '刷新价格',
  'Workspace valuation status': '工作区估值状态',
  Valuation: '估值',
  Coverage: '覆盖率',
  Base: '本位币',
  'Prices as of': '报价时间',
  'Refreshing prices': '正在刷新价格',
  'Live market value': '实时市值',
  'Cost basis': '成本价',
  'Ledger only': '仅账本',
  fresh: '最新',
  tracked: '已跟踪',
  'proxy off': '代理已关闭',
  'No timestamp': '无时间戳',
  'On track': '符合目标',
  'Below min': '低于下限',
  'Above max': '高于上限',
  Unknown: '未知',
  'Portfolio posture, target-range exceptions, and the next decisions to make.':
    '投资组合状态、目标区间例外以及下一步需要作出的决策。',
  'Largest positions': '最大头寸',
  'Largest marked positions, with the current allocation distance kept visible.':
    '按已标记市值排序的最大头寸，并同时显示当前配置偏离。',
  'Portfolio value': '投资组合价值',
  'Holdings market value': '持仓市值',
  'Invested capital': '已投入资金',
  'Holdings + cash, converted to': '持仓加现金，已换算为',
  'Holdings only, base': '仅持仓，本位币',
  'Holdings only': '仅持仓',
  'Converted to': '已换算为',
  'currencies, not converted': '种货币，未换算',
  target: '目标',
  'Awaiting live prices': '等待实时价格',
  'Cost basis until live prices load': '实时价格加载前使用成本价',
  'Total PnL': '总盈亏',
  'Target-range breaches': '目标区间偏离',
  'Positions outside target range': '持仓超出目标区间',
  'All positions within target range': '所有持仓均在目标区间内',
  'Open actions': '待处理事项',
  'Decision basis': '判断依据',
  'Position details': '持仓明细',
  'Price updated': '价格更新于',
  'Plan target': '计划目标',
  'Plan band': '计划区间',
  'Review queue': '待复核队列',
  'Nothing requires action': '暂无需处理事项',
  'Allocation posture': '配置状态',
  'Capital sleeves and current funding progress.': '资金分组及当前建仓进度。',
  'Funding progress': '建仓进度',
  sleeves: '个资金分组',
  Transaction: '交易',
  'Decision queue': '决策队列',
  'Ranked by risk severity, portfolio exposure, and urgency.':
    '按风险严重程度、投资组合敞口和紧急程度排序。',
  'more actions': '项待处理事项',
  Liquidity: '流动性',
  'Cash and PnL that affect deployable capital.': '影响可部署资金的现金和盈亏。',
  'Cash by currency': '按币种列示现金',
  'No cash balances.': '暂无现金余额。',
  'Converted through': '通过以下本位币换算：',
  'FX required for a base total.': '汇总本位币金额需要汇率。',
  'PnL by currency': '按币种列示盈亏',
  'Base currency:': '本位币：',
  'Investment risk': '投资风险',
  'Data integrity': '数据完整性',
  'Process due': '流程待办',
  High: '高',
  Medium: '中',
  Low: '低',
  'No amounts recorded.': '暂无金额记录。',
  'No timeline items.': '暂无时间线记录。',
  'No rows to display.': '暂无可显示的记录。',
  'Capital sleeves and funding progress.': '资金分组和建仓进度。',
  'All portfolio activity.': '全部投资组合活动。',
  'Target structure: account sleeves and how asset targets resolve into portfolio weight.':
    '目标结构：账户分组及资产目标如何换算为组合权重。',
  'Action center': '行动中心',
  'Allocation risk': '配置风险',
  'No actions match the current filters.': '没有符合当前筛选条件的待处理事项。',
  'Market mix': '市场分布',
  Positions: '持仓明细',
  'Realized PnL': '已实现盈亏',
  Cash: '现金',
  Income: '收入',
  Expenses: '支出',
  Candidates: '候选标的',
  Evidence: '证据',
  Theses: '投资论点',
  'Decision ledger': '决策账本',
  'Plan diagnostics': '计划诊断',
  'Source files': '源文件',
  'Account targets': '账户目标',
  'Asset targets': '资产目标',
  'Allocation diagnostics': '配置诊断',
  'Transaction history': '交易记录',
  Account: '账户',
  Asset: '资产',
  Target: '目标',
  Capital: '资金',
  Funding: '建仓',
  Position: '持仓',
  'To deploy': '待部署',
  'Next step': '下一步',
  Weight: '权重',
  Actual: '实际',
  'Market value': '市值',
  Amount: '金额',
  Currency: '货币',
  Quantity: '数量',
  Market: '市场',
  PnL: '盈亏',
  Action: '操作',
  Confidence: '置信度',
  Status: '状态',
  Provider: '数据源',
  'As of': '截至',
  Reason: '原因',
  'Based on': '依据',
  'No holdings match the current filters.': '没有符合当前筛选条件的持仓。',
  'No assets match the current filters.': '没有符合当前筛选条件的资产。',
  'No watchlist items match the current filters.': '没有符合当前筛选条件的观察列表项目。',
  'No decisions match the current filters.': '没有符合当前筛选条件的决策。',
  'No theses match the current filters.': '没有符合当前筛选条件的投资论点。',
  'No reviews match the current filters.': '没有符合当前筛选条件的复盘。',
  'No journal entries match the current filters.': '没有符合当前筛选条件的投资日志。',
  'No realized gains or losses recorded yet.': '暂无已实现盈亏记录。',
  'Closed-position gains and losses, kept with the economic ledger rather than current holdings.':
    '已平仓盈亏归入经济账本，而不是当前持仓。',
  'Cash & flows': '现金与资金流',
  'No chart data.': '暂无图表数据。',
  'No exposure data.': '暂无敞口数据。',
  'No allocation data.': '暂无配置数据。',
  'No accounts.': '暂无账户。',
  'No assets assigned.': '暂无分配资产。',
  'No diagnostics.': '暂无诊断信息。',
  'No source files in this workspace.': '此工作区没有源文件。',
  'No matches': '没有匹配项',
  'Search results': '搜索结果',
  'Not funded': '尚未建仓',
  'No position': '无持仓',
  'No transaction yet': '暂无交易',
  'Currency mismatch': '货币不匹配',
  'Over target': '超过目标',
  'Above target range': '高于目标区间',
  'Below target range': '低于目标区间',
  'Target reached': '已达目标',
  'Still building': '持续建仓',
  Start: '开始',
  Build: '建仓',
  Hold: '持有',
  Review: '复核',
  Trim: '减仓',
  Add: '加仓',
  'Check FX': '检查汇率',
  Invested: '已投入',
  left: '剩余',
  'FX mismatch': '汇率不匹配',
  'Not measurable': '无法衡量',
  'Realized + unrealized, base converted': '已实现加未实现盈亏，已换算为本位币',
  'Realized + unrealized': '已实现加未实现盈亏',
  'unconverted currency': '种未换算货币',
  'unconverted currencies': '种未换算货币',
  Exposure: '敞口',
  'One working table for quantity, cost, market value, and PnL. Losses appear first.':
    '用于查看数量、成本、市值和盈亏的统一表格，亏损项优先显示。',
  'Current positions, cost, market value, and unrealized PnL.':
    '当前持仓、成本、市值和未实现盈亏。',
  'Position grouping': '持仓分组',
  'No flows recorded.': '暂无资金流记录。',
  Unassigned: '未分配',
  All: '全部',
  'By account': '按账户',
  positions: '个持仓',
  'No transaction has been recorded against this target.': '该目标尚未记录交易。',
  'The position is funded but remains below its target amount.':
    '该持仓已投入资金，但仍低于目标金额。',
  'The position is aligned with its target amount.': '该持仓的投入金额符合目标。',
  'Invested cost exceeds the configured target amount.': '投入成本超过已配置的目标金额。',
  'Current portfolio weight is above the target range.': '当前组合权重高于目标区间。',
  'Current portfolio weight is below the target range.': '当前组合权重低于目标区间。',
  'Target and invested cost use different currencies, so funding progress is not comparable.':
    '目标金额和投入成本使用不同货币，无法比较建仓进度。',
  'Directory tree under the workspace root.': '工作区根目录下的目录树。',
  'Scan the economic event first, then open a row only when you need its double-entry detail.':
    '先浏览经济事件，仅在需要时打开行查看复式记账明细。',
  'Strategic mix across accounts. Asset-level distance from target lives on Drift.':
    '跨账户的战略配置，资产层面的目标偏离见“偏离”页面。',
  'Account-scoped target × sleeve weight = portfolio weight. Amounts are the resolved capital targets.':
    '账户目标 × 资金分组权重 = 组合权重，金额为解析后的资金目标。',
  'No records match the current filters.': '没有符合当前筛选条件的记录。',
  'No rule': '无规则',
  'No sleeve target': '无资金分组目标',
  'No target, execution, or data issue needs attention.': '暂无需要关注的目标、执行或数据问题。',
  'Portfolio weight': '组合权重',
  'Target amount': '目标金额',
  'Target capital': '目标资金',
  'Funded assets': '已建仓资产',
  'Multiple currencies': '多币种',
  'Review due': '待复核',
  'Tracked prices': '已跟踪价格',
  'Income and fees': '收入与费用',
  Active: '活跃',
  Entries: '条目',
  Assets: '资产',
  Transactions: '交易记录',
  Buys: '买入',
  Sells: '卖出',
  'No assets in this account.': '此账户没有资产。',
  'No plans match the current filters.': '没有符合当前筛选条件的计划。',
  'No price records match the current filters.': '没有符合当前筛选条件的价格记录。',
  'No reason recorded': '未记录原因',
  'Next required': '下一项要求',
  'Capture evidence': '记录证据',
  'Form thesis': '形成论点',
  Decide: '作出决策',
  'Review case': '复核案例',
  'No provider': '无数据源',
  'No FX rates configured': '未配置汇率',
  'Actual weight': '实际权重',
  'Asset workspace': '资产工作区',
  'Close asset workspace': '关闭资产工作区',
  stale: '已过期',
  missing: '缺失',
  failed: '失败',
  'Recent transactions': '近期交易',
  'No transactions are recorded for this asset.': '该资产暂无交易记录。',
  'Not available': '暂无',
  'No account assigned': '未分配账户',
  'No funded position or execution target yet.': '尚未建立持仓或执行目标。',
  'Reference needs clarification': '引用有歧义',
  'Reference does not resolve': '引用无法解析',
  'Legacy reference': '旧版引用格式',
  'No decision is linked to this transaction.': '此交易未关联决策。',
  'No research, thesis, or decision is linked yet.': '尚未关联研究、投资论点或决策。',
  'Asset tracking': '资产跟踪信息',
  Tracked: '已跟踪',
  Rebalance: '再平衡',
  Price: '价格',
  'Average cost': '平均成本',
  Cost: '成本',
  line: '行',
  Sleeve: '资金分组',
  'Navor Reader': 'Navor 阅读器',
  'Account target': '账户目标',
  'Needs attention': '需要关注',
  Realized: '已实现',
  Priority: '优先级',
  'Try a broader query or remove one of the subject, tag, or date filters.':
    '请扩大搜索范围，或移除对象、标签或日期筛选条件。',
  'Open view': '打开视图',
  'No transactions match the current filters.': '没有符合当前筛选条件的交易。',
  'Double-entry postings': '复式记账条目',
} as const

export type MessageKey = keyof typeof chinese

export interface ReaderLocalization {
  locale: ReaderLocale
  t(key: MessageKey): string
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string
  formatDashboardActionReason(reason: import('@navor/contract').DashboardActionReason): string
}

export function resolveReaderLocale(languages?: readonly string[]): ReaderLocale {
  const preferred =
    languages ??
    (typeof navigator === 'undefined'
      ? []
      : navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language])
  for (const language of preferred) {
    const normalized = language.toLowerCase()

    if (normalized.startsWith('zh')) return 'zh-CN'
    if (normalized.startsWith('en')) return 'en'
  }

  return 'en'
}

export function createReaderLocalization(
  locale: ReaderLocale = resolveReaderLocale(),
): ReaderLocalization {
  return {
    locale,
    t: (key) => (locale === 'zh-CN' ? chinese[key] : key),
    formatNumber: (value, options) => value.toLocaleString(locale, options),
    formatDashboardActionReason: (reason) => formatDashboardActionReason(reason, locale),
  }
}

export const readerLocalization = createReaderLocalization()
export const readerLocale = readerLocalization.locale

export function t(key: MessageKey, locale = readerLocale): string {
  return locale === readerLocale
    ? readerLocalization.t(key)
    : createReaderLocalization(locale).t(key)
}

/**
 * Translates display text supplied by data or shared component props.
 * New product copy must use `t()` so TypeScript enforces its registration.
 */
export function translateText(text: string, locale = readerLocale): string {
  return text in chinese ? t(text as MessageKey, locale) : text
}

export function formatDashboardActionReason(
  reason: import('@navor/contract').DashboardActionReason,
  locale = readerLocale,
) {
  const exposure = reason.impactPercent
  const exposureText =
    exposure === null
      ? ''
      : locale === 'zh-CN'
        ? `，${reason.kind === 'review_due' || reason.kind === 'currency_mismatch' ? '影响' : '占'}已估值投资组合的 ${exposure.toFixed(1)}%`
        : `, ${reason.kind === 'review_due' ? 'affecting' : 'representing'} ${exposure.toFixed(1)}% of valued portfolio`

  if (reason.kind === 'review_due') {
    if (locale === 'zh-CN')
      return reason.overdueDays > 0
        ? `复核已逾期 ${reason.overdueDays} 天${exposureText}。`
        : `复核已到期${exposureText}。`
    return reason.overdueDays > 0
      ? `Review is ${reason.overdueDays} days overdue${exposureText}.`
      : `Review is due${exposure === null ? '' : ` for ${exposure.toFixed(1)}% of valued portfolio`}.`
  }

  if (reason.kind === 'above_max' || reason.kind === 'below_min') {
    if (locale === 'zh-CN')
      return `持仓${reason.kind === 'above_max' ? '高于' : '低于'}目标区间${reason.drift === null ? '' : ` ${Math.abs(reason.drift).toFixed(1)} 个百分点`}${exposureText}。`
    return `Position is ${reason.kind === 'above_max' ? 'above' : 'below'} its target range${reason.drift === null ? '' : ` by ${Math.abs(reason.drift).toFixed(1)} percentage points`}${exposureText}.`
  }

  if (reason.kind === 'over_invested') {
    if (locale === 'zh-CN')
      return `持仓比资金目标高出 ${reason.investedExcess.toFixed(1)}%${exposureText}。`
    return `Position is ${reason.investedExcess.toFixed(1)}% above its target amount${exposureText}.`
  }

  if (reason.kind === 'currency_mismatch')
    return locale === 'zh-CN'
      ? `货币不匹配，无法比较建仓进度${exposureText}。`
      : `Currency mismatch prevents a comparable assessment of funding progress${exposure === null ? '' : ` for ${exposure.toFixed(1)}% of valued portfolio`}.`

  const price =
    reason.kind === 'failed_price'
      ? locale === 'zh-CN'
        ? '价格刷新失败'
        : 'Price refresh failed'
      : reason.kind === 'missing_price'
        ? locale === 'zh-CN'
          ? '暂无价格'
          : 'No price is available'
        : locale === 'zh-CN'
          ? '价格已过期'
          : 'Price is stale'
  return locale === 'zh-CN'
    ? `${price}${exposureText || '，涉及一项持仓资产'}。`
    : `${price}${exposureText || ' for a held asset'}.`
}

export function formatDashboardActionLabel(
  type: import('@navor/contract').DashboardActionItem['type'],
  locale = readerLocale,
) {
  switch (type) {
    case 'review_due':
    case 'over_invested':
      return t('Review', locale)
    case 'above_max':
      return t('Trim', locale)
    case 'below_min':
      return t('Add', locale)
    case 'currency_mismatch':
      return t('Check FX', locale)
    case 'missing_price':
    case 'stale_price':
    case 'failed_price':
      return t('Price', locale)
  }
}

export function formatSearchResultCount(count: number, locale = readerLocale) {
  return locale === 'zh-CN'
    ? `工作区内共 ${count} 条记录`
    : `${count} ${count === 1 ? 'record' : 'records'} across the workspace`
}

export function formatReviewDeadline(date: string, locale = readerLocale) {
  return locale === 'zh-CN' ? `复核截止日 ${date}` : `Review deadline ${date}`
}

export function formatOpenActionDetail(
  urgentCount: number,
  dataCount: number,
  locale = readerLocale,
) {
  if (locale === 'zh-CN') {
    if (urgentCount > 0 && dataCount > 0)
      return `${urgentCount} 项高优先级 · ${dataCount} 项数据问题`
    if (urgentCount > 0) return `${urgentCount} 项高优先级事项`
    return `${dataCount} 项数据问题`
  }
  if (urgentCount > 0 && dataCount > 0)
    return `${urgentCount} high-priority · ${dataCount} data issues`
  if (urgentCount > 0) return `${urgentCount} high priority`
  return `${dataCount} data ${dataCount === 1 ? 'issue' : 'issues'}`
}

export function formatDashboardActionContext(
  kind: import('@navor/contract').DashboardActionReason['kind'],
  values: { invested?: string; target?: string; drift?: string },
  locale = readerLocale,
) {
  if (kind === 'over_invested' || kind === 'currency_mismatch')
    return locale === 'zh-CN'
      ? `已投入 ${values.invested} · 目标 ${values.target}`
      : `${values.invested} invested · ${values.target} target`
  return locale === 'zh-CN'
    ? `偏离 ${values.drift} · 目标 ${values.target}`
    : `Drift ${values.drift} · target ${values.target}`
}

export function formatPortfolioPositionCount(count: number, locale = readerLocale) {
  return locale === 'zh-CN' ? `共 ${count} 个持仓` : `${count} positions`
}

export function formatUnconvertedCurrencyCount(count: number, locale = readerLocale) {
  return locale === 'zh-CN'
    ? `${count} 种货币未换算`
    : `${count} unconverted ${count === 1 ? 'currency' : 'currencies'}`
}

export function formatCurrencyCount(count: number, locale = readerLocale) {
  return locale === 'zh-CN' ? `${count} 种货币` : `${count} currencies`
}

export function formatFundedPercent(value: string, locale = readerLocale) {
  return locale === 'zh-CN' ? `已建仓 ${value}` : `${value} funded`
}

export function formatTargetAmount(value: string, locale = readerLocale) {
  return locale === 'zh-CN' ? `目标 ${value}` : `Target ${value}`
}

export function formatMarketAmount(value: string, locale = readerLocale) {
  return locale === 'zh-CN' ? `市值 ${value}` : `Market value ${value}`
}

export function formatOpenWorkspaceLabel(asset: string, locale = readerLocale) {
  return locale === 'zh-CN' ? `打开 ${asset} 工作区` : `Open workspace for ${asset}`
}

export function formatAllocationChartLabel(label: string, locale = readerLocale) {
  return locale === 'zh-CN'
    ? `${label} 配置图。悬停或聚焦图例项目以查看详情。`
    : `${label} allocation chart. Hover or focus a legend item to inspect it.`
}

export function formatTransactionCount(count: number, locale = readerLocale) {
  return locale === 'zh-CN' ? `${count} 笔交易` : `${count} transactions`
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return readerLocalization.formatNumber(value, options)
}
