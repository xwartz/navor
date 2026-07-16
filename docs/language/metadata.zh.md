# 元数据

元数据是指令下面缩进写的键值对，放结构化字段；叙述性内容放 Markdown 正文。

## 语法

```nav
2026-01-02 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US
  symbol: NVDA
  target: 15%
  status: Active
```

规则：

- 元数据行以恰好两个空格开头。
- 键匹配 `[A-Za-z_][A-Za-z0-9_]*`。
- 值为 `: ` 后的非空文本。

parser 把值当字符串留着，具体怎么解释由 engine 和 Reader 决定。

## 常见字段

| 字段 | 用于 | 含义 |
| --- | --- | --- |
| `amount` | `capital` | 可投资预算与商品，如 `100,000 USD` |
| `base_currency` | `option` | 报告货币 |
| `timezone` | `option` | 工作区时区 |
| `fx_rates` | `option` | 静态汇率对，如 `CNY=7.00, HKD=7.84` |
| `account` | `open`（Asset） | 所属 Account subject |
| `target` | `open`、`plan` | 权重目标（`60%`、`15%`） |
| `symbol` | `open`（Asset） | 行情代码或标识 |
| `confidence` | `thesis` | 定性信念强度 |
| `invalid_if` | `thesis` | 证伪该观点的条件 |
| `review_by` | `thesis` | 下次复核日期 |
| `action` | `decision`、`review` | 意图或结果行动 |
| `target_weight` | `decision` | 目标组合权重 |
| `based_on` | `decision` | 决策所指的 subject |
| `decision` | `txn` | 先前 `decision` 指令的日期 |
| `source` | `research` | 观察来源 |
| `tags` | `research` | 逗号分隔标签 |

这不是穷尽 schema，能清楚表达事实时允许新键。

## 目标与派生

Account `target` 为组合级，Asset `target` 相对所属 Account，全组合标的权重由两者**派生**，不要作为第二份源事实写入。

## 相关

- [指令](directives.zh.md)
- [组合](portfolio.zh.md)
- [参考：语法](../reference/syntax.zh.md)
