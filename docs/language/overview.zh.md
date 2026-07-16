# 语言概览

Navor 是一门声明式、只追加的投资**状态**语言，用来描述资金、账户、标的、研究、观点、决策、交易、复盘和日志。

它不下单、不自动交易、不替代会计或税务记录，也不给投资建议。

## 什么是 Navor 文档？

`.nav` 文件是纯文本，每条 **指令** 就是一条带日期的事实：

```nav
YYYY-MM-DD DIRECTIVE SUBJECT "可选标题"
  key: value
  Account:Path  quantity COMMODITY @ price CURRENCY
  ---
  可选 Markdown 正文
  ---
```

- 日期格式是 `YYYY-MM-DD`
- 元数据、posting 和正文分隔符前面缩进两个空格
- 正文用 `  ---` 包起来

## 工作区

工作区就是一棵 `.nav` 目录树，文件怎么分文件夹随你安排，parser 按日期、指令、subject、元数据和 posting 来理解内容。

## Subject

subject 是用冒号分隔的稳定标识符：

```text
Portfolio:Core
Account:US
Asset:Equity:US:NVDA
```

`Asset` 是研究、规划和交易的对象，`Account` 是顶层的配置分组或现金边界。Asset 的 `account` 元数据指向它所属的 Account。

## 十二条指令

Navor 0.1 支持十二条指令，完整表格和示例见[指令](directives.zh.md)。

| 分组 | 指令 |
| --- | --- |
| 组合 | `option`、`capital` |
| 生命周期 | `open`、`close`、`plan` |
| 推理 | `research`、`thesis`、`decision`、`review` |
| 活动 | `txn`、`journal`、`note` |

## 只追加的历史

观点、计划或决策变了，就追加新指令，别改历史记录来让当下看起来更整齐。

## 派生视图

源文件里是你确认过的事实，持仓、现金、成本、市值、配置、盈亏、偏离和 Reader 视图都是引擎算出来的。价格和汇率只是可选增强。

## 延伸阅读

- [文件](files.zh.md)
- [指令](directives.zh.md)
- [参考：语法](../reference/syntax.zh.md)
