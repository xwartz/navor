# Your first `.nav` file

A Navor document is a plain-text file with the `.nav` extension. Each line is either blank, a comment, or a **directive**: a dated record of an investment fact.

## Minimum example

Create `portfolio.nav`:

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

2026-01-10 research Asset:Equity:US:NVDA "Data-center demand"
  source: Company earnings
  ---
  Management maintained its data-center outlook.
  ---

2026-01-12 thesis Asset:Equity:US:NVDA "Compute demand remains durable"
  confidence: Medium
  invalid_if: Data-center revenue declines for two quarters
  ---
  Revisit after earnings.
  ---
```

This file records capital, settings, an account sleeve, an asset, external research, and a falsifiable thesis. No special editor is required to read it.

## Record shape

Every directive follows the same shape:

```nav
YYYY-MM-DD DIRECTIVE SUBJECT "Optional title"
  key: value
  ---
  Optional Markdown body
  ---
```

Metadata and bodies are indented with two spaces. See [directives](../language/directives.md) for the full list.

## View it locally

From the directory that contains `portfolio.nav`:

```bash
nav serve .
```

The Reader compiles facts and shows diagnostics. Diagnostics flag inconsistencies; they do not block opening the workspace.

## Next steps

- [Organize your repository](organize-your-repository.md)
- [Language overview](../language/overview.md)
- Repository [example](../../example/): `nav serve example`
