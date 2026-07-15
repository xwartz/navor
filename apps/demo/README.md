# Navor demo site

Cloudflare Pages app that builds the repository [`example/`](../../example/) workspace and serves it with a same-origin `/api/prices` proxy.

```bash
pnpm build
pnpm --filter @navor/demo build
pnpm --filter @navor/demo preview   # optional local Pages + Functions
pnpm --filter @navor/demo deploy    # requires Cloudflare auth
```

For Git-connected Pages, set the project root directory to `apps/demo`, build command to `cd ../.. && pnpm install --frozen-lockfile && pnpm build && pnpm --filter @navor/demo build`, and output directory to `dist`.

Read [deployment](../../docs/operations/deployment.md) and [market data and privacy](../../docs/operations/market-data-and-privacy.md) before exposing live prices.
