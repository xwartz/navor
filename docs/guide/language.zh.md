# Navor 语言参考

版本 0.1。当前 parser 接受的语法，以及当前 engine 的语义校验。日常记账模式见[记账指南](../cookbook/booking.zh.md)。

## 范围

Navor 是声明式、追加式的投资事实语言，记录资金、账户、标的、研究、观点、决策、交易、复盘和日志。不下单、不自动交易、不替代会计或税务记录，也不提供投资建议。

文本形态参考 Beancount：带日期的记录、缩进元数据与 posting、整行 `;` 注释。Navor 不兼容 Beancount 的语法或语义。

## 文件与工作区

Navor 源文件使用 `.nav` 扩展名。工作区是一个包含 `.nav` 文件的目录树。文件路径只用于组织，语义由日期、指令、subject、元数据和 posting 决定。

```text
portfolio/
  portfolio.nav
  accounts/us.nav
  assets/nvda.nav
  activity/2026.nav
```

空行和首字符为 `;` 的行会被忽略。

## 记录形式

每条指令包含日期、指令名、subject 和可选的带引号标题。

```nav
YYYY-MM-DD DIRECTIVE SUBJECT "Title"
  key: value
  Account:Path  quantity COMMODITY @ price CURRENCY
  ---
  Markdown body
  ---
```

- 日期格式为 `YYYY-MM-DD`。
- 指令和 subject 必填，标题可选，标题中不能包含双引号。
- 元数据、posting 和正文分隔符必须以两个空格开始。
- 元数据键匹配 `[A-Za-z_][A-Za-z0-9_]*`，值不能为空。
- 正文可选，开始和结束分隔符均为 `  ---`，每行正文以两个空格缩进。

parser 会将元数据值保留为字符串，具体含义由 engine 和 Reader 解释。

## Subject

subject 是稳定的、以冒号分隔的标识符。除本文说明的语义外，Navor 不规定固定分类法。

```text
Portfolio:Core
Account:US
Asset:Equity:US:NVDA
Market:Crypto
```

标识符应保持稳定。Asset 是研究、计划和标的级交易的对象。Account 是顶层配置单元或现金边界。Asset 的 `account` 元数据指定其所属 Account。

## 指令

Navor 0.1 识别 12 个指令。

| 指令 | 用途 | 常用元数据 |
| --- | --- | --- |
| `option` | 工作区级设置 | `base_currency`、`timezone`、`fx_rates` |
| `capital` | 可投资资金预算 | `amount` |
| `open` | 开始管理一个 subject | `account`、`target`、`symbol`、`status` |
| `close` | 结束管理，但不删除历史 | `reason` |
| `plan` | 目标区间和再平衡政策 | `target`、`min`、`max`、`rebalance` |
| `research` | 外部观察和资料 | `source`、`reliability`、`tags` |
| `thesis` | 可证伪的投资观点 | `horizon`、`confidence`、`invalid_if`、`review_by` |
| `decision` | 拟执行动作 | `action`、`target_weight`、`trigger`、`based_on` |
| `txn` | 已执行交易或现金事件 | posting、`decision`、`reason` |
| `review` | 定期或事件驱动的评估 | `status`、`action` |
| `journal` | 过程和行为记录 | `mood`、`related` |
| `note` | 其他带日期的笔记 | 正文或元数据 |

### 资金、账户与标的

```nav
2026-01-01 capital Portfolio:Core "初始资金"
  amount: 100,000 USD

2026-01-01 open Account:US "美股"
  target: 60%

2026-01-02 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US
  symbol: NVDA
  target: 15%
```

`capital` 记录计划资金，不必等于券商现金余额。Account 的 `target` 是全组合中的账户目标。Asset 的 `target` 是其所属 Account 内的目标。engine 可以由二者派生 Asset 的全组合权重。

### 研究、观点、决策与复盘

```nav
2026-01-10 research Asset:Equity:US:NVDA "数据中心需求"
  source: Company earnings
  reliability: Primary
  tags: AI,DataCenter
  ---
  管理层维持了数据中心业务指引。
  ---

2026-01-12 thesis Asset:Equity:US:NVDA "算力需求仍然稳固"
  horizon: 3y
  confidence: Medium
  invalid_if: 数据中心收入连续两个季度下降
  review_by: 2026-04-30

2026-01-13 decision Asset:Equity:US:NVDA "建立仓位"
  action: Buy
  target_weight: 15%
  based_on: Asset:Equity:US:NVDA
```

`research` 记录观察到的信息。`thesis` 陈述可被证伪的观点。`decision` 记录意图，只有在 `txn` 被记录后才成为已执行事实。`review` 记录后续对 Asset、Account 或 Portfolio 的评估。

### 交易与 posting

`txn` 记录已发生的经济事件。每条 posting 的格式如下：

```text
ACCOUNT_PATH QUANTITY COMMODITY [@ PRICE CURRENCY]
```

```nav
2026-02-01 txn Asset:Equity:US:NVDA "首次买入"
  Assets:Equity:US:NVDA  10 NVDA @ 900 USD
  Assets:Cash:USD       -9,000 USD
  Expenses:Fee              1 USD
```

engine 在组合视图中识别 `Assets:`、`Income:` 和 `Expenses:` posting。对于 Asset 交易，持仓 posting 通常将 `Assets:Equity:US:NVDA` 映射至 `Asset:Equity:US:NVDA`。仅涉及现金的 Asset 事件可以只包含 `Assets:Cash:`、`Income:` 和 `Expenses:` posting。Account 交易用于注资、取款和其他现金事件，不得包含标的持仓 posting。

`Asset:` 是 Navor subject，`Assets:` 是 posting 账户路径。单数与复数形式承担不同职责。

当前 parser 只校验 posting 的语法，不校验复式记账平衡或商品单位一致性。

### 正文、注释与历史

正文以 Markdown 原样保存，不作解释。

```nav
; 注释独占一行。
2026-04-30 review Asset:Equity:US:NVDA "季度复盘"
  status: On Track
  action: Hold
  ---
  失效条件尚未出现。
  ---
```

观点、计划或决策发生变化时，应新增指令。不要为了让当前状态更整洁而改写历史指令。

## 语义校验

解析阶段会报告指令、元数据、posting、缩进和正文分隔符格式错误。语义 engine 还会在以下情况报告诊断：

- Asset 指向未 `open` 的 Account；
- `plan` 引用未知 Account 或 Asset；
- `txn` 的 subject 不是已 `open` 的 Asset 或 Account；
- Account 交易包含标的持仓 posting；
- Asset 交易没有对应的持仓 posting，除非只涉及现金、收入或费用；
- 标的级 `decision` 尚无该 Asset 的交易。

诊断不会阻止工作区被读取，只提示需要复核的事实。

## 派生数据与数据增强

源文件保存用户确认的事实。持仓、现金、成本、市场价值、配置、盈亏、偏离度和 Reader 视图均为派生结果。价格和汇率是可选增强数据，提供方缺失或数据过期不是源事实，也不得导致工作区不可读。

公开接口与兼容性见[核心概念](concepts.zh.md)；实用写法见[记账指南](../cookbook/booking.zh.md)；部署价格代理前阅读[行情数据与隐私](../operations/market-data-and-privacy.zh.md)。
