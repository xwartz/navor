# Reasoning

Positions answer **what** you own. Reasoning answers **why**.

Navor models the chain that produces a portfolio:

```text
Research
    ↓
Thesis
    ↓
Decision
    ↓
Transaction
    ↓
Portfolio (derived)
```

## Research is evidence

`research` captures external facts before you form a view. It should be attributable (`source`) and revisitable.

## Thesis is a falsifiable view

`thesis` states what you believe and what would prove you wrong (`invalid_if`). Without this, a position is just a number.

## Decision is intent

`decision` records what you intended to do, when, and on what basis. Execution is recorded separately in `txn`.

## Transaction is execution

`txn` is the economic fact: shares bought, cash moved, fees paid.

## Portfolio is derived

Holdings and weights are computed from transactions and targets. They are not the authoritative record of your thinking.

## Append-only evolution

When your view changes, add a new `thesis`, `decision`, or `review`. Keep older directives so Git history shows how thinking evolved.

## Related

- [Research and reasoning](../language/research.md)
- [Manifesto](../manifesto.md)
