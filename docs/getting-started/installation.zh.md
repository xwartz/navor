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

## AI 助手 skills

Navor 通过开放的 `skills` CLI 发布可移植的 Agent Skills。先查看可安装的 skill：

```bash
npx skills add xwartz/navor --list
```

在当前项目中为 Codex 安装全部 skill：

```bash
npx skills add xwartz/navor --skill '*' --agent codex
```

要用于其他支持的助手，替换为 `--agent cursor` 或 `--agent claude-code`。添加 `--global` 后会安装到所有项目，而不是仅当前项目。

该 CLI 默认收集匿名安装遥测；如不符合你的隐私偏好，可在命令中关闭：

```bash
DISABLE_TELEMETRY=1 npx skills add xwartz/navor --skill '*' --agent codex --global
```

在将 skill 用于投资仓库前，请阅读 [AI 助手 skills](ai-skills.zh.md)。
