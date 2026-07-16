# nav build

Compile a workspace and write a static site.

```bash
nav build <workspace> --out <dir> [--fetch-prices]
```

## Options

| Option | Description |
| --- | --- |
| `--out` | Output directory (required) |
| `--fetch-prices` | Snapshot live prices at build time |

## Example

```bash
nav build portfolio --out dist/site
nav build example --out dist/site --fetch-prices
```

Output includes `index.html`, browser assets, and `navor-data.json`.

## Default behaviour

Without `--fetch-prices`, the build contains workspace facts only. No market-data provider is called.

With `--fetch-prices`, prices are embedded as a build-time snapshot.

## Hosted sites with live prices

A hosted Reader can request prices from `POST /api/prices` on the same origin. Copy a template from [`deploy/`](../../deploy/README.md) and read [deployment](../operations/deployment.md).

## Related

- [Deployment](../operations/deployment.md)
- [Market data and privacy](../operations/market-data-and-privacy.md)
