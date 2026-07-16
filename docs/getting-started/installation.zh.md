# 安装

需要 Node.js 22.14 或更高版本。

## 安装 CLI

```bash
npm install --global @navor/cli
```

装好后验证：

```bash
nav
```

如果提示找不到命令，检查 npm 全局 bin 目录是否在 `PATH` 里。

## 从源码检出

```bash
git clone https://github.com/xwartz/navor.git
cd navor
pnpm install
pnpm build
```

跑示例工作区：

```bash
nav serve example
```

终端会打印 URL，浏览器打开即可（默认端口 5173）。

## 创建第一个仓库

投资仓库就是一个放 `.nav` 文件的目录，建在哪都行：

```bash
mkdir ~/investment
```

接着读[第一个 `.nav` 文件](your-first-nav.zh.md)，再读[组织仓库](organize-your-repository.zh.md)。

## 编辑器支持

`.nav` 的语法高亮和保存时格式化见[编辑器支持](editor-support.zh.md)。
