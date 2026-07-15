# Deployment templates

This directory contains same-origin price-proxy templates for hosted Navor sites. Read the user-facing [deployment guide](../docs/operations/deployment.md) before copying a template.

- `vercel/`: Vercel function and optional SPA-routing configuration.
- `cloudflare/`: Cloudflare Pages function.

The repository demo site that uses the Cloudflare template lives in [`apps/demo`](../apps/demo/).

The proxy receives requested symbols and forwards them to the configured provider. Review [market data and privacy](../docs/operations/market-data-and-privacy.md) before deployment.
