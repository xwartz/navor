# CLI overview

The `nav` command-line tool validates and compiles a Navor workspace, serves the local Reader, builds static sites, and formats `.nav` source.

```bash
nav <serve|build|check|format> <workspace> [options]
```

## Commands

| Command | Purpose |
| --- | --- |
| [`serve`](serve.md) | Start the local Navor Reader |
| [`build`](build.md) | Write a static site to `--out` |
| [`check`](check.md) | Report parser and semantic diagnostics |
| [`format`](format.md) | Normalize `.nav` whitespace |

There is no `init` command yet. Create a directory and `.nav` files by hand or copy the [example](../../example/).

## Conventions

- `<workspace>` is a path to a directory of `.nav` files.
- Options use GNU-style `--flag` and `--name value` forms.
- Non-zero exit codes indicate usage errors, workspace diagnostics, or `format --check` failures.

## Install

See [installation](../getting-started/installation.md).

## Related

- [Deployment](../operations/deployment.md)
- [Editor support](../getting-started/editor-support.md)
