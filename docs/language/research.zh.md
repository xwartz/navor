# 研究与推理

Navor 把推理写进源文件，不是挂在持仓旁边的注释。

## 研究

`research` 记你观察到的外部信息：财报、新闻、公告、对话，这是证据，还不是观点。

```nav
2026-01-10 research Asset:Equity:US:NVDA "数据中心需求"
  source: 公司财报
  reliability: Primary
  tags: AI,DataCenter
  ---
  管理层维持数据中心展望。
  ---
```

`source`、`reliability`、`tags` 放元数据；引用、摘要、链接放正文。

## 观点

`thesis` 写你的投资观点，而且要能证伪：

```nav
2026-01-12 thesis Asset:Equity:US:NVDA "算力需求仍具韧性"
  based_on: 2026-01-10
  horizon: 3y
  confidence: Medium
  invalid_if: 数据中心收入连续两季下滑
  review_by: 2026-04-30
  ---
  下次财报后复核。
  ---
```

`invalid_if` 写清楚什么会改变你的看法，`review_by` 定下次检查时间。

## 决策

`decision` 记你的意图，不管最后有没有成交：

```nav
2026-01-13 decision Asset:Equity:US:NVDA "建仓"
  action: Buy
  target_weight: 15%
  trigger: 财报后确认
  based_on: 2026-01-12
```

引用按同一 subject 与日期解析。同日有多条候选记录时，再补充带引号的标题：`based_on: 2026-01-12 "算力需求仍具韧性"`。

没有执行记录的 decision 仍是有效意图。若某笔交易执行了它，可在 `txn` 上写 `decision: 2026-01-13`；分红、转账、导入记录等交易不需要关联 decision。

## 复盘

`review` 在时间过去或事件发生后，评估 Asset、Account 或 Portfolio：

```nav
2026-04-30 review Asset:Equity:US:NVDA "季度复盘"
  status: On Track
  action: Hold
  ---
  证伪条件未触发，观点不变。
  ---
```

## 日志与笔记

`journal` 记过程和纪律，`note` 记一般性笔记，正文都可以写自由 Markdown。

## 观点变化：追加，不改写

观点或计划变了，就追加新指令，旧记录留着，历史才看得出思路怎么变。

## 推理链

```text
research → thesis → decision → txn → portfolio（派生）
```

这条链为什么重要，见[推理链](../concepts/reasoning.zh.md)。

## 相关

- [指令](directives.zh.md)
- [交易](transactions.zh.md)
