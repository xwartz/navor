# Syntax reference

Facts only. Version 0.1. For tutorials see [language](../language/overview.md).

## File and workspace

- Extension: `.nav`
- Encoding: UTF-8
- A workspace is a directory tree; all `.nav` files are merged

## Directive line

```nav
YYYY-MM-DD DIRECTIVE SUBJECT "Title"
```

- `DIRECTIVE` and `SUBJECT` are required
- `Title` is optional; cannot contain `"`
- First line of a directive is not indented

## Metadata

```nav
  key: value
```

- Exactly two leading spaces
- Key: `[A-Za-z_][A-Za-z0-9_]*`
- Value: non-empty text after `: `

## Postings

```nav
  Assets:Equity:US:NVDA  10 NVDA @ 900 USD
```

Form: `ACCOUNT_PATH QUANTITY COMMODITY [@ PRICE CURRENCY]`

## Body

```nav
  ---
  Markdown content
  ---
```

Opening and closing `  ---` required when a body is present. Body lines use two-space indent.

## Directives (0.1)

`option`, `capital`, `open`, `close`, `plan`, `research`, `thesis`, `decision`, `txn`, `review`, `journal`, `note`

## Subjects

Colon-separated paths: `Portfolio:Core`, `Account:US`, `Asset:Equity:US:NVDA`

No fixed taxonomy beyond documented semantics.

## Comments

Full-line comments start with `;`. Blank lines ignored.

## Parser vs semantics

The parser reports malformed directive, metadata, posting, indentation, and body-delimiter lines. The semantic engine adds booking rules; see [diagnostics](diagnostics.md).

## Derived data

Holdings, allocation, PnL, and Reader views are derived. Price and FX are optional enrichment.

## Related

- [Grammar](grammar.md)
- [Directives](../language/directives.md)
