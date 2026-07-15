# Core concepts

Navor records durable investment facts and derives views from them.

## Beancount-shaped, not Beancount-compatible

Navor uses plain text, dated records, indented metadata, postings, comments, deterministic parsing, and Git review. It does not parse `.bean` files or reproduce Beancount's accounting model.

Investment-process facts are native: `research`, `thesis`, `decision`, `review`, `journal`, and `note`.

## Facts before commands

Source records what happened or what the author decided. It does not place orders, run strategies, or treat a live market quote as a source fact. Extend history with new directives; do not rewrite old ones to hide prior decisions.

## Source before enrichment

`.nav` files hold user-confirmed facts. The engine derives holdings, values, PnL, allocation, and drift. Price and FX providers may enrich those views. Missing or stale provider data must not block reading or rendering.

An Asset `target` is relative to its parent Account. Whole-portfolio weight is derived from Account and Asset targets; do not store it as a second source fact.

## Stable public surface

The documented `.nav` language, `nav` CLI, Reader output, and static-site format are public interfaces. `@navor/*` packages support the CLI; their import APIs are unstable unless separately documented.

## Compatibility

Navor is pre-1.0. A breaking syntax or semantic change needs a changelog entry, migration guidance, fixtures, and diagnostics. Version 1.0 requires SemVer stability for the documented language and CLI.
