# nav format

Normalize whitespace in `.nav` files.

```bash
nav format <path> [--check]
```

`<path>` may be a single file or a directory (formatted recursively).

## Options

| Option | Description |
| --- | --- |
| `--check` | Report files that need formatting without writing; exit non-zero if any |

## Example

```bash
nav format portfolio
nav format portfolio --check
```

## What it does

- Normalizes indent
- Aligns posting columns
- Inserts blank lines between directives

## What it does not do

- Reorder directives
- Rewrite number literals
- Reflow Markdown bodies

Use format-on-save in the [editor](../getting-started/editor-support.md) for day-to-day editing. Use `--check` in CI.

## Related

- [Editor support](../getting-started/editor-support.md)
- [Reference: file format](../reference/file-format.md)
