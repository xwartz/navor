# 语法

Navor 0.1 未单独发布 BNF 文法文档。**规范文法**以 `@navor/core` 开源 parser 的行为为准，由 `fixtures/` 与 `test/` 中的 fixture 覆盖。

## 非正式结构

工作区是指令序列。每条指令：

```text
DATE DIRECTIVE SUBJECT ["TITLE"]
  METADATA*
  POSTING*
  BODY?
```

- `DATE`：`YYYY-MM-DD`
- `DIRECTIVE`：十二条关键字之一（见[语法](syntax.zh.md)）
- `SUBJECT`：冒号分隔标识符
- `METADATA`：`  key: value`
- `POSTING`：`  Account:Path  quantity COMMODITY [@ price CURRENCY]`
- `BODY`：可选，由 `  ---` 行界定

首字符为 `;` 的行为注释，空行忽略。

## TextMate 语法

语法高亮使用 `extensions/vscode/syntaxes/navor.tmLanguage.json`，与 parser 列出相同的十二条指令关键字。

## 相关

- [语法](syntax.zh.md)
- [诊断](diagnostics.zh.md)
- [文件格式](file-format.zh.md)
