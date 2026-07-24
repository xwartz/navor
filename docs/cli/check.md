# nav check

Validate every `.nav` file in a workspace without building a site or changing source.

```bash
nav check <workspace>
```

The command prints parser and semantic diagnostics as `file:line: message`. It exits with status `1` when any diagnostic is present and `0` when the workspace is clean.

Use `nav check` after recording facts and in CI. Use [`nav format --check`](format.md) separately to enforce formatting.
