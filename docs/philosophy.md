# Philosophy

This page explains **why Navor is designed the way it is**. For motivation, read the [manifesto](manifesto.md). For syntax, read the [language](language/overview.md) section.

## Plain text first

Documents should outlive applications. Navor source is `.nav` plain text. You can read it in any editor, diff it in Git, and archive it without a running service.

## Human readable

A human should understand every `.nav` file without special software. Dates, directives, subjects, metadata, and Markdown bodies are written for readers first. Tools parse what people can already read.

## AI friendly

Readable documents naturally become better AI context. Structured facts (thesis, decision, transaction) sit beside narrative bodies. An LLM can reason over the same file you review in Git.

## Git native

Investment decisions evolve. Evolution deserves version history. Append new directives when views change. Do not rewrite old records to make the present look cleaner.

## Specification before implementation

The language is the product. Applications are implementations. The documented `.nav` language, `nav` CLI, Reader output, and static-site format are the public surface. `@navor/*` packages support the CLI; their import APIs are unstable unless separately documented.

## Small core

Keep the language simple. Move complexity into tooling. Navor 0.1 has twelve directives. Prefer metadata on an existing directive over a new directive when it expresses the same fact.

## Facts before commands

Source records what happened or what the author decided. It does not place orders, run strategies, or treat a live market quote as a source fact.

## Source before enrichment

`.nav` files hold user-confirmed facts. The engine derives holdings, values, PnL, allocation, and drift. Price and FX providers may enrich those views. Missing or stale provider data must not block reading or rendering.

## Beancount-shaped, not Beancount-compatible

Navor uses plain text, dated records, indented metadata, postings, comments, deterministic parsing, and Git review. It does not parse `.bean` files or reproduce Beancount's accounting model. `research`, `thesis`, `decision`, `review`, `journal`, and `note` are native investment-process facts.

## Compatibility

Navor is pre-1.0. A breaking syntax or semantic change needs a changelog entry, migration guidance, fixtures, and diagnostics. Version 1.0 requires SemVer stability for the documented language and CLI.
