# Directives

Navor 0.1 recognizes twelve directives. Each directive records one kind of investment fact.

## Record form

```nav
YYYY-MM-DD DIRECTIVE SUBJECT "Title"
  key: value
  ---
  Markdown body
  ---
```

The title is optional and cannot contain a double quote. The body is optional.

## Directive reference

| Directive | Purpose | Typical metadata |
| --- | --- | --- |
| `option` | Workspace-level settings | `base_currency`, `timezone`, `fx_rates` |
| `capital` | Investable budget | `amount` |
| `open` | Begin managing a subject | `account`, `target`, `symbol`, `status` |
| `close` | End active management without deleting history | `reason` |
| `plan` | Target bands and rebalance policy | `target`, `min`, `max`, `rebalance` |
| `research` | Observed external information | `source`, `reliability`, `tags` |
| `thesis` | Falsifiable investment view | `horizon`, `confidence`, `invalid_if`, `review_by` |
| `decision` | Intended action | `action`, `target_weight`, `trigger`, `based_on` |
| `txn` | Executed transaction or cash event | postings, `decision`, `reason` |
| `review` | Periodic or event-driven assessment | `status`, `action` |
| `journal` | Process and behavioural record | `mood`, `related` |
| `note` | Other dated note | body or metadata |

## Portfolio and lifecycle

```nav
2026-01-01 capital Portfolio:Core "Initial capital"
  amount: 100,000 USD

2026-01-01 option Portfolio:Core "Workspace settings"
  base_currency: USD
  timezone: Asia/Shanghai

2026-01-01 open Account:US "US equities"
  target: 60%

2026-01-02 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US
  symbol: NVDA
  target: 15%

2026-01-03 plan Account:US "US equities"
  target: 25%
  min: 20%
  max: 30%
  rebalance: Quarterly
```

`capital` records planning capacity; it need not equal a brokerage cash balance. Account `target` is portfolio-level. Asset `target` is relative to its parent Account.

## Reasoning chain

```nav
2026-01-10 research Asset:Equity:US:NVDA "Data-center demand"
  source: Company earnings
  tags: AI,DataCenter

2026-01-12 thesis Asset:Equity:US:NVDA "Compute demand remains durable"
  horizon: 3y
  confidence: Medium
  invalid_if: Data-center revenue declines for two quarters

2026-01-13 decision Asset:Equity:US:NVDA "Build the position"
  action: Buy
  target_weight: 15%
  based_on: Asset:Equity:US:NVDA
```

`research` records observations. `thesis` states a view that can be invalidated. `decision` records intent; execution is a separate `txn`.

## Reviews and notes

```nav
2026-04-30 review Asset:Equity:US:NVDA "Quarterly review"
  status: On Track
  action: Hold
  ---
  Invalidation condition not met.
  ---

2026-03-01 journal Portfolio:Core "March discipline"
  mood: Calm
  ---
  Avoided adding on a one-day spike.
  ---
```

## Related

- [Metadata](metadata.md)
- [Transactions](transactions.md)
- [Research](research.md)
- [Portfolio](portfolio.md)
