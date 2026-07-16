# Navor

Syntax highlighting and formatting for [Navor](https://github.com/xwartz/navor) `.nav` files. Navor is an open specification for investment state: accounts, assets, research, theses, decisions, and transactions as human-readable documents.

## Features

- Syntax highlighting for dates, directives, subjects, titles, metadata, postings, comments, and Markdown bodies
- Format Document and format-on-save (posting column alignment, indent, blank lines between directives)
- Does **not** reorder directives or rewrite number literals

## Install

### From GitHub Release (recommended)

Download `navor-*.vsix` from the [latest Release](https://github.com/xwartz/navor/releases/latest), then:

```bash
cursor --install-extension ./navor-0.1.1.vsix
# or
code --install-extension ./navor-0.1.1.vsix
```

Or Command Palette → **Extensions: Install from VSIX…**.

Extension id: `navor.navor`.

## Format on save

Add to your settings (User or Workspace):

```json
{
  "[navor]": {
    "editor.defaultFormatter": "navor.navor",
    "editor.formatOnSave": true
  }
}
```

Or run **Navor: Format Document** from the Command Palette.

## CLI

The same formatter is available from the Navor CLI:

```bash
nav format ./portfolio
nav format ./portfolio --check
```

See the [Navor documentation](https://github.com/xwartz/navor/blob/main/docs/README.md).

## License

Apache-2.0
