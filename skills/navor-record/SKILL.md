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
6. Run `nav format <affected path>` and report parse or semantic diagnostics. Never patch derived output such as Reader JSON to hide a source diagnostic.

## Boundaries

- Record user-supplied facts and clearly label any drafted wording as a draft; do not manufacture prices, sources, holdings, or a rationale.
- Keep `decision` distinct from `txn`; a planned action is not execution.
- Do not fetch market data, send data outside the local workspace, place trades, or provide investment, legal, tax, or accounting advice.
