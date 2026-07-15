# 部署

`nav build` 将静态站点写入 `--out`。默认只编译工作区事实，不调用行情提供方。

```bash
nav build portfolio --out dist/site
```

上传生成目录，包含 `index.html`、`assets/` 与 `navor-data.json`。

## 实时行情

托管 Reader 向同源的 `POST /api/prices` 请求行情。从 [`deploy/`](../../deploy/README.zh.md) 复制对应模板；函数需能访问 `@navor/adapters`。

### Vercel

1. 将输出目录设为静态构建目录，例如 `dist/site`。
2. 将 `deploy/vercel/api/prices.ts` 复制为 `api/prices.ts`。
3. 若客户端路由需要 SPA fallback，一并复制 `deploy/vercel/vercel.json`。

### Cloudflare Pages

1. 将构建输出目录设为静态构建目录。
2. 将 `deploy/cloudflare/functions/api/prices.ts` 复制到项目根下的 `functions/api/prices.ts`。
3. 一并部署静态输出与函数。

本仓库的公开演示站见 [`apps/demo`](../../apps/demo/)：构建 [`example/`](../../example/) 到 `apps/demo/dist`，并附带价格代理。在 monorepo 根目录：

```bash
pnpm build
pnpm build:demo
pnpm --filter @navor/demo deploy
```

## 构建时快照

```bash
nav build portfolio --out dist/site --fetch-prices
```

托管站点宜用同源代理，以便不重建即可刷新行情。部署代理前阅读[行情数据与隐私](market-data-and-privacy.zh.md)。
