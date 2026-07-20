---
name: navor-onboard
description: Create or organize a Navor investment workspace from facts the user explicitly provides. Use when setting up a new portfolio, importing an existing plain-text investment record, or choosing where to record accounts, assets, capital, and historical activity. Do not use for a single new event; use navor-record instead.
---

# Navor Onboard

Create a small, reviewable Navor workspace without inventing financial facts.

## Workflow

1. Inspect the target directory. Reuse existing `.nav` files and `navor.config.json`; do not overwrite a workspace without explicit approval.
2. Collect only missing source facts: reporting currency, account sleeves, assets and their parent Accounts, capital (if known), and dated records. Keep unknown quantities, prices, and dates absent rather than guessing.
3. Use the standard layout when creating a workspace:

   ```text
   portfolio.nav
   accounts/
   assets/
   activity/
   ```

4. Create `option` and `capital` records in `portfolio.nav`, open Accounts before their Assets, and store dated research, theses, decisions, transactions, reviews, and journals under `activity/`.
5. Keep source facts separate from derived views. Account `target` is portfolio-level; Asset `target` is relative to its parent Account. Never write a computed whole-portfolio asset weight, market value, PnL, or Reader JSON into `.nav` source.
6. Present the proposed file tree and records before writing when the task requires choosing facts or resolving ambiguity. After an approved write, run `nav format <workspace>` and report any parse or semantic diagnostics.

## Record boundaries

- Use `research` for attributed observations, `thesis` for a falsifiable view, `decision` for intent, and `txn` only for an executed economic event.
- Preserve history: append a new directive when a view changes; do not rewrite a past thesis or transaction to make the present look cleaner.
- Do not request credentials, fetch live prices, upload a repository, or offer investment, legal, tax, or accounting advice.
