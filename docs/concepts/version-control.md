# Version control

Investment decisions evolve. Version control records that evolution.

## Why Git

Git provides history, diff, blame, branches, and review for plain-text files. A changed thesis or a new transaction is visible as a patch, not hidden in a database revision.

```bash
git diff
git log -- portfolio.nav activity/
```

## Append-only discipline

Navor is append-only by convention: add directives when facts or views change. Rewriting old dates or deleting prior theses breaks auditability and confuses derived views.

## Review workflow

Treat meaningful changes like code review:

- Open a branch for a large rebalance or thesis rewrite.
- Read diagnostics after editing (`nav serve` or CI).
- Use `nav format --check` to keep formatting consistent.

## Long-term maintenance

Your broker export from 2019 and your thesis from 2024 can live in the same repository. Git tags can mark tax years or major strategy shifts.

## Related

- [Investment repository](investment-repository.md)
- [Philosophy](../philosophy.md)
