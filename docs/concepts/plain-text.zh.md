# 纯文本

Navor 用纯文本保存投资状态，不用 JSON、YAML，也不锁在专有数据库里。

## 为什么不用 JSON 或 YAML

JSON 和 YAML 机器好读，人读起来费劲，投资知识又混着表格、叙述和带日期的事实，Navor 选了更耐久的行式记录：日期指令、缩进元数据、可选 Markdown 正文，随便什么编辑器都能打开 `.nav`，不用配 schema 工具。

## 耐久性

纯文本扛得住应用换代，Markdown 换了二十年工具还能读，Navor 希望投资状态也有这待遇。

## 适合 Git

一行一条记录，diff 很干净，观点或交易一改，patch 就能审。

## 适合 AI

大模型读纯文本本来就行，`thesis`、`decision`、`txn` 这些结构化指令和叙述正文在同一文件里，上下文不会散。

## 相关

- [设计哲学](../philosophy.zh.md)
- [版本控制](version-control.zh.md)
- [AI 与 Navor](ai.zh.md)
