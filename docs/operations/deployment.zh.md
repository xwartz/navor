# 部署

把投资仓库编译成静态 Navor Reader 站点，构建命令见 [`nav build`](../cli/build.zh.md)。

`nav build` 会把结果写到 `--out`，默认只编译工作区里的事实，不去拉行情。

```bash
nav build portfolio --out dist/site
```

上传生成目录，包含 `index.html`、`assets/`、`navor-data.json`、
`manifest.webmanifest` 与 `sw.js`。

## 可安装、离线可读的 Reader

每次静态构建都带有可安装的 PWA。访问者首次打开站点后，可将 Reader
安装到设备；浏览器会离线保留 Reader 外壳和该次构建的 `navor-data.json`。
后续部署由浏览器激活新的 Service Worker 后更新已安装站点。

浏览器不会缓存实时行情请求。离线 Reader 使用构建时写入的价格快照；没有
快照时，沿用现有的缺失或过期状态提示。
若离线时无法访问可选的 Google Fonts，Reader 会使用已有的系统字体回退。

PWA 存储会将已部署的投资快照持久保留在访问者设备上。只应向允许保留这些
数据的受众发布站点；安装 PWA 不会把公开部署变成私密站点。用户可通过浏览器
的网站数据设置删除该快照。

## 实时行情

托管 Reader 向同源的 `POST /api/prices` 请求行情，从 [`deploy/`](../../deploy/README.zh.md) 复制对应模板，函数需能访问 `@navor/adapters`。

### Vercel

1. 将输出目录设为静态构建目录，例如 `dist/site`。
2. 将 `deploy/vercel/api/prices.ts` 复制为 `api/prices.ts`。
3. 若客户端路由需要 SPA fallback，一并复制 `deploy/vercel/vercel.json`。

### Cloudflare Pages

1. 将构建输出目录设为静态构建目录。
2. 将 `deploy/cloudflare/functions/api/prices.ts` 复制到项目根下的 `functions/api/prices.ts`。
3. 一并部署静态输出与函数。

本仓库的公开演示站见 [`apps/demo`](../../apps/demo/)，构建 [`example/`](../../example/) 到 `apps/demo/dist` 并附带价格代理，在 monorepo 根目录：

```bash
pnpm build
pnpm build:demo
pnpm --filter @navor/demo deploy
```

## 构建时快照

```bash
nav build portfolio --out dist/site --fetch-prices
```

托管站点宜用同源代理以便不重建即可刷新行情，部署代理前请阅读[行情数据与隐私](market-data-and-privacy.zh.md)。
