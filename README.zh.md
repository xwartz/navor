# Navor

Navor 是一门纯文本投资语言及其工具链，用于记录投资知识、组合政策、决策、交易和复盘。工作区可在 Git 中审阅，可在本地 Navor Reader 中查看，也可导出为静态站点。

它借鉴 Beancount 的稳健文本形式：带日期的指令、缩进元数据、posting、注释和追加式历史。Navor 不是 Beancount 方言，也不替代会计账本。研究、观点、决策、复盘和投资日志都是一等事实。

[English](README.md)

## 安装

Navor 需要 Node.js 22.14 或更高版本。

```bash
npm install --global @navor/cli
nav serve ./portfolio
nav build ./portfolio --out ./site
```

从源码检出运行：

```bash
pnpm install
pnpm build
pnpm build:example
```

## 最小工作区

```nav
2026-01-01 open Account:US "美股"
  target: 100%

2026-01-01 open Asset:Equity:US:NVDA "NVIDIA"
  account: Account:US

2026-01-02 thesis Asset:Equity:US:NVDA "算力需求"
  confidence: Medium
  ---
  财报后重新检查该观点。
  ---
```

## 文档

从[文档首页](docs/README.zh.md)开始：核心概念、快速开始、语言参考、记账 Cookbook，再到运维与维护者说明。

## 命令

- `nav serve <workspace> [--port <port>]` 启动本地 Reader。
- `nav build <workspace> --out <dir> [--fetch-prices]` 生成静态站点。

## 数据边界

Navor 不上传工作区，也不要求注册账户。实时价格是可选增强数据。部署价格代理后，代理会把访客请求的代码发送给配置的数据提供方。公开代理前，请阅读[行情数据与隐私](docs/operations/market-data-and-privacy.zh.md)。

## 贡献与安全

提交变更前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。安全问题请按 [SECURITY.md](SECURITY.md) 私下报告，不要公开提交 issue。
