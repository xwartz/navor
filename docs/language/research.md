# Research and reasoning

Navor treats reasoning as first-class facts, not comments on positions.

## Research

`research` records **observed external information**: earnings, news, filings, conversations. It is evidence, not yet a view.

```nav
2026-01-10 research Asset:Equity:US:NVDA "Data-center demand"
  source: Company earnings
  reliability: Primary
  tags: AI,DataCenter
  ---
  Management maintained its data-center outlook.
  ---
```

Use `source`, `reliability`, and `tags` for structured fields. Use the body for quotes, summaries, and links.

## Thesis

`thesis` states a **falsifiable investment view**:

```nav
2026-01-12 thesis Asset:Equity:US:NVDA "Compute demand remains durable"
  based_on: 2026-01-10
  horizon: 3y
  confidence: Medium
  invalid_if: Data-center revenue declines for two quarters
  review_by: 2026-04-30
  ---
  Revisit after next earnings.
  ---
```

`invalid_if` documents what would change your mind. `review_by` schedules the next check.

## Decision

`decision` records **intent** before or without execution:

```nav
2026-01-13 decision Asset:Equity:US:NVDA "Build the position"
  action: Buy
  target_weight: 15%
  trigger: Post-earnings confirmation
  based_on: 2026-01-12
```

References resolve within the same subject by date. If more than one applicable record exists on that date, add the quoted title: `based_on: 2026-01-12 "Compute demand remains durable"`.

A decision remains valid intent without execution. When a transaction executes it, optionally add `decision: 2026-01-13` to the `txn`; dividends, transfers, imports, and other transactions do not need a decision link.

## Review

`review` assesses an Asset, Account, or Portfolio after time passes or events occur:

```nav
2026-04-30 review Asset:Equity:US:NVDA "Quarterly review"
  status: On Track
  action: Hold
  ---
  Invalidation condition not met. Thesis unchanged.
  ---
```

## Journal and note

`journal` captures process and behaviour. `note` is a general dated note. Both may use bodies for free-form Markdown.

## Change of view: append, do not rewrite

When a thesis or plan changes, add a new directive. Keep prior records so history shows how thinking evolved.

## Reasoning chain

```text
research → thesis → decision → txn → portfolio (derived)
```

Read [reasoning](../concepts/reasoning.md) for why this order matters.

## Related

- [Directives](directives.md)
- [Transactions](transactions.md)
