# Navor

Navor is a plain-text language and toolchain for recording investment knowledge, portfolio policy, decisions, transactions, and reviews. A workspace is reviewable in Git, rendered locally in Navor Reader, and exportable as a static site.

Its text format follows the durable parts of Beancount: dated directives, indented metadata, postings, comments, and append-only history. Navor is not a Beancount dialect or an accounting replacement. Research, theses, decisions, reviews, and journals are first-class facts.

[中文文档](README.zh.md)

## Install

Navor requires Node.js 22.14 or later.

```bash
npm install --global @navor/cli
nav serve ./portfolio
nav build ./portfolio --out ./site
```

From a source checkout:

```bash
pnpm install
pnpm build
pnpm build:example
```

## Minimal workspace

```nav
2026-01-01 open Account:US "US equities"
  target: 100%

2026-01-01 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US

2026-01-02 thesis Asset:Equity:US:NVDA "Compute demand"
  confidence: Medium
  ---
  Revisit the thesis after earnings.
  ---
```

## Documentation

Start at the [documentation home](docs/README.md): concepts, getting started, language reference, booking cookbook, then operations and maintainer notes.

## Commands

- `nav serve <workspace> [--port <port>]` starts the local Reader.
- `nav build <workspace> --out <dir> [--fetch-prices]` writes a static site.

## Data boundary

Navor does not upload a workspace or require an account. Live prices are optional enrichment. When you deploy a price proxy, it sends requested symbols to its configured provider. Read [market data and privacy](docs/operations/market-data-and-privacy.md) before exposing a proxy.

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing a change. Report vulnerabilities through [SECURITY.md](SECURITY.md), not a public issue.
