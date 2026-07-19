# Deployment

Publish a static Navor Reader site from your investment repository. For the build command, see [`nav build`](../cli/build.md).

`nav build` writes a static site to `--out`. By default it compiles workspace facts and does not call a market-data provider.

```bash
nav build portfolio --out dist/site
```

Upload the generated directory, including `index.html`, `assets/`, `navor-data.json`,
`manifest.webmanifest`, and `sw.js`.

## Installable offline Reader

Every static build is an installable PWA. After a visitor opens the site once,
the browser can install it and keep the Reader shell plus that build's
`navor-data.json` available offline. A later deployment updates the installed
site when the browser activates its new service worker.

The browser does not cache live-price requests. Offline Reader uses the prices
embedded at build time, or shows the existing unavailable/stale price state.
The Reader uses its system-font fallback when the optional Google Fonts cannot
be reached offline.

PWA storage persists a deployed investment snapshot on a visitor's device.
Only publish sites that audience is allowed to retain; installing a PWA does not
make a public deployment private. Users can remove the snapshot through their
browser's site-data controls.

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
