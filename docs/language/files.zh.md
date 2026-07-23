# 文件

parser 不看文件名，工作区里任意 `.nav` 都会加载；路径怎么分，主要方便你和 Git 审阅。

## 常见角色

| 文件或目录 | 角色 |
| --- | --- |
| `portfolio.nav` | 组合级 `capital` 与 `option` |
| `accounts/*.nav` | Account 的 `open`、`plan`、`close` |
| `assets/*.nav` | Asset 的 `open`、`close` |
| `activity/*.nav` | 带日期的 `txn`、`research`、`thesis`、`decision`、`review`、`journal`、`note` |
| `plan.nav` | 目标区间与再平衡规则（可选） |

仓库 [example](../../example/) 展示了更大规模的拆分。

## 单文件 vs 多文件

**按年一个文件**（`activity/`）便于年度复盘。

**按标的一个文件**把观点与交易历史放在一起。

**单文件小工作区**也完全有效。

parser 按日期合并所有指令为一条时间线。

## 编码与命名

- 使用 `.nav` 扩展名。
- UTF-8 编码。
- 路径稳定、可读（如 `assets/nvda.nav`，避免 `temp.nav`）。

编码与换行规则见[文件格式](../reference/file-format.zh.md)。

## 相关

- [组织仓库](../getting-started/organize-your-repository.zh.md)
- [投资仓库](../concepts/investment-repository.zh.md)
