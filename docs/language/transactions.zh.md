# 交易

`txn` 记已经发生的经济事件：买卖、分红、费用、现金进出。

## Posting 形态

每条 posting 行形态如下：

```text
ACCOUNT_PATH QUANTITY COMMODITY [@ PRICE CURRENCY]
```

买入示例：

```nav
2026-02-01 txn Asset:Equity:US:NVDA "首次买入"
  Assets:Equity:US:NVDA  10 NVDA @ 900 USD
  Assets:Cash:USD       -9,000 USD
  Expenses:Fee              1 USD
```

- 标的交易以 **Asset** 为 `txn` subject。
- 持仓路径（`Assets:Equity:US:NVDA`）对应该 Asset subject（`Asset:Equity:US:NVDA`）。
- `Asset:` 是 Navor subject；`Assets:` 是 posting 账户路径。

## 账户注资

现金部署记在 Account 上，而不是某个 ticker：

```nav
2026-01-03 txn Account:US "注入美股现金"
  Assets:Cash:USD   60,000 USD
  Equity:Capital   -60,000 USD
```

Account 级 `txn` 不得包含持仓 posting。

## 卖出

负持仓数量减少仓位：

```nav
2026-06-15 txn Asset:Equity:US:NVDA "减仓"
  Assets:Equity:US:NVDA  -2 NVDA @ 1,050 USD
  Assets:Cash:USD        2,099 USD
  Expenses:Fee               1 USD
```

## 分红或纯现金事件

仅涉及现金、收入、费用账户的标的现金流，可不含持仓 posting：

```nav
2026-03-20 txn Asset:Equity:US:MSFT "季度分红"
  Assets:Cash:USD      12 USD
  Income:Dividend     -12 USD
```

## 先决策后执行

用 `decision` 记意图，用 `txn` 记执行：

```nav
2026-01-31 decision Asset:Equity:US:NVDA "建仓"
  action: Buy
  target_weight: 15%

2026-02-01 txn Asset:Equity:US:NVDA "首次买入"
  Assets:Equity:US:NVDA  10 NVDA @ 900 USD
  Assets:Cash:USD       -9,000 USD
  decision: 2026-01-31
```

`decision` 是可选的。仅当交易执行了已记录的投资决策时才填写；分红、转账、导入记录等独立交易不需要它。日期按同一 subject 的 decision 解析，日期重复时可补充带引号的标题消歧。

## Parser 限制

parser 在语法上接受 posting，不强制复式平衡或商品一致性，语义检查会标出常见记账错误，见[诊断](../reference/diagnostics.zh.md)。

## 相关

- [指令](directives.zh.md)
- [组合](portfolio.zh.md)
