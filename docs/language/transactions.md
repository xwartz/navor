# Transactions

`txn` records an executed economic event: a buy, sell, dividend, fee, or cash movement.

## Posting form

Each posting line has this shape:

```text
ACCOUNT_PATH QUANTITY COMMODITY [@ PRICE CURRENCY]
```

Example buy:

```nav
2026-02-01 txn Asset:Equity:US:NVDA "First purchase"
  Assets:Equity:US:NVDA  10 NVDA @ 900 USD
  Assets:Cash:USD       -9,000 USD
  Expenses:Fee              1 USD
```

- Use the **Asset** as `txn` subject for asset trades.
- Map the holding path (`Assets:Equity:US:NVDA`) to that Asset subject (`Asset:Equity:US:NVDA`).
- `Asset:` names a Navor subject. `Assets:` names a posting account path.

## Fund an Account

Cash deployment belongs on the Account, not on a ticker:

```nav
2026-01-03 txn Account:US "Deploy US cash"
  Assets:Cash:USD   60,000 USD
  Equity:Capital   -60,000 USD
```

Account transactions must not include asset-holding postings.

## Sell

Negative holding quantity reduces the position:

```nav
2026-06-15 txn Asset:Equity:US:NVDA "Trim"
  Assets:Equity:US:NVDA  -2 NVDA @ 1,050 USD
  Assets:Cash:USD        2,099 USD
  Expenses:Fee               1 USD
```

## Dividend or cash-only event

Asset-linked cash flows may omit a holding posting when they use only cash, income, and expense accounts:

```nav
2026-03-20 txn Asset:Equity:US:MSFT "Quarterly dividend"
  Assets:Cash:USD      12 USD
  Income:Dividend     -12 USD
```

## Intent before execution

Record intent with `decision`, then execution with `txn`:

```nav
2026-01-31 decision Asset:Equity:US:NVDA "Build the position"
  action: Buy
  target_weight: 15%

2026-02-01 txn Asset:Equity:US:NVDA "First purchase"
  Assets:Equity:US:NVDA  10 NVDA @ 900 USD
  Assets:Cash:USD       -9,000 USD
  decision: 2026-01-31
```

An Asset-level `decision` without a matching Asset `txn` surfaces as a diagnostic.

## Parser limits

The parser accepts postings syntactically. It does not enforce double-entry balancing or commodity consistency. Semantic checks flag common booking mistakes; see [diagnostics](../reference/diagnostics.md).

## Related

- [Directives](directives.md)
- [Portfolio](portfolio.md)
