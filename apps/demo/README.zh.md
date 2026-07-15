# Navor 演示站

Cloudflare Pages 应用：构建仓库内 [`example/`](../../example/) 工作区，并通过同源 `/api/prices` 代理提供实时行情。

```bash
pnpm build
pnpm --filter @navor/demo build
pnpm --filter @navor/demo preview   # 可选：本地 Pages + Functions
pnpm --filter @navor/demo deploy    # 需要 Cloudflare 登录
```

若使用 Git 连接的 Pages：项目根目录设为 `apps/demo`，构建命令为 `cd ../.. && pnpm install --frozen-lockfile && pnpm build && pnpm --filter @navor/demo build`，输出目录为 `dist`。

公开实时行情前，请阅读[部署](../../docs/operations/deployment.zh.md)与[行情数据与隐私](../../docs/operations/market-data-and-privacy.zh.md)。
