# 诊断

语义 engine 标出需复核的问题，诊断**不阻止**工作区被读取或渲染。

## 解析错误

畸形行导致解析失败：

- 无效日期或指令行
- 元数据或 posting 缩进错误
- 正文分隔符未闭合
- posting 形态无效

按[语法](syntax.zh.md)修正行形态。

## 语义检查（0.1）

| 条件 | 含义 |
| --- | --- |
| Asset 引用未 open 的 Account | `account:` 指向没有 `open` 的 Account |
| `plan` 引用未知 subject | Account 或 Asset 未 open |
| `txn` subject 未 open | 对已关闭或未知 Asset/Account 记账 |
| Account `txn` 含持仓 posting | 现金事件不得移动标的持仓 |
| Asset `txn` 缺持仓 posting | 标的交易需匹配的 `Assets:Equity:...` 行（纯现金/收入/费用事件除外） |
| 日期关联未解析或存在歧义 | `based_on` 或 `txn.decision` 日期无法在同一 subject 内唯一解析 |

## 诊断不是什么

- 税务或会计审计
- 复式平衡强制
- 投资建议

parser 在语法上接受 posting，不强制商品一致或账本平衡。

## 工作流

1. 编辑 `.nav` 文件
2. 运行 `nav serve` 或在 CI 中编译
3. 在 Reader 或构建输出中阅读诊断
4. 修正源事实；不要手改派生 JSON

## 相关

- [交易](../language/transactions.zh.md)
- [语法](syntax.zh.md)
