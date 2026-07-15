# 快速开始

先创建工作区、开立 subject，再在本地 Reader 中查看。指令细节见[语言参考](language.zh.md)；常见记账见[记账指南](../cookbook/booking.zh.md)。

## 创建工作区

工作区是包含 `.nav` 文件的目录。Navor 递归读取文件；目录结构服务于人，不服务于 parser。

```text
portfolio/
  portfolio.nav
  accounts/us.nav
  assets/nvda.nav
  activity/2026.nav
```

常用划分：

| 路径 | 内容 |
| --- | --- |
| `portfolio.nav` | `capital`、`option` 等组合级事实 |
| `accounts/` | Account 的 `open` / `plan` / `close` |
| `assets/` | Asset 的 `open` / `close` |
| `activity/` | 带日期的 `txn`、`research`、`thesis`、`decision`、`review`、`journal` |

先写组合设置与资金：

```nav
2026-01-01 capital Portfolio:Core "初始资金"
  amount: 100,000 USD

2026-01-01 option Portfolio:Core "工作区设置"
  base_currency: USD
  timezone: Asia/Shanghai
```

## 开立 Account 与 Asset

记录 Asset 交易前，先 `open` Account，再 `open` Asset：

```nav
2026-01-01 open Account:US "美股"
  target: 60%

2026-01-02 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US
  symbol: NVDA
  target: 15%
```

可投资现金用 Account 级 `txn` 注入（不要挂到 Asset）：

```nav
2026-01-03 txn Account:US "注入美股现金"
  Assets:Cash:USD   60,000 USD
  Equity:Capital   -60,000 USD
```

## 本地查看

```bash
nav serve portfolio
```

Reader 编译工作区事实，并可在本地开发中提供可选的同源价格端点。诊断会显示在界面中，不会阻止打开工作区。

## 构建静态站点

```bash
nav build portfolio --out dist/site
```

输出包含 `index.html`、浏览器资源和 `navor-data.json`。未传 `--fetch-prices` 时只含事实。托管站点若需浏览器侧实时行情，按[部署](../operations/deployment.zh.md)配置同源代理。

## 下一步

1. 用[记账指南](../cookbook/booking.zh.md)记录买入、卖出与复盘。
2. 用 `nav serve example` 打开仓库内[示例工作区](../../example/)。
3. 需要精确语法或诊断规则时查[语言参考](language.zh.md)。
