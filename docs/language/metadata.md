# Metadata

Metadata is key-value data indented under a directive. It carries structured fields; the Markdown body carries narrative context.

## Syntax

```nav
2026-01-02 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US
  symbol: NVDA
  target: 15%
  status: Active
```

Rules:

- Metadata lines begin with exactly two spaces.
- Keys match `[A-Za-z_][A-Za-z0-9_]*`.
- Values are non-empty text on the same line after `: `.

The parser preserves values as strings. Interpretation belongs to the engine and Reader.

## Common fields

| Field | Used on | Meaning |
| --- | --- | --- |
| `amount` | `capital` | Investable budget with commodity, e.g. `100,000 USD` |
| `base_currency` | `option` | Reporting currency |
| `timezone` | `option` | Workspace timezone |
| `fx_rates` | `option` | Static FX pairs, e.g. `CNY=7.00, HKD=7.84` |
| `account` | `open` (Asset) | Parent Account subject |
| `target` | `open`, `plan` | Weight target (`60%`, `15%`) |
| `symbol` | `open` (Asset) | Market ticker or identifier |
| `confidence` | `thesis` | Qualitative conviction |
| `invalid_if` | `thesis` | Condition that would falsify the thesis |
| `review_by` | `thesis` | Date to revisit |
| `action` | `decision`, `review` | Intended or resulting action |
| `target_weight` | `decision` | Intended portfolio weight |
| `based_on` | `thesis`, `decision` | Date of the preceding same-subject `research` or `thesis`; on the same date, the referenced record must appear earlier in source order. Add its quoted title only when the date is ambiguous. |
| `decision` | `txn` | Optional date of a prior same-subject `decision` directive |
| `source` | `research` | Where the observation came from |
| `tags` | `research` | Comma-separated labels |

This is not an exhaustive schema. New keys are allowed when they express facts clearly.

## Targets and derivation

Account `target` is portfolio-level. Asset `target` is relative to its parent Account. Whole-portfolio asset weight is **derived** from both; do not store it as a second source fact.

## Related

- [Directives](directives.md)
- [Portfolio](portfolio.md)
- [Reference: syntax](../reference/syntax.md)
