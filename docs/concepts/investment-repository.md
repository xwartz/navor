# Investment repository

A Navor repository is a directory of `.nav` files that together describe your investment state.

## Why a repository, not a database

Plain-text files in a folder are portable, diffable, and independent of any vendor. You can copy the folder, archive it, or host it on GitHub without a running Navor service.

## Recommended layout

See [organize your repository](../getting-started/organize-your-repository.md). Typical split:

- `portfolio.nav` for capital and options
- `accounts/` and `assets/` for subjects
- `activity/` for dated events and reasoning

## Lifecycle

1. **Bootstrap**: create files, record capital and opens.
2. **Operate**: append research, theses, decisions, and transactions.
3. **Review**: add `review` and `journal` directives; read diffs in Git.
4. **Publish** (optional): `nav build` for a static site; deploy with optional price proxy.

## Source vs output

`.nav` files are the source of truth. Reader UI and `navor-data.json` are derived views. Do not edit derived JSON by hand.

## Related

- [Version control](version-control.md)
- [Plain text](plain-text.md)
