# Navor

**用人类可读的文档表达投资状态的开放规范。**

Navor 是一套纯文本投资语言和工具链，用来记录投资知识、组合政策、决策、交易和复盘。投资仓库可以放进 Git 审阅，在本地 Reader 里查看，也能导出成静态站点。

研究、观点、决策、复盘、日志和持仓一样，都写在源文件里。组合是算出来的，推理才是你要留下来的东西。

[English](README.md) · [宣言](docs/manifesto.zh.md) · [文档](docs/README.zh.md)

## 安装

需要 Node.js 22.14 或更高版本。

```bash
npm install --global @navor/cli
nav serve example
```

从源码：

```bash
pnpm install && pnpm build
nav serve example
```

## 最小示例

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

## 命令

| 命令 | 用途 |
| --- | --- |
| `nav serve <workspace>` | 本地 Reader（`<workspace>` 为投资仓库路径） |
| `nav build <workspace> --out <dir>` | 静态站点 |
| `nav format <path> [--check]` | 格式化 `.nav` |

语法高亮和保存时格式化见 [`extensions/vscode`](extensions/vscode/)，从 [Releases](https://github.com/xwartz/navor/releases/latest) 安装 `navor-*.vsix`。

## 数据边界

Navor 不上传投资仓库，也不要求注册账户；实时价格是可选增强。若要公开价格代理，请先读[行情数据与隐私](docs/operations/market-data-and-privacy.zh.md)。

## 贡献

提交变更前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，安全问题请通过 [SECURITY.md](SECURITY.md) 私下报告。
