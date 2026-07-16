# Files

Navor does not assign meaning to file names. Any `.nav` file anywhere under the workspace root is loaded. Use paths that make sense for you and for Git review.

## Common file roles

| File or folder | Role |
| --- | --- |
| `portfolio.nav` | Portfolio-level `capital` and `option` |
| `accounts/*.nav` | Account `open`, `plan`, `close` |
| `assets/*.nav` | Asset `open`, `close` |
| `activity/*.nav` | Dated activity: `txn`, `research`, `thesis`, `decision`, `review`, `journal`, `note` |
| `plan.nav` | Rebalance bands and policies (optional) |

The repository [example](../../example/) uses this split at larger scale.

## One file vs many

**One file per year** in `activity/` keeps annual review simple.

**One file per asset** keeps thesis and transaction history together.

**One monolithic file** is valid for small workspaces.

The parser merges all directives into one timeline ordered by date.

## Encoding and naming

- Use the `.nav` extension.
- UTF-8 encoding.
- Prefer stable, descriptive paths (`assets/nvda.nav`, not `temp.nav`).

See [file format](../reference/file-format.md) for encoding and line-ending rules.

## Related

- [Organize your repository](../getting-started/organize-your-repository.md)
- [Investment repository](../concepts/investment-repository.md)
