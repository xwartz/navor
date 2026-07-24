# CLI 概览

`nav` 用来校验和编译 Navor 工作区、启动本地 Reader、构建静态站点，以及格式化 `.nav` 源文件。

```bash
nav <serve|build|check|format> <workspace> [options]
```

## 命令

| 命令 | 用途 |
| --- | --- |
| [`serve`](serve.zh.md) | 启动本地 Navor Reader |
| [`build`](build.zh.md) | 将静态站点写入 `--out` |
| [`check`](check.zh.md) | 报告 parser 和语义诊断 |
| [`format`](format.zh.md) | 规范化 `.nav` 空白 |

还没有 `init` 命令，手动建目录和 `.nav` 文件，或者先复制[示例](../../example/)。

## 约定

- `<workspace>` 是包含 `.nav` 文件的目录路径，也就是投资仓库根目录
- 选项用 GNU 风格的 `--flag` 和 `--name value`
- 非零退出码表示用法错误、工作区存在诊断，或者 `format --check` 发现需格式化的文件

## 安装

见[安装](../getting-started/installation.zh.md)。

## 相关

- [部署](../operations/deployment.zh.md)
- [编辑器支持](../getting-started/editor-support.zh.md)
