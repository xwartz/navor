# Plain text

Navor stores investment state as plain text, not JSON, YAML, or a proprietary database.

## Why not JSON or YAML

Structured formats are easy for machines and awkward for humans. Investment knowledge mixes tables, narrative, and dated facts. Navor uses a line-oriented record format inspired by durable plain-text ledgers: dated directives, indented metadata, and optional Markdown bodies.

You can read a `.nav` file in any editor without schema tools.

## Longevity

Plain text survives application churn. Markdown survived two decades of tooling changes. Navor aims for the same property for investment state.

## Git-friendly

Line-based records diff cleanly. A changed thesis or transaction produces a reviewable patch.

## AI-friendly

LLMs read plain text well. Structured directives (`thesis`, `decision`, `txn`) sit in the same file as narrative bodies, so context stays in one place.

## Related

- [Philosophy](../philosophy.md)
- [Version control](version-control.md)
- [AI](ai.md)
