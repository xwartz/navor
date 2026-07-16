# Organize your repository

A Navor **repository** (workspace) is a directory tree of `.nav` files. Navor reads all `.nav` files recursively. Layout is for humans and Git review, not for the parser.

## Recommended layout

```text
investment/
  portfolio.nav
  accounts/
    us.nav
  assets/
    nvda.nav
  activity/
    2026.nav
```

| Path | Typical contents |
| --- | --- |
| `portfolio.nav` | `capital`, `option`, and other portfolio-level facts |
| `accounts/` | `open`, `plan`, `close` for Accounts |
| `assets/` | `open`, `close` for Assets |
| `activity/` | dated `txn`, `research`, `thesis`, `decision`, `review`, `journal` |

Split files by subject or by year. One large `activity/2026.nav` is fine. Several smaller files per asset are also fine.

## Why Git

Investment state evolves. Git gives you history, diff, blame, and review for every change to your reasoning and bookings.

```bash
cd investment
git init
git add .
git commit -m "Initial Navor workspace"
```

Treat `.nav` files as the source of truth. Export static sites and Reader views are derived outputs.

## Example repository

The Navor repository includes [`example/`](../../example/) with multiple accounts, assets, research, and transactions. Open it with:

```bash
nav serve example
```

## Next steps

- [Editor support](editor-support.md)
- [Investment repository](../concepts/investment-repository.md)
- [Transactions](../language/transactions.md)
