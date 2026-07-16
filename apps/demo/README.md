# Navor demo site

Public demo for [Navor](https://github.com/xwartz/navor): an open specification for investment state as human-readable `.nav` documents.

Cloudflare Pages app that builds the repository [`example/`](../../example/) workspace and serves it with a same-origin `/api/prices` proxy.

```bash
pnpm build
pnpm --filter @navor/demo build
pnpm --filter @navor/demo preview   # optional local Pages + Functions
pnpm --filter @navor/demo deploy    # requires Cloudflare auth
```

For Git-connected Workers Builds, set the path to `apps/demo`, build command to `cd ../.. && pnpm install --frozen-lockfile && pnpm build && pnpm --filter @navor/demo build`, deploy command to `npx wrangler deploy`, and non-production deploy command to `npx wrangler versions upload`.

Read [deployment](../../docs/operations/deployment.md) and [market data and privacy](../../docs/operations/market-data-and-privacy.md) before exposing live prices.
