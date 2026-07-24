# nav check

校验工作区中的所有 `.nav` 文件，不构建站点，也不修改源文件。

```bash
nav check <workspace>
```

命令以 `文件:行号: 信息` 输出 parser 和语义诊断。存在任何诊断时退出码为 `1`，工作区无诊断时为 `0`。

记录事实后及 CI 中使用 `nav check`。格式检查仍单独使用 [`nav format --check`](format.zh.md)。
