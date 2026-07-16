# Developing the Navor VS Code extension

For end-user install instructions, see [README.md](README.md).

## Local install (this monorepo)

```bash
pnpm link:vscode
```

Then **Developer: Reload Window**. This symlinks `extensions/vscode` into `~/.cursor/extensions/navor.navor-<version>`. Prefer this over **Install from Location**.

## Keep the formatter in sync

`format.cjs` is a CommonJS port of `@navor/core` `formatNavor`. After changing `packages/core/src/format.ts`, update `format.cjs` and run:

```bash
pnpm bundle:vscode
```

## Package a VSIX

```bash
pnpm package:vscode
# → extensions/vscode/navor-*.vsix
```

## Distribution

On each `v*` tag, [`.github/workflows/release.yml`](../../.github/workflows/release.yml) runs `pnpm package:vscode` and attaches the `.vsix` to the GitHub Release. That is the default way to share the extension without Marketplace / Open VSX.

Optional later: publish the same `.vsix` with `vsce publish` / `ovsx publish` if you want in-editor search.
