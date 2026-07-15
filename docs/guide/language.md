# Navor language reference

Version 0.1. Syntax accepted by the current parser and semantic checks from the current engine. For day-to-day booking patterns, see the [booking guide](../cookbook/booking.md).

## Scope

Navor is a declarative, append-only language for investment facts: capital, accounts, assets, research, theses, decisions, transactions, reviews, and journals. It does not place orders, automate trading, replace accounting or tax records, or make investment recommendations.

The format is Beancount-shaped: dated records, indented metadata and postings, `;` for whole-line comments. Navor is not compatible with Beancount syntax or semantics.

## File and workspace

Navor source files use the `.nav` extension. A workspace is a directory tree of `.nav` files. File paths are for organization only: directives are interpreted by date, directive, subject, metadata, and postings.

```text
portfolio/
  portfolio.nav
  accounts/us.nav
  assets/nvda.nav
  activity/2026.nav
```

Blank lines and lines whose first character is `;` are ignored.

## Record form

Each directive has a date, directive name, subject, and optional quoted title.

```nav
YYYY-MM-DD DIRECTIVE SUBJECT "Title"
  key: value
  Account:Path  quantity COMMODITY @ price CURRENCY
  ---
  Markdown body
  ---
```

- The date is `YYYY-MM-DD`.
- The directive and subject are required. The title is optional and cannot contain a double quote.
- Metadata, postings, and body delimiters begin with exactly two spaces.
- Metadata keys match `[A-Za-z_][A-Za-z0-9_]*`; values are non-empty text.
- A body is optional. Its opening and closing delimiter is `  ---`; every body line is indented by two spaces.

The parser preserves metadata values as strings. Interpretation belongs to the engine and Reader.

## Subjects

A subject is a stable, colon-separated identifier. Navor reserves no fixed taxonomy beyond the semantics documented below.

```text
Portfolio:Core
Account:US
Asset:Equity:US:NVDA
Market:Crypto
```

Use stable identifiers. An `Asset` is the object of research, planning, and an asset-level transaction. An `Account` is a top-level allocation sleeve or cash boundary. An Asset's `account` metadata identifies its parent Account.

## Directives

Navor 0.1 recognizes twelve directives.

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

### Capital, Account, and Asset

```nav
2026-01-01 capital Portfolio:Core "Initial capital"
  amount: 100,000 USD

2026-01-01 open Account:US "US equities"
  target: 60%

2026-01-02 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US
  symbol: NVDA
  target: 15%
```

`capital` records planning capacity and need not equal a brokerage cash balance. Account `target` is a portfolio-level sleeve target. Asset `target` is relative to its parent Account. The engine may derive the Asset's whole-portfolio weight from both values.

### Research, thesis, decision, and review

```nav
2026-01-10 research Asset:Equity:US:NVDA "Data-center demand"
  source: Company earnings
  reliability: Primary
  tags: AI,DataCenter
  ---
  Management maintained its data-center outlook.
  ---

2026-01-12 thesis Asset:Equity:US:NVDA "Compute demand remains durable"
  horizon: 3y
  confidence: Medium
  invalid_if: Data-center revenue declines for two quarters
  review_by: 2026-04-30

2026-01-13 decision Asset:Equity:US:NVDA "Build the position"
  action: Buy
  target_weight: 15%
  based_on: Asset:Equity:US:NVDA
```

`research` records observations. A `thesis` states a view that can be invalidated. A `decision` records intent and becomes an executed fact only when a `txn` is recorded. A `review` records the later assessment of an Asset, Account, or Portfolio.

### Transactions and postings

`txn` records an executed economic event. Each posting has this form:

```text
ACCOUNT_PATH QUANTITY COMMODITY [@ PRICE CURRENCY]
```

```nav
2026-02-01 txn Asset:Equity:US:NVDA "First purchase"
  Assets:Equity:US:NVDA  10 NVDA @ 900 USD
  Assets:Cash:USD       -9,000 USD
  Expenses:Fee              1 USD
```

The engine recognizes `Assets:`, `Income:`, and `Expenses:` postings in its portfolio views. For an Asset transaction, a holding posting normally maps `Assets:Equity:US:NVDA` to `Asset:Equity:US:NVDA`. Cash-only Asset events may use only `Assets:Cash:`, `Income:`, and `Expenses:` postings. An Account transaction is for funding, withdrawals, and other cash events; it must not include an asset-holding posting.

`Asset:` names a Navor subject. `Assets:` names a posting account path. The singular and plural forms have different roles.

The current parser accepts a posting syntactically. It does not enforce double-entry balancing or commodity consistency.

### Body, comments, and history

Bodies preserve Markdown without interpretation.

```nav
; Comments occupy a complete line.
2026-04-30 review Asset:Equity:US:NVDA "Quarterly review"
  status: On Track
  action: Hold
  ---
  The invalidation condition has not been met.
  ---
```

Add a new directive when a view, plan, or decision changes. Do not rewrite a historical directive merely to make the present state look cleaner.

## Semantic checks

Parsing reports malformed directive, metadata, posting, indentation, and body-delimiter lines. The semantic engine additionally reports diagnostics when:

- an Asset names an unopened Account;
- a `plan` references an unknown Account or Asset;
- a `txn` subject is not an open Asset or Account;
- an Account transaction includes an asset-holding posting;
- an Asset transaction has no matching holding posting, unless it is cash, income, or expense only;
- an Asset-level `decision` has no transaction for that Asset.

Diagnostics do not prevent a workspace from being read. They identify facts that need review.

## Derived data and enrichment

Source files hold user-confirmed facts. Holdings, cash, cost, market value, allocation, PnL, drift, and generated Reader views are derived. Price and FX data are optional enrichment; missing or stale provider data is not a source fact and must not make the workspace unreadable.

See [concepts](concepts.md) for public-surface and compatibility policy, the [booking guide](../cookbook/booking.md) for worked patterns, and [market data and privacy](../operations/market-data-and-privacy.md) before deploying a price proxy.
