# AI assistant skills

Navor skills help an AI assistant work with a local investment workspace. They are portable `SKILL.md` workflows, not a hosted Navor service.

## Available skills

| Skill | Use it for | Default access |
| --- | --- | --- |
| `navor-onboard` | Creating or organizing a workspace from facts you provide | Writes only after confirming the proposed records |
| `navor-record` | Recording research, a thesis, a decision, a transaction, a review, or a journal entry | Writes only after showing the record when the instruction is ambiguous |
| `navor-review` | Checking recorded process, follow-through, and Navor diagnostics | Read-only |

Install the collection with `npx skills add xwartz/navor`, then choose the skills and agent interactively, or use the commands in [installation](installation.md).

## Boundaries

- Skills operate on the local workspace you place in scope. They do not upload it or require a Navor account.
- They do not fetch prices, news, or other market data unless you separately ask the assistant to do so.
- They organize and check recorded facts. They do not provide investment, legal, tax, or accounting advice, and they never place trades.
- Source `.nav` files remain authoritative. Market values, PnL, portfolio views, and Reader JSON are derived outputs and must not be edited as source facts.
