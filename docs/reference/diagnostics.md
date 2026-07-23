# Diagnostics

The semantic engine reports issues that need review. Diagnostics do **not** prevent a workspace from being read or rendered.

## Parse errors

Malformed lines fail parsing:

- Invalid date or directive line
- Wrong indent on metadata or posting
- Unclosed body delimiter
- Invalid posting shape

Fix the line shape per [syntax](syntax.md).

## Semantic checks (0.1)

| Condition | Meaning |
| --- | --- |
| Asset references unopened Account | `account:` metadata points to an Account without `open` |
| `plan` references unknown subject | Account or Asset not opened |
| `txn` subject not open | Transaction on closed or unknown Asset/Account |
| Account `txn` includes holding posting | Cash events must not move asset holdings |
| Asset `txn` missing holding posting | Asset trade needs matching `Assets:Equity:...` line (except cash/income/expense-only events) |
| date-scoped relationship is unresolved or ambiguous | A `based_on` or `txn.decision` date cannot uniquely resolve within the same subject |

## What diagnostics are not

- Tax or accounting audit
- Double-entry balance enforcement
- Investment advice

The parser accepts postings syntactically without enforcing commodity consistency or balanced books.

## Workflow

1. Edit `.nav` files
2. Run `nav serve` or compile in CI
3. Read diagnostics in the Reader or build output
4. Fix source facts; do not patch derived JSON

## Related

- [Transactions](../language/transactions.md)
- [Syntax](syntax.md)
