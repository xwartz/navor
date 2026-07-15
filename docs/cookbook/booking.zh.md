# 记账指南

常见 Navor 记录的实用写法。完整语法见[语言参考](../guide/language.zh.md)。仓库[示例工作区](../../example/)以相同形态扩展到多账户规模。

以下假定 Account 与 Asset 已按[快速开始](../guide/getting-started.zh.md)完成 `open`。

## 向 Account 注资

资金注入挂在 Account，不要挂到具体标的：

```nav
2026-01-03 txn Account:US "注入美股现金"
  Assets:Cash:USD   60,000 USD
  Equity:Capital   -60,000 USD
```

取款时符号相反。Account 交易不得包含标的持仓 posting。

## 买入 Asset

```nav
2026-02-01 txn Asset:Equity:US:NVDA "首次买入"
  Assets:Equity:US:NVDA  10 NVDA @ 900 USD
  Assets:Cash:USD       -9,000 USD
  Expenses:Fee               1 USD
```

`txn` 的 subject 用该 Asset。持仓路径（`Assets:Equity:US:NVDA`）应对应该 Asset subject（`Asset:Equity:US:NVDA`）。`Asset:` 是 subject，`Assets:` 是 posting 路径。

## 卖出 Asset

```nav
2026-06-15 txn Asset:Equity:US:NVDA "减仓"
  Assets:Equity:US:NVDA  -2 NVDA @ 1,050 USD
  Assets:Cash:USD        2,099 USD
  Expenses:Fee               1 USD
```

持仓数量为负表示减仓；成交回笼计入现金。

## 分红或纯现金 Asset 事件

与标的相关、但不变动持仓数量的现金流，可只使用现金、收入与费用账户：

```nav
2026-03-20 txn Asset:Equity:US:MSFT "季度分红"
  Assets:Cash:USD      12 USD
  Income:Dividend     -12 USD
```

## 目标权重与再平衡政策

Account 的 `target` 是组合级目标。Asset 的 `target` 相对所属 Account。用 `plan` 记录区间：

```nav
2026-01-03 plan Account:US "美股"
  target: 25%
  min: 20%
  max: 30%
  rebalance: Quarterly
```

全组合 Asset 权重由引擎派生，不要再写成源元数据。

## 先意图，后执行

先用 `decision` 记意图，再用 `txn` 记执行：

```nav
2026-01-31 decision Asset:Equity:US:NVDA "建立仓位"
  action: Buy
  target_weight: 15%
  based_on: Asset:Equity:US:NVDA

2026-02-01 txn Asset:Equity:US:NVDA "首次买入"
  Assets:Equity:US:NVDA  10 NVDA @ 900 USD
  Assets:Cash:USD       -9,000 USD
  Expenses:Fee               1 USD
  decision: 2026-01-31
```

标的级 `decision` 若尚无对应 Asset `txn`，会作为诊断出现。

## 观点变化：追加，不改写

`thesis` 或 `plan` 变化时新增指令，保留旧记录：

```nav
2026-04-30 review Asset:Equity:US:NVDA "季度复盘"
  status: On Track
  action: Hold
  ---
  失效条件尚未出现。
  ---
```

## 另见

- [语言参考](../guide/language.zh.md)
- [行情数据与隐私](../operations/market-data-and-privacy.zh.md)
- 示例：`nav serve example`
