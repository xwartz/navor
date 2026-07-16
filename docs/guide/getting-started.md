# Getting started

Create a workspace, open subjects, then view it in the local Reader. For directive details, see the [language reference](language.md). For common booking patterns, see the [booking guide](../cookbook/booking.md).

## Create a workspace

A workspace is a directory of `.nav` files. Navor reads them recursively; the layout is for people, not the parser.

```text
portfolio/
  portfolio.nav
  accounts/us.nav
  assets/nvda.nav
  activity/2026.nav
```

A practical split:

| Path | Contents |
| --- | --- |
| `portfolio.nav` | `capital`, `option`, and other portfolio-level facts |
| `accounts/` | `open` / `plan` / `close` for Accounts |
| `assets/` | `open` / `close` for Assets |
| `activity/` | dated `txn`, `research`, `thesis`, `decision`, `review`, `journal` |

Start with portfolio settings and capital:

```nav
2026-01-01 capital Portfolio:Core "Initial capital"
  amount: 100,000 USD

2026-01-01 option Portfolio:Core "Workspace settings"
  base_currency: USD
  timezone: Asia/Shanghai
```

## Open Account and Asset

Open the Account, then the Asset, before recording Asset transactions:

```nav
2026-01-01 open Account:US "US equities"
  target: 60%

2026-01-02 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US
  symbol: NVDA
  target: 15%
```

Deploy investable cash with an Account `txn` (not an Asset subject):

```nav
2026-01-03 txn Account:US "Deploy US cash"
  Assets:Cash:USD   60,000 USD
  Equity:Capital   -60,000 USD
```

## Read locally

```bash
nav serve portfolio
```

The Reader compiles workspace facts and can expose an optional same-origin price endpoint for local development. Diagnostics appear in the UI; they do not block opening the workspace.

## Build a static site

```bash
nav build portfolio --out dist/site
```

The output includes `index.html`, browser assets, and `navor-data.json`. Without `--fetch-prices`, it contains facts only. For live browser prices on a hosted site, deploy a same-origin proxy as described in [deployment](../operations/deployment.md).

## Format source files

```bash
nav format portfolio
nav format portfolio --check
```

`nav format` normalizes whitespace (indent, posting columns, blank lines between directives). It does not reorder directives, rewrite number literals, or reflow Markdown bodies. Use `--check` in CI; it exits non-zero when files need formatting.

Editor highlighting for `.nav` lives in [`extensions/vscode`](../../extensions/vscode/). Install it from that folder in Cursor or VS Code after `pnpm build`.

## Next steps

1. Record buys, sells, and reviews with the [booking guide](../cookbook/booking.md).
2. Serve the repository [example](../../example/) with `nav serve example`.
3. Use the [language reference](language.md) when you need exact syntax or diagnostics.
