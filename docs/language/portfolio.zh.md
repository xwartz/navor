# 组合

组合级事实描述你能投多少、工作区怎么设、账户怎么分组，以及基于计划的再平衡。

## 资金

`capital` 记规划容量，不必等于券商账户里的现金。

```nav
2026-01-01 capital Portfolio:Core "初始资金"
  amount: 100,000 USD
```

## 选项

`option` 设工作区参数：

```nav
2026-01-01 option Portfolio:Core "工作区设置"
  base_currency: USD
  timezone: Asia/Shanghai
  fx_rates: CNY=7.00, HKD=7.84
```

## 账户与标的

**Account** 是顶层分组或现金边界，**Asset** 是具体持仓（股票、基金、加密资产等）。

```nav
2026-01-01 open Account:US "美股"
  target: 60%

2026-01-02 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US
  symbol: NVDA
  target: 15%
```

先 `open` Account，再 `open` 引用它的 Asset；记 Asset 级 `txn` 前，Asset 得先 `open`。

## 目标权重

- Account `target` 是**组合级**的（比如占全组合 60%）
- Asset `target` **相对所属 Account**（比如占该分组 15%）
- 全组合里某标的占多少，由引擎算，别重复写进元数据

## 计划与再平衡

用 `plan` 记区间和再平衡节奏：

```nav
2026-01-03 plan Account:US "美股"
  target: 25%
  min: 20%
  max: 30%
  rebalance: Quarterly
```

## 关闭但不抹历史

`close` 表示不再主动管理，旧记录都留着：

```nav
2026-12-31 close Asset:Equity:US:XYZ "已退出"
  reason: 观点被证伪
```

## 派生组合视图

持仓、现金、成本、市值、配置、盈亏、偏离都是引擎从 `txn` 和增强数据算出来的，不作为源指令存。

## 相关

- [元数据](metadata.zh.md)
- [交易](transactions.zh.md)
- [行情数据与隐私](../operations/market-data-and-privacy.zh.md)
