# Navor 演示站

[Navor](https://github.com/xwartz/navor) 的公开演示：用人类可读的 `.nav` 文档表达投资状态的开放规范。

Cloudflare Pages 应用，构建仓库内 [`example/`](../../example/) 工作区，并通过同源 `/api/prices` 代理提供实时行情。

```bash
pnpm build
pnpm --filter @navor/demo build
pnpm --filter @navor/demo preview   # 可选：本地 Pages + Functions
pnpm --filter @navor/demo deploy    # 需要 Cloudflare 登录
```

若使用 Git 连接的 Workers Builds：路径设为 `apps/demo`，构建命令为 `cd ../.. && pnpm install --frozen-lockfile && pnpm build && pnpm --filter @navor/demo build`，部署命令为 `npx wrangler deploy`，非生产分支部署命令为 `npx wrangler versions upload`。

公开实时行情前请阅读[部署](../../docs/operations/deployment.zh.md)与[行情数据与隐私](../../docs/operations/market-data-and-privacy.zh.md)。
