export type ReaderLocale = 'en' | 'zh-CN'

const chinese = {
  Command: '指挥台',
  Overview: '总览',
  Drift: '偏离',
  Watchlist: '观察列表',
  Portfolio: '投资组合',
  Holdings: '持仓',
  Allocation: '配置',
  Accounts: '账户',
  Ledger: '账本',
  'Investment process': '投资流程',
  Research: '研究',
  Thesis: '投资论点',
  Decisions: '决策',
  Decision: '决策',
  Reviews: '复盘',
  Journal: '投资日志',
  Controls: '控制台',
  Policy: '策略',
  'Market data': '市场数据',
  Workspace: '工作区',
  Diagnostics: '诊断',
  'Investment ledger': '投资账本',
  'Facts first. Policy always.': '事实优先，策略始终如一。',
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
  Filters: '筛选',
  'Refine workspace': '筛选工作区',
  'Filters apply to the current view.': '筛选条件仅应用于当前视图。',
  'Clear all': '清除全部',
  Subject: '对象',
  Tag: '标签',
  Date: '日期',
  record: '条记录',
  records: '条记录',
  matching: '匹配',
  'in this view': '位于当前视图中',
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
  'Prices as of': '价格截至',
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
  'Portfolio posture, policy exceptions, and the next decisions to make.':
    '投资组合状态、策略例外以及下一步需要作出的决策。',
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
  'Policy breaches': '策略偏离',
  'Positions outside policy': '持仓超出策略范围',
  'All positions in policy': '所有持仓均符合策略',
  'Open actions': '待处理事项',
  'Review queue': '待复核队列',
  'Nothing requires action': '暂无需处理事项',
  'Allocation posture': '配置状态',
  'Capital sleeves and current funding progress.': '资金分组及当前建仓进度。',
  'Funding progress': '建仓进度',
  sleeves: '个资金分组',
  'Recent activity': '近期活动',
  'Most recent capital movements in the ledger.': '账本中最近的资金变动。',
  'No transactions recorded.': '暂无交易记录。',
  Transaction: '交易',
  'Decision queue': '决策队列',
  'Ranked by risk severity, portfolio exposure, and urgency.':
    '按风险严重程度、投资组合敞口和紧急程度排序。',
  'Portfolio controls are clear.': '投资组合状态正常。',
  'more actions': '项待处理事项',
  'Review allocation drift': '查看配置偏离',
  'Check prices': '检查价格',
  Liquidity: '流动性',
  'Cash and PnL that affect deployable capital.': '影响可部署资金的现金和盈亏。',
  'Cash by currency': '按币种列示现金',
  'No cash balances.': '暂无现金余额。',
  'Converted through': '通过以下本位币换算：',
  'FX required for a base total.': '汇总本位币金额需要汇率。',
  'PnL by currency': '按币种列示盈亏',
  'Base currency:': '本位币：',
  'Latest updates': '最新动态',
  'Evidence, theses, and decisions that may change posture.':
    '可能改变投资立场的证据、论点和决策。',
  'No knowledge events yet.': '暂无研究动态。',
  'Investment risk': '投资风险',
  'Data integrity': '数据完整性',
  'Process due': '流程待办',
  High: '高',
  Medium: '中',
  Low: '低',
  'No amounts recorded.': '暂无金额记录。',
  'No timeline items.': '暂无时间线记录。',
  'No rows to display.': '暂无可显示的记录。',
  'Positions, cash, cost, and PnL.': '持仓、现金、成本与盈亏。',
  'All portfolio activity.': '全部投资组合活动。',
  'Candidates before allocation.': '配置前的候选标的。',
  'Capital sleeves and funding progress.': '资金分组和建仓进度。',
  'Policy structure: account sleeves and how asset targets resolve into portfolio weight.':
    '策略结构：账户分组及资产目标如何换算为组合权重。',
  'Beliefs, confidence, and invalidation rules.': '投资信念、置信度和失效规则。',
  'Committed actions and their basis.': '已确认的操作及其依据。',
  'Scheduled checks and follow-up actions.': '计划内检查与后续操作。',
  'Process notes and decision context.': '流程记录和决策上下文。',
  'Price coverage, freshness, and valuation inputs.': '价格覆盖率、时效性和估值输入。',
  'Source files behind this reader.': '此阅读器使用的源文件。',
  'Warnings that affect data trust and decision quality.': '影响数据可信度和决策质量的警告。',
  'Targets, bands, and rebalance actions.': '目标、区间与再平衡操作。',
  'Sorted by distance from target. Bars grow from center: right is overweight, left is underweight.':
    '按与目标的偏离程度排序。柱形从中心延伸：右侧表示超配，左侧表示低配。',
  'Market mix': '市场分布',
  Positions: '持仓明细',
  'Realized PnL': '已实现盈亏',
  Cash: '现金',
  Income: '收入',
  Expenses: '支出',
  Candidates: '候选标的',
  Evidence: '证据',
  Timeline: '时间线',
  Theses: '投资论点',
  'Research quality': '研究质量',
  'Decision ledger': '决策账本',
  'Investment theses': '投资论点',
  Bands: '区间',
  Rules: '规则',
  'Plan diagnostics': '策略诊断',
  'Distance from target': '与目标的偏离',
  'Drift diagnostics': '偏离诊断',
  'All diagnostics': '全部诊断',
  'Source files': '源文件',
  'Price coverage': '价格覆盖',
  'Portfolio valuation': '投资组合估值',
  'Market research': '市场研究',
  'Account policy': '账户策略',
  'Asset policy': '资产策略',
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
  'No drift entries match the current filters.': '没有符合当前筛选条件的偏离记录。',
  'No watchlist items match the current filters.': '没有符合当前筛选条件的观察列表项目。',
  'No decisions match the current filters.': '没有符合当前筛选条件的决策。',
  'No theses match the current filters.': '没有符合当前筛选条件的投资论点。',
  'No reviews match the current filters.': '没有符合当前筛选条件的复盘。',
  'No journal entries match the current filters.': '没有符合当前筛选条件的投资日志。',
  'No research notes match the current filters.': '没有符合当前筛选条件的研究笔记。',
  'No realized gains or losses recorded yet.': '暂无已实现盈亏记录。',
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
  'Above policy band': '高于策略区间',
  'Below policy band': '低于策略区间',
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
  'missing ': '缺少 ',
  Exposure: '敞口',
  'One working table for quantity, cost, market value, and PnL. Losses appear first.':
    '用于查看数量、成本、市值和盈亏的统一表格，亏损项优先显示。',
  'Portfolio total, converted to': '投资组合总额，已换算为',
  'Position grouping': '持仓分组',
  'No flows recorded.': '暂无资金流记录。',
  Unassigned: '未分配',
  All: '全部',
  'By account': '按账户',
  positions: '个持仓',
  'Decision brief': '决策摘要',
  'Collapse decision brief': '收起决策摘要',
  'Open workspace': '打开工作区',
  'Account weight': '账户权重',
  'Investment context': '投资背景',
  'No position exists yet. The full target remains available for the first transaction.':
    '尚未建立持仓，全部目标金额可用于首次交易。',
  'No research, thesis, or decision is linked to this asset yet.':
    '此资产尚未关联研究、投资论点或决策。',
  linked: '项关联',
  'Review deadline': '复核截止日',
  'No transaction has been recorded against this target.': '该目标尚未记录交易。',
  'The position is funded but remains below its target amount.':
    '该持仓已投入资金，但仍低于目标金额。',
  'The position is aligned with its target amount.': '该持仓的投入金额符合目标。',
  'Invested cost exceeds the configured target amount.': '投入成本超过已配置的目标金额。',
  'Current portfolio weight is above the policy range.': '当前组合权重高于策略区间。',
  'Current portfolio weight is below the policy range.': '当前组合权重低于策略区间。',
  'Target and invested cost use different currencies, so funding progress is not comparable.':
    '目标金额和投入成本使用不同货币，无法比较建仓进度。',
  'Directory tree under the workspace root.': '工作区根目录下的目录树。',
  'Evidence, thesis, and committed decisions.': '证据、投资论点和已确认决策。',
  'Market value against carrying cost, using the covered prices above.':
    '基于上述覆盖价格对比市值与账面成本。',
  'One row per asset, combining the valuation input with its freshness and source.':
    '每项资产一行，展示估值输入、时效和数据源。',
  'Recent evidence that may change assumptions, sizing, or timing.':
    '可能改变假设、仓位或时机的最新证据。',
  'Scan the economic event first, then open a row only when you need its double-entry detail.':
    '先浏览经济事件，仅在需要时打开行查看复式记账明细。',
  'Strategic mix across accounts. Asset-level distance from target lives on Drift.':
    '跨账户的战略配置，资产层面的目标偏离见“偏离”页面。',
  'Account-scoped target × sleeve weight = portfolio weight. Amounts are the resolved capital targets.':
    '账户目标 × 资金分组权重 = 组合权重，金额为解析后的资金目标。',
  'No records match the current filters.': '没有符合当前筛选条件的记录。',
  'No rule': '无规则',
  'No sleeve target': '无资金分组目标',
  'No policy, execution, or data issue needs attention.': '暂无需要关注的策略、执行或数据问题。',
  'Converted via FX': '已通过汇率换算',
  'Portfolio weight': '组合权重',
  'Target amount': '目标金额',
  'Target capital': '目标资金',
  'Price states': '价格状态',
  'Price checks': '价格检查',
  'Workspace diagnostics': '工作区诊断',
  'With action': '含操作',
  'With bands': '含区间',
  'With basis': '含依据',
  'With reason': '含原因',
  'Review dated': '已设复核日期',
  'Review due': '待复核',
  'Pending thesis reviews': '待复核投资论点',
  'Action types': '操作类型',
  'Affected groups': '受影响分组',
  'Tracked prices': '已跟踪价格',
  'Portfolio values': '组合估值',
  'Rebalance styles': '再平衡方式',
  'Income and fees': '收入与费用',
  'Related notes': '关联笔记',
  Visible: '可见',
  Active: '活跃',
  'Active theses': '活跃投资论点',
  Moods: '情绪',
  Entries: '条目',
  Warnings: '警告',
  Sources: '来源',
  Notes: '笔记',
  Assets: '资产',
  Budget: '预算',
  Transactions: '交易记录',
  Buys: '买入',
  Sells: '卖出',
  'No assets in this account.': '此账户没有资产。',
  'No plan directives match the current filters.': '没有符合当前筛选条件的策略指令。',
  'No research context yet.': '暂无研究上下文。',
  'No price records match the current filters.': '没有符合当前筛选条件的价格记录。',
  'No reason recorded': '未记录原因',
  'No provider': '无数据源',
  'No FX rates configured': '未配置汇率',
  'Actual weight': '实际权重',
  'Asset workspace': '资产工作区',
  'Close asset workspace': '关闭资产工作区',
  'Asset workspace views': '资产工作区视图',
  'Account allocation': '账户内配置',
  'Market snapshot': '市场快照',
  'Price status': '价格状态',
  'Data source': '数据源',
  'Price as of': '报价时间',
  'Price unavailable. Market value falls back to cost basis.': '暂无可用报价，市值将以成本价估算。',
  stale: '陈旧',
  missing: '缺失',
  failed: '失败',
  'Action below band': '低于区间时操作',
  'Action above band': '高于区间时操作',
  'Recent transactions': '近期交易',
  'No transactions are recorded for this asset.': '该资产暂无交易记录。',
  'Not available': '暂无',
  'No account assigned': '未分配账户',
  'No funded position or execution target yet.': '尚未建立持仓或执行目标。',
  'No funded position is recorded for this asset.': '该资产尚无持仓记录。',
  'Execution target only. No portfolio band is linked to this asset.':
    '仅有执行目标，此资产未关联投资组合区间。',
  'No research, thesis, or decision is linked yet.': '尚未关联研究、投资论点或决策。',
  'Asset tracking': '资产跟踪信息',
  Tracked: '已跟踪',
  Band: '区间',
  Rebalance: '再平衡',
  Price: '价格',
  Cost: '成本',
  Value: '价值',
  'Value (base)': '价值（本位币）',
  Root: '根目录',
  line: '行',
  Sleeve: '资金分组',
  'Navor Reader': 'Navor 阅读器',
  'Account target': '账户目标',
  'Base currency': '本位币',
  'Off band': '超出区间',
  'Needs attention': '需要关注',
  Trigger: '触发条件',
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
      return `持仓${reason.kind === 'above_max' ? '高于' : '低于'}策略区间${reason.drift === null ? '' : ` ${Math.abs(reason.drift).toFixed(1)} 个百分点`}${exposureText}。`
    return `Position is ${reason.kind === 'above_max' ? 'above' : 'below'} its policy range${reason.drift === null ? '' : ` by ${Math.abs(reason.drift).toFixed(1)} percentage points`}${exposureText}.`
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
  if (urgentCount > 0 && dataCount > 0) return `${urgentCount} high · ${dataCount} data`
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
  return locale === 'zh-CN' ? `共 ${count} 个持仓` : `of ${count} positions`
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
  return locale === 'zh-CN' ? `目标 ${value}` : `of ${value}`
}

export function formatMarketAmount(value: string, locale = readerLocale) {
  return locale === 'zh-CN' ? `市值 ${value}` : `Market ${value}`
}

export function formatAssetDisclosure(expanded: boolean, asset: string, locale = readerLocale) {
  if (locale === 'zh-CN') return `${expanded ? '收起' : '展开'} ${asset}`
  return `${expanded ? 'Collapse' : 'Expand'} ${asset}`
}

export function formatDecisionBriefLabel(asset: string, locale = readerLocale) {
  return locale === 'zh-CN' ? `${asset} 的决策摘要` : `Decision brief for ${asset}`
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
