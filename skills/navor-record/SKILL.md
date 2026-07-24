---
name: navor-record
description: Turn user-provided investment facts into valid Navor .nav records. Use when recording research, a thesis, decision, executed transaction, review, journal entry, or correction in an existing Navor workspace. Do not use for portfolio-wide setup or read-only analysis.
---

# Navor Record

Record facts faithfully and make the smallest valid change to an existing Navor workspace.

## Workflow

1. Locate the workspace and read the relevant `.nav` files before drafting anything. Confirm the subject already exists when adding asset- or account-level activity.
2. Classify the user-provided fact before writing:

   | Fact | Directive |
   | --- | --- |
   | Observed source material | `research` |
   | Falsifiable view | `thesis` |
   | Intended action | `decision` |
   | Executed trade, fee, dividend, or cash movement | `txn` |
   | Assessment after time or an event | `review` |
   | Behaviour or process note | `journal` |

3. Ask for a missing date, subject, transaction quantity/commodity, or price instead of inferring it. For an Asset transaction, use the matching `Assets:...` holding posting; for an Account cash deployment, do not include an asset-holding posting.
4. Show the exact proposed directive and destination file before changing source when the request is not already an unambiguous instruction to write it.
5. Append the approved record. Do not modify or delete historical records merely because a thesis, target, or decision has changed.
6. Run `nav format <affected path>`, then run the available Navor compile or Reader diagnostic path. Do not finish until the affected workspace has zero parse diagnostics. Report any remaining semantic diagnostics separately. Never patch derived output such as Reader JSON to hide a source diagnostic.

## Exact line shapes

Treat whitespace and punctuation as syntax. Use ASCII spaces and punctuation only:

```nav
YYYY-MM-DD research Asset:Type:Market:SYMBOL "Title"
  source: Source name
  tags: TagA,TagB
  ---
  Markdown body.
  ---
```

- Directive lines start at column 1 with no indentation.
- Metadata, postings, body delimiters, and every body line start with exactly two ASCII spaces.
- Both body delimiters are exactly `  ---`; never write `---`, ` ---`, or leave the body unclosed.
- Use `: ` in metadata, not the full-width `：`. Quote titles containing spaces. Never indent with tabs or full-width spaces.

Before writing, inspect the proposed directive line by line. After writing, re-read the exact saved lines; rendered Markdown can conceal a missing space.

## Validation gate

Formatting is not validation. `nav format <affected path>` can normalize whitespace but does not prove that the parser accepted every line.

1. Format the affected path.
2. Run the workspace's existing Navor compile or Reader diagnostic command.
3. If only `nav build` is available, build to a temporary output directory and inspect `navor-data.json` under `workspace.diagnostics`.
4. Fix source and repeat until there are zero parse diagnostics. Remove temporary output afterward.

Do not report success when diagnostics include malformed directives, metadata, postings, indentation, or an unclosed body.

## Boundaries

- Record user-supplied facts and clearly label any drafted wording as a draft; do not manufacture prices, sources, holdings, or a rationale.
- Keep `decision` distinct from `txn`; a planned action is not execution.
- Do not fetch market data, send data outside the local workspace, place trades, or provide investment, legal, tax, or accounting advice.
