# Editor support

Navor is plain text first. Any editor works. For `.nav` files, the repository ships a VS Code / Cursor extension with syntax highlighting and formatting.

## Install the extension

### From GitHub Release (recommended)

Each [GitHub Release](https://github.com/xwartz/navor/releases/latest) attaches `navor-*.vsix`.

```bash
cursor --install-extension ./navor-0.1.1.vsix
# or
code --install-extension ./navor-0.1.1.vsix
```

Or use Command Palette → **Extensions: Install from VSIX…**.

Extension id: `navor.navor`.

### From a source checkout

```bash
pnpm install
pnpm build
pnpm link:vscode
```

See [`extensions/vscode`](../../extensions/vscode/) for development details.

## Features

- Syntax highlighting for dates, directives, subjects, titles, metadata, postings, comments, and Markdown bodies
- **Format Document** and format-on-save: posting column alignment, indent, blank lines between directives
- Does **not** reorder directives or rewrite number literals

## Format on save

Add to User or Workspace settings:

```json
{
  "[navor]": {
    "editor.formatOnSave": true
  }
}
```

## Format from the CLI

```bash
nav format portfolio
nav format portfolio --check
```

`nav format` normalizes whitespace. Use `--check` in CI; it exits non-zero when files need formatting.

## Next steps

- [CLI: format](../cli/format.md)
- [Language: comments](../language/comments.md)
