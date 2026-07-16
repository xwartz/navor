# 编辑器支持

Navor 是纯文本优先，任何编辑器都能用，仓库还提供 VS Code / Cursor 扩展，给 `.nav` 做语法高亮和格式化。

## 安装扩展

### 从 GitHub Release（推荐）

每个 [GitHub Release](https://github.com/xwartz/navor/releases/latest) 都附带 `navor-*.vsix`。

```bash
cursor --install-extension ./navor-0.1.1.vsix
# 或
code --install-extension ./navor-0.1.1.vsix
```

也可以用命令面板 → **Extensions: Install from VSIX…**。

扩展 id：`navor.navor`。

### 从源码检出

```bash
pnpm install
pnpm build
pnpm link:vscode
```

开发细节见 [`extensions/vscode`](../../extensions/vscode/)。

## 功能

- 日期、指令、subject、标题、元数据、posting、注释和 Markdown 正文的语法高亮
- **Format Document** 和保存时格式化：posting 列对齐、缩进、指令间空行
- **不会**重排指令，也不会改写数字字面量

## 保存时格式化

在用户或工作区设置里加：

```json
{
  "[navor]": {
    "editor.formatOnSave": true
  }
}
```

## 用 CLI 格式化

```bash
nav format portfolio
nav format portfolio --check
```

`nav format` 会规范化空白，CI 里用 `--check`，发现有文件需要格式化就以非零退出。

## 下一步

- [CLI：format](../cli/format.zh.md)
- [语言：注释](../language/comments.zh.md)
