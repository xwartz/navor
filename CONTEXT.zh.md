# Navor 术语

用于文档、实现和界面文案的统一术语。[English](CONTEXT.md)

| 术语 | 含义 |
| --- | --- |
| Navor 文件 | 包含带日期投资事实的纯文本 `.nav` 文件。 |
| 指令 | 一条带日期的记录。Navor 0.1 支持 `option`、`capital`、`open`、`close`、`plan`、`research`、`thesis`、`decision`、`txn`、`review`、`journal` 和 `note`。 |
| Subject | 稳定标识符，例如 `Portfolio:Core`、`Account:US` 或 `Asset:Equity:US:NVDA`。 |
| 元数据 | 附属于单条指令、以 `key: value` 缩进书写的信息，用于承载可扩展语义。 |
| 正文 | 由 `---` 分隔符包围的缩进 Markdown。 |
| Portfolio | 派生的持仓、现金、价值、配置、偏离度和盈亏，是输出而非主要源数据。 |
| Capital | 可投资的计划预算，不必等于券商实时现金。 |
| Account | 顶层配置单元、市场边界、策略边界或现金边界。 |
| Asset | 可被研究、规划和交易的可投资对象。其 `target` 相对所属 Account 而言。 |
| 派生组合权重 | 由 Account 和 Asset 目标权重计算出的 Asset 全组合权重，不应作为第二份源事实保存。 |
| Research | 已记录的观察、来源笔记或数据摘要。 |
| Thesis | 可被证伪的投资观点。 |
| Decision | 拟执行动作。只有记录 `txn` 后才算执行。 |
| Transaction | 以带 posting 的 `txn` 记录的已执行金融事实。Asset 交易涵盖持仓和标的相关现金流，Account 交易涵盖现金事件。 |
| Review | 针对 Asset、Account、Thesis、Decision 或 Portfolio 的定期或事件驱动评估。 |
| Journal | 记录情绪、纪律、错误或反思的主观过程记录。 |
| Engine | 校验事实、派生组合状态、应用数据增强并生成视图的层。 |
| 工作区 | `.nav` 文件目录树和可选的渲染器配置。 |
| Reader | 渲染工作区的本地应用。 |
| 静态站点编译器 | 输出静态 HTML、资源和序列化视图数据的构建路径。 |
| 价格适配器 | 提供可选价格、汇率和市场元数据的集成，其输出不是源事实。 |

## 使用规则

- 顶层配置单元使用 `Account`，不要使用 bucket 或 category。
- Navor 管理的可投资对象使用 `Asset`，不要使用 ticker。
- 只有计算得出的全组合值才使用“派生组合权重”。
- 意图使用 `decision`，已执行事实才使用 `txn`。
- 语义计算使用 `Engine`，文本到 AST 的工作才使用 `parser`。
- 本地应用使用 `Reader`，导出功能使用“静态站点编译器”。
