# 部署模板

本目录提供托管 Navor 站点所需的同源价格代理模板。复制模板前，请先阅读面向用户的[部署指南](../docs/operations/deployment.zh.md)。

- `vercel/`：Vercel 函数和可选的 SPA 路由配置。
- `cloudflare/`：Cloudflare Pages 函数。

使用 Cloudflare 模板的仓库演示站在 [`apps/demo`](../apps/demo/)。

代理会接收请求的代码并转发给配置的数据提供方。部署前请阅读[行情数据与隐私](../docs/operations/market-data-and-privacy.zh.md)。
