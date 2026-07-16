# Comments and bodies

Navor separates machine-readable structure from human narrative.

## Line comments

A comment occupies a full line and starts with `;`:

```nav
; Fund the US sleeve before first buy.
2026-01-03 txn Account:US "Deploy US cash"
  Assets:Cash:USD   60,000 USD
  Equity:Capital   -60,000 USD
```

Blank lines are ignored. Use comments for booking notes that are not investment facts.

## Markdown bodies

Optional bodies preserve Markdown without interpretation:

```nav
2026-04-30 review Asset:Equity:US:NVDA "Quarterly review"
  status: On Track
  action: Hold
  ---
  ## Evidence
  Data-center revenue grew 12% QoQ.

  ## Open questions
  - Export controls on next-gen chips
  ---
```

Rules:

- Opening and closing delimiter is `  ---` (two spaces, three hyphens).
- Every body line is indented with two spaces.
- Prefer bodies for narrative; prefer metadata for stable, filterable fields.

## Documentation style

- Write directives so a future reader understands **why**, not only **what**.
- Link decisions to theses with `based_on` and `decision` metadata rather than only in comments.
- When a view changes, add a new directive instead of editing an old one's date or subject.

## Related

- [Research and reasoning](research.md)
- [Reference: syntax](../reference/syntax.md)
