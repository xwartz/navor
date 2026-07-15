# Navor documentation

Top-level index for Navor. Start with the user documents, then the cookbook when recording common cases.

## Documentation for users

- [Core concepts](guide/concepts.md): what Navor records, how it relates to Beancount, and the boundary between source facts and derived views.
- [Getting started](guide/getting-started.md): create a workspace, organize files, open accounts and assets, and open the local Reader.
- [Language reference](guide/language.md): syntax, directives, postings, and semantic diagnostics. Main reference for the `.nav` language.
- [Example workspace](../example/): a multi-account sample you can serve with `nav serve example`.

## Cookbook and examples

- [Booking guide](cookbook/booking.md): how to record funding, buys, sells, dividends, targets, and reviews.

## Operations

- [Market data and privacy](operations/market-data-and-privacy.md): optional price and FX enrichment, and what a hosted proxy forwards.
- [Deployment](operations/deployment.md): host a static site and configure a same-origin price proxy. The repository demo app is [`apps/demo`](../apps/demo/).

## Documentation for maintainers

- [Release process](maintainers/releasing.md): publishing and release verification.
- [Contributing](../CONTRIBUTING.md): how to propose changes.
- [Reader UI design](../DESIGN.md): visual and interaction rules for the Reader.

[中文](README.zh.md)
