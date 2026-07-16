# 指令

Navor 0.1 有十二条指令，每条记一类投资事实。

## 记录形态

```nav
YYYY-MM-DD DIRECTIVE SUBJECT "标题"
  key: value
  ---
  Markdown 正文
  ---
```

标题可选，且不能包含双引号，正文可选。

## 指令表

| 指令 | 用途 | 常见元数据 |
| --- | --- | --- |
| `option` | 工作区级设置 | `base_currency`、`timezone`、`fx_rates` |
| `capital` | 可投资预算 | `amount` |
| `open` | 开始管理 subject | `account`、`target`、`symbol`、`status` |
| `close` | 结束主动管理，不删历史 | `reason` |
| `plan` | 目标区间与再平衡策略 | `target`、`min`、`max`、`rebalance` |
| `research` | 外部观察信息 | `source`、`reliability`、`tags` |
| `thesis` | 可证伪投资观点 | `horizon`、`confidence`、`invalid_if`、`review_by` |
| `decision` | 意图中的行动 | `action`、`target_weight`、`trigger`、`based_on` |
| `txn` | 已执行交易或现金事件 | posting、`decision`、`reason` |
| `review` | 定期或事件驱动评估 | `status`、`action` |
| `journal` | 过程与行为记录 | `mood`、`related` |
| `note` | 其他 dated 笔记 | 正文或元数据 |

## 组合与生命周期

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

2026-01-03 plan Account:US "美股"
  target: 25%
  min: 20%
  max: 30%
  rebalance: Quarterly
```

`capital` 记录规划容量，不必等于券商现金余额，Account `target` 为组合级，Asset `target` 相对所属 Account。

## 推理链

```nav
2026-01-10 research Asset:Equity:US:NVDA "数据中心需求"
  source: 公司财报

2026-01-12 thesis Asset:Equity:US:NVDA "算力需求仍具韧性"
  confidence: Medium
  invalid_if: 数据中心收入连续两季下滑

2026-01-13 decision Asset:Equity:US:NVDA "建仓"
  action: Buy
  target_weight: 15%
```

`research` 记观察，`thesis` 记可证伪观点，`decision` 记意图；执行用单独的 `txn`。

## 复盘与笔记

```nav
2026-04-30 review Asset:Equity:US:NVDA "季度复盘"
  status: On Track
  action: Hold
  ---
  证伪条件未触发。
  ---

2026-03-01 journal Portfolio:Core "三月纪律"
  mood: Calm
  ---
  避免在单日大涨时追涨。
  ---
```

## 相关

- [元数据](metadata.zh.md)
- [交易](transactions.zh.md)
- [研究与推理](research.zh.md)
- [组合](portfolio.zh.md)
