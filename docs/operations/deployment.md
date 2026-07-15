# Deployment

`nav build` writes a static site to `--out`. By default it compiles workspace facts and does not call a market-data provider.

```bash
nav build portfolio --out dist/site
```

Upload the generated directory, including `index.html`, `assets/`, and `navor-data.json`.

## Live prices

The hosted Reader requests prices from `POST /api/prices` on the same origin. Copy the matching template from [`deploy/`](../../deploy/README.md). The function needs access to `@navor/adapters`.

### Vercel

1. Set the output directory to the static build directory, such as `dist/site`.
2. Copy `deploy/vercel/api/prices.ts` to `api/prices.ts`.
3. Copy `deploy/vercel/vercel.json` if client-side routing needs an SPA fallback.

### Cloudflare Pages

1. Set the build output directory to the static build directory.
2. Copy `deploy/cloudflare/functions/api/prices.ts` to `functions/api/prices.ts` at the project root.
3. Deploy the static output and the function together.

For this repository's public demo, use [`apps/demo`](../../apps/demo/): it builds [`example/`](../../example/) into `apps/demo/dist` and ships the price proxy. From the monorepo root:

```bash
pnpm build
pnpm build:demo
pnpm --filter @navor/demo deploy
```

## Build-time snapshot

```bash
nav build portfolio --out dist/site --fetch-prices
```

Prefer the same-origin proxy on hosted sites so prices can refresh without a rebuild. Read [market data and privacy](market-data-and-privacy.md) before deploying the proxy.
