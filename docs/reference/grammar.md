# Grammar

Navor 0.1 does not publish a separate BNF grammar document. The **canonical grammar** is the behaviour of the open-source parser in `@navor/core`, exercised by fixtures under `fixtures/` and `test/`.

## Informal structure

A workspace is a sequence of **directives**. Each directive:

```text
DATE DIRECTIVE SUBJECT ["TITLE"]
  METADATA*
  POSTING*
  BODY?
```

Where:

- `DATE` is `YYYY-MM-DD`
- `DIRECTIVE` is one of twelve keywords (see [syntax](syntax.md))
- `SUBJECT` is a colon-separated identifier
- `METADATA` is `  key: value`
- `POSTING` is `  Account:Path  quantity COMMODITY [@ price CURRENCY]`
- `BODY` is optional, delimited by `  ---` lines

Lines whose first non-whitespace character is `;` are comments. Blank lines are ignored.

## TextMate grammar

Syntax highlighting uses `extensions/vscode/syntaxes/navor.tmLanguage.json`. It lists the same twelve directive keywords as the parser.

## Related

- [Syntax](syntax.md)
- [Diagnostics](diagnostics.md)
- [File format](file-format.md)
