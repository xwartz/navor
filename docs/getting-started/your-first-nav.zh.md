# 第一个 `.nav` 文件

Navor 文档就是带 `.nav` 后缀的纯文本，每一行要么是空行、注释，要么是一条 **指令**，记录某一天的某条投资事实。

## 最小示例

创建 `portfolio.nav`：

```nav
2026-01-01 capital Portfolio:Core "初始资金"
  amount: 100,000 USD

2026-01-01 option Portfolio:Core "工作区设置"
  base_currency: USD
  timezone: Asia/Shanghai

2026-01-01 open Account:US "美股"
  target: 60%

2026-01-02 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US
  symbol: NVDA
  target: 15%

2026-01-10 research Asset:Equity:US:NVDA "数据中心需求"
  source: 公司财报
  ---
  管理层维持数据中心展望。
  ---

2026-01-12 thesis Asset:Equity:US:NVDA "算力需求仍具韧性"
  confidence: Medium
  invalid_if: 数据中心收入连续两季下滑
  ---
  财报后重新检查该观点。
  ---
```

这份文件里有资金、设置、账户分组、标的、外部研究和可证伪观点，不用装专用软件也能直接打开看。

## 记录形态

每条指令长这样：

```nav
YYYY-MM-DD DIRECTIVE SUBJECT "可选标题"
  key: value
  ---
  可选 Markdown 正文
  ---
```

元数据和正文前面缩进两个空格。十二条指令的完整说明见[指令](../language/directives.zh.md)。

## 本地查看

在包含 `portfolio.nav` 的目录里运行：

```bash
nav serve .
```

Reader 会编译这些事实并显示诊断，诊断会标出不一致的地方，但不会拦着你打开工作区。

## 下一步

- [组织仓库](organize-your-repository.zh.md)
- [语言概览](../language/overview.zh.md)
- 仓库[示例](../../example/)：`nav serve example`
