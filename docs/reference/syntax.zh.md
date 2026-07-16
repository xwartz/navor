# 语法参考

仅事实性说明，版本 0.1，教程见[语言概览](../language/overview.zh.md)。

## 文件与工作区

- 扩展名：`.nav`
- 编码：UTF-8
- 工作区是目录树；所有 `.nav` 文件合并解析

## 指令行

```nav
YYYY-MM-DD DIRECTIVE SUBJECT "标题"
```

- `DIRECTIVE` 与 `SUBJECT` 必填
- `标题` 可选；不能包含 `"`
- 指令首行不缩进

## 元数据

```nav
  key: value
```

- 恰好两个前导空格
- 键：`[A-Za-z_][A-Za-z0-9_]*`
- 值：`: ` 后的非空文本

## Posting

```nav
  Assets:Equity:US:NVDA  10 NVDA @ 900 USD
```

形态：`ACCOUNT_PATH QUANTITY COMMODITY [@ PRICE CURRENCY]`

## 正文

```nav
  ---
  Markdown 内容
  ---
```

有正文时开始与结束 `  ---` 必填，正文行两空格缩进。

## 指令（0.1）

`option`、`capital`、`open`、`close`、`plan`、`research`、`thesis`、`decision`、`txn`、`review`、`journal`、`note`

## Subject

冒号分隔路径：`Portfolio:Core`、`Account:US`、`Asset:Equity:US:NVDA`

除已文档化语义外，无固定分类法。

## 注释

整行注释以 `;` 开头，空行忽略。

## Parser 与语义

parser 报告畸形指令、元数据、posting、缩进、正文分隔符行，语义 engine 增加记账规则，见[诊断](diagnostics.zh.md)。

## 派生数据

持仓、配置、盈亏、Reader 视图为派生，价格与汇率为可选增强。

## 相关

- [文法](grammar.zh.md)
- [指令](../language/directives.zh.md)
