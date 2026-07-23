# Navor

**An open specification for representing investment state as human-readable documents.**

Navor is a plain-text language and toolchain for investment knowledge, portfolio plans, decisions, transactions, and reviews. A repository is reviewable in Git, readable in the local Navor Reader, and exportable as a static site.

Research, theses, decisions, reviews, and journals are first-class facts alongside holdings. The portfolio is derived; reasoning is the source of truth.

[中文文档](README.zh.md) · [Manifesto](docs/manifesto.md) · [Documentation](docs/README.md)

## Install

Node.js 22.14 or later.

```bash
npm install --global @navor/cli
nav serve example
```

From source:

```bash
pnpm install && pnpm build
nav serve example
```

## Minimal example

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

## Commands

| Command | Purpose |
| --- | --- |
| `nav serve <workspace>` | Local Reader (`<workspace>` is the repository path) |
| `nav build <workspace> --out <dir>` | Static site |
| `nav format <path> [--check]` | Format `.nav` files |

Editor highlighting and format-on-save: [`extensions/vscode`](extensions/vscode/). Install `navor-*.vsix` from [Releases](https://github.com/xwartz/navor/releases/latest).

## AI skills

Install Navor's portable Agent Skills for Codex, Cursor, Claude Code, or another supported agent:

```bash
npx skills add xwartz/navor --list
npx skills add xwartz/navor --skill '*' --agent codex
```

Add `--global` to make them available across projects. See [AI assistant skills](docs/getting-started/ai-skills.md) for the available skills and privacy note.

## Data boundary

Navor does not upload a repository or require an account. Live prices are optional enrichment. Read [market data and privacy](docs/operations/market-data-and-privacy.md) before exposing a price proxy.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Report security issues via [SECURITY.md](SECURITY.md).
