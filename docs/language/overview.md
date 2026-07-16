# Language overview

Navor is a declarative, append-only language for **investment state**: capital, accounts, assets, research, theses, decisions, transactions, reviews, and journals.

It does not place orders, automate trading, replace accounting or tax records, or make investment recommendations.

## What is a Navor document?

A `.nav` file is plain text. Each **directive** is one dated fact:

```nav
YYYY-MM-DD DIRECTIVE SUBJECT "Optional title"
  key: value
  Account:Path  quantity COMMODITY @ price CURRENCY
  ---
  Optional Markdown body
  ---
```

- The date is `YYYY-MM-DD`.
- Metadata, postings, and body delimiters begin with exactly two spaces.
- Bodies use `  ---` as opening and closing delimiters.

## Workspace

A workspace is a directory tree of `.nav` files. File paths are for organization only. Directives are interpreted by date, directive, subject, metadata, and postings.

## Subjects

A subject is a stable, colon-separated identifier:

```text
Portfolio:Core
Account:US
Asset:Equity:US:NVDA
```

An `Asset` is the object of research, planning, and asset-level transactions. An `Account` is a top-level allocation sleeve or cash boundary. An Asset's `account` metadata names its parent Account.

## Twelve directives

Navor 0.1 recognizes twelve directives. See [directives](directives.md) for the full table and examples.

| Group | Directives |
| --- | --- |
| Portfolio | `option`, `capital` |
| Lifecycle | `open`, `close`, `plan` |
| Reasoning | `research`, `thesis`, `decision`, `review` |
| Activity | `txn`, `journal`, `note` |

## Append-only history

Add a new directive when a view, plan, or decision changes. Do not rewrite a historical directive to make the present state look cleaner.

## Derived views

Source files hold user-confirmed facts. Holdings, cash, cost, market value, allocation, PnL, drift, and Reader views are **derived**. Price and FX data are optional enrichment.

## Learn more

- [Files](files.md): how to split a repository
- [Directives](directives.md): every directive with examples
- [Reference: syntax](../reference/syntax.md): exact rules and diagnostics
