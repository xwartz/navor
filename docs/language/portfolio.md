# Portfolio

Portfolio-level facts describe investable capacity, workspace settings, allocation sleeves, and plan-based rebalancing.

## Capital

`capital` records planning capacity. It need not equal a brokerage cash balance.

```nav
2026-01-01 capital Portfolio:Core "Initial capital"
  amount: 100,000 USD
```

## Options

`option` sets workspace-level settings:

```nav
2026-01-01 option Portfolio:Core "Workspace settings"
  base_currency: USD
  timezone: Asia/Shanghai
  fx_rates: CNY=7.00, HKD=7.84
```

## Accounts and assets

An **Account** is a top-level allocation sleeve or cash boundary. An **Asset** is a holding subject (equity, fund, crypto, etc.).

```nav
2026-01-01 open Account:US "US equities"
  target: 60%

2026-01-02 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US
  symbol: NVDA
  target: 15%
```

Open the Account before Assets that reference it. Open an Asset before asset-level `txn` directives.

## Targets

- Account `target` is **portfolio-level** (e.g. 60% of the whole portfolio).
- Asset `target` is **relative to its parent Account** (e.g. 15% of that account sleeve).
- Whole-portfolio asset weight is derived; do not duplicate it as source metadata.

## Plans and rebalance rules

Use `plan` for bands and rebalance rhythm:

```nav
2026-01-03 plan Account:US "US equities"
  target: 25%
  min: 20%
  max: 30%
  rebalance: Quarterly
```

## Close without erasing history

`close` ends active management. Prior directives remain for audit:

```nav
2026-12-31 close Asset:Equity:US:XYZ "Position exited"
  reason: Thesis invalidated
```

## Derived portfolio views

Holdings, cash, cost, market value, allocation, PnL, and drift are **derived** by the engine from `txn` and enrichment data. They are not stored as source directives.

## Related

- [Metadata](metadata.md)
- [Transactions](transactions.md)
- [Market data and privacy](../operations/market-data-and-privacy.md)
