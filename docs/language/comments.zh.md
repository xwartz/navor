# 注释与正文

Navor 把结构化字段和叙述分开写。

## 行注释

注释占一整行，以 `;` 开头：

```nav
; 首次买入前先给美股账户注资。
2026-01-03 txn Account:US "注入美股现金"
  Assets:Cash:USD   60,000 USD
  Equity:Capital   -60,000 USD
```

空行会忽略，注释适合写记账备忘，不算投资事实。

## Markdown 正文

可选正文保留 Markdown，不做语义解释：

```nav
2026-04-30 review Asset:Equity:US:NVDA "季度复盘"
  status: On Track
  action: Hold
  ---
  ## 证据
  数据中心收入环比增 12%。

  ## 待澄清
  - 下一代芯片出口管制
  ---
```

规则：

- 开始与结束分隔符为 `  ---`（两空格、三个连字符）。
- 正文每行两空格缩进。
- 叙述放正文；稳定、可筛选字段放元数据。

## 文档写法

- 让未来的读者看懂**为什么**，而不只是**做了什么**。
- 用 `based_on`、`decision` 元数据把决策连到观点，不要只写在注释里。
- 观点变化时追加新指令，不要改旧指令的日期或 subject。

## 相关

- [研究与推理](research.zh.md)
- [参考：语法](../reference/syntax.zh.md)
