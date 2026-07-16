# AI and Navor

LLMs are useful for investment questions only when they know your state. Navor gives them structured, human-readable context.

## The context problem

A model asked "should I buy X today?" does not know your position, targets, thesis, risk rules, or past mistakes. Generic answers follow.

A Navor repository encodes those facts as documents the model can read.

## What AI can do with a repository

- Summarize research and theses per asset
- Compare decisions to stated targets
- Flag a `decision` without a matching `txn`
- Challenge a thesis against new `research`
- Explain historical bookings from `txn` and bodies

No proprietary export or database scrape is required.

## Human first

If a file is not readable to you, it is not good AI context. Navor prioritizes human-readable directives over opaque embeddings.

## Reproducibility

Plain text in Git is reproducible: the same repository snapshot yields the same facts for you and for a model.

## Privacy

Navor does not upload your repository. You choose what to paste, commit, or deploy. Read [market data and privacy](../operations/market-data-and-privacy.md) before exposing a hosted site or proxy.

## Related

- [Manifesto](../manifesto.md)
- [Plain text](plain-text.md)
