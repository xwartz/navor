# Booking guide

Practical patterns for common Navor records. This is not a full syntax reference; see the [language reference](../guide/language.md) for that. The repository [example](../../example/) uses the same shapes at larger scale.

Assume Account and Asset subjects are already open, as in [getting started](../guide/getting-started.md).

## Fund an Account

Cash deployment belongs on the Account, not on a ticker:

```nav
2026-01-03 txn Account:US "Deploy US cash"
  Assets:Cash:USD   60,000 USD
  Equity:Capital   -60,000 USD
```

Withdraw by reversing the signs. Account transactions must not include asset-holding postings.

## Buy an Asset

```nav
2026-02-01 txn Asset:Equity:US:NVDA "First purchase"
  Assets:Equity:US:NVDA  10 NVDA @ 900 USD
  Assets:Cash:USD       -9,000 USD
  Expenses:Fee               1 USD
```

Use the Asset as `txn` subject. Map the holding path (`Assets:Equity:US:NVDA`) to that Asset subject (`Asset:Equity:US:NVDA`). `Asset:` is the subject; `Assets:` is the posting path.

## Sell an Asset

```nav
2026-06-15 txn Asset:Equity:US:NVDA "Trim"
  Assets:Equity:US:NVDA  -2 NVDA @ 1,050 USD
  Assets:Cash:USD        2,099 USD
  Expenses:Fee               1 USD
```

Negative holding quantity reduces the position. Proceeds increase cash.

## Dividend or cash-only Asset event

Asset-linked cash flows may omit a holding posting when they use only cash, income, and expense accounts:

```nav
2026-03-20 txn Asset:Equity:US:MSFT "Quarterly dividend"
  Assets:Cash:USD      12 USD
  Income:Dividend     -12 USD
```

## Targets and rebalance policy

Account `target` is portfolio-level. Asset `target` is relative to its parent Account. Record bands with `plan`:

```nav
2026-01-03 plan Account:US "US equities"
  target: 25%
  min: 20%
  max: 30%
  rebalance: Quarterly
```

Whole-portfolio Asset weight is derived; do not duplicate it as source metadata.

## Intent before execution

Record intent with `decision`, then execution with `txn`:

```nav
2026-01-31 decision Asset:Equity:US:NVDA "Build the position"
  action: Buy
  target_weight: 15%
  based_on: Asset:Equity:US:NVDA

2026-02-01 txn Asset:Equity:US:NVDA "First purchase"
  Assets:Equity:US:NVDA  10 NVDA @ 900 USD
  Assets:Cash:USD       -9,000 USD
  Expenses:Fee               1 USD
  decision: 2026-01-31
```

An Asset-level `decision` without a matching Asset `txn` surfaces as a diagnostic.

## Change of view: append, do not rewrite

When a thesis or plan changes, add a new directive. Keep prior records:

```nav
2026-04-30 review Asset:Equity:US:NVDA "Quarterly review"
  status: On Track
  action: Hold
  ---
  Invalidation condition not met.
  ---
```

## See also

- [Language reference](../guide/language.md)
- [Market data and privacy](../operations/market-data-and-privacy.md)
- Example: `nav serve example`
