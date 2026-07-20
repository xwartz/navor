---
name: navor-review
description: Read and audit a Navor investment workspace against its own recorded facts. Use when reviewing a portfolio, checking thesis and decision follow-through, finding overdue reviews or Navor diagnostics, or preparing an evidence-based investment-process summary. Read-only by default; do not use to create records.
---

# Navor Review

Review the repository's documented process, not the market or the user's financial decisions.

## Workflow

1. Read the workspace recursively and identify portfolio settings, Accounts, Assets, and activity files. Run the available Navor compile or Reader diagnostic path without changing source.
2. Build findings from source evidence only. Cite each finding with the `.nav` path and directive date or title.
3. Report findings in three groups:

   - **Data integrity:** parse and semantic diagnostics, unknown subjects, malformed transaction shapes, or decisions with no matching transaction.
   - **Process follow-through:** `review_by` dates already past relative to the current date, theses lacking `invalid_if`, decisions lacking recorded execution, and reviews or journals that explain a change.
   - **Portfolio policy:** recorded Account/Asset targets, plans, and derived-vs-source distinctions. Do not treat derived market values or live prices as source facts.

4. Separate confirmed facts from inferences. Say when the repository lacks enough information to determine an outcome.
5. Stay read-only. If the user asks to turn a finding into a `review`, `decision`, or other record, hand off to `navor-record` and present a draft first.

## Boundaries

- Do not fetch live market data, use external news, upload workspace data, or expose local paths beyond the user's task context.
- Do not give buy, sell, legal, tax, accounting, or personalized investment advice. Explain the user's recorded rules and their consistency only.
