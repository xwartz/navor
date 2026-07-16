# nav serve

Start the local Navor Reader for a workspace.

```bash
nav serve <workspace> [--port <port>]
```

## Options

| Option | Default | Description |
| --- | --- | --- |
| `--port` | `5173` | HTTP port for the Reader |

## Example

```bash
nav serve example
nav serve ./portfolio --port 3000
```

The CLI prints a URL when the server is ready. Open it in a browser.

## Behaviour

- Compiles all `.nav` files under the workspace.
- Shows semantic diagnostics in the UI; diagnostics do not block opening the workspace.
- May expose an optional same-origin price endpoint for local development.

## Stop the server

Press `Ctrl+C` in the terminal.

## Related

- [Getting started](../getting-started/your-first-nav.md)
- [Market data and privacy](../operations/market-data-and-privacy.md)
