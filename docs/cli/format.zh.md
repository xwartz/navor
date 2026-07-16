# nav format

规范化 `.nav` 文件中的空白。

```bash
nav format <path> [--check]
```

`<path>` 可以是单个文件或目录（递归处理）。

## 选项

| 选项 | 说明 |
| --- | --- |
| `--check` | 只报告需格式化的文件，不写入；若有则非零退出 |

## 示例

```bash
nav format portfolio
nav format portfolio --check
```

## 会做什么

- 规范化缩进
- 对齐 posting 列
- 在指令之间插入空行

## 不会做什么

- 重排指令顺序
- 改写数字字面量
- 重排 Markdown 正文

日常编辑可在[编辑器](../getting-started/editor-support.zh.md)中开启保存时格式化，CI 中使用 `--check`。

## 相关

- [编辑器支持](../getting-started/editor-support.zh.md)
- [参考：文件格式](../reference/file-format.zh.md)
