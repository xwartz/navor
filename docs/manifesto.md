# Navor Manifesto

> An open specification for modeling investment state.

## Why Navor?

Every investor accumulates knowledge over time. Research reports, market news, investment theses, decisions, reviews, and lessons learned. Over the years, this knowledge becomes your greatest asset.

Almost all of it lives in different applications:

- Your portfolio lives in your broker.
- Your research lives in Notion.
- Your notes live in Obsidian.
- Your watchlist lives in TradingView.
- Your conversations live in ChatGPT.
- Your journal lives in a notebook app.

**Your knowledge is fragmented.**

## The problem

Most investment software answers one question: **what do you own?**

Experienced investors care more about:

- Why do I own it?
- What is my investment thesis?
- What assumptions am I making?
- What evidence supports my thesis?
- What would make me change my mind?
- How has my thinking evolved over time?

There is no standard way to represent these questions.

## Portfolio is not the source of truth

Portfolio trackers treat positions as the source of truth. Navor does not.

A portfolio is a snapshot of past decisions. It tells you **what** you own, not **why**. A position without context is just a number. The real source of truth is the reasoning that produced it.

```text
Research
    ↓
Evidence
    ↓
Thesis
    ↓
Decision
    ↓
Transaction
    ↓
Portfolio
```

The portfolio is the result. Knowledge is the foundation.

## Investment is a state

Traditional tools model assets. Navor models investors.

An investor has goals, constraints, research, convictions, rules, reviews, decisions, and history. Together these form an **investment state** that evolves over time. Navor exists to represent that state.

## Objective and cognitive state

An investment state includes both measurable facts and subjective reasoning.

**Objective state:** holdings, transactions, cash, cost basis, allocation, performance.

**Cognitive state:** research, thesis, conviction, assumptions, risks, expectations, reviews, lessons learned.

Traditional software records the first. Navor records both.

## Why a language?

Documents have Markdown. Infrastructure has Terraform. Accounting has Beancount. APIs have OpenAPI. Investment knowledge has no open standard.

Every platform stores information in its own database. Your data gets locked inside applications. Your knowledge cannot move. Your AI cannot understand it. Your future tools cannot reuse it.

Navor introduces an open language for investment state.

## Plain text wins

Navor stores everything as plain text, not because plain text is fashionable, but because plain text survives. Twenty years from now you can still read a Markdown document and open a Git repository. Investment knowledge should have the same longevity.

Your broker will change. Your AI provider will change. Your software will change. Your knowledge should not.

## AI needs context

Large language models do not know your investment state. When you ask whether to buy a stock today, the model does not know your existing position, target allocation, thesis, risk tolerance, past mistakes, or principles.

Without context, every answer is generic. Navor provides that context. Instead of asking AI to infer your philosophy, you give it your Navor repository.

## Open by design

Navor is not an application, a portfolio tracker, or an AI assistant. It is an open specification. Anyone can build editors, portfolio apps, AI assistants, CLI tools, renderers, and analytics on the same language. No vendor lock-in. No proprietary database. Your investment knowledge belongs to you.

## Human first, AI native

Every `.nav` file should be understandable without special software. If a person cannot naturally read it, an AI should not generate it. Readability is a feature.

Because decisions are structured, human-readable documents, AI can understand your portfolio, review decisions, summarize research, detect inconsistencies, and challenge assumptions without reverse engineering proprietary databases.

## A shared language

Navor is not trying to replace your broker or your favorite notes app. It is trying to become the common language between them. Just as Markdown became the universal language for documents, Navor aims to become the universal language for investment state.

## Vision

Investment knowledge should be open, portable, versioned, human-readable, AI-readable, and independent of any platform. Software changes. Markets change. AI changes. Your knowledge should not.

## One sentence

> **Navor is an open specification for representing investment state as human-readable documents.**
