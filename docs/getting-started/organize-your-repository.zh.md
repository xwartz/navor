# 组织仓库

Navor **仓库**（CLI 里的工作区）就是一棵 `.nav` 目录树，Navor 会递归读下面所有 `.nav` 文件；文件夹怎么分，主要为了方便你和 Git 审阅，parser 不看路径。

## 推荐布局

```text
investment/
  portfolio.nav
  accounts/
    us.nav
  assets/
    nvda.nav
  activity/
    2026.nav
```

| 路径 | 常见内容 |
| --- | --- |
| `portfolio.nav` | `capital`、`option` 等组合级事实 |
| `accounts/` | Account 的 `open`、`plan`、`close` |
| `assets/` | Asset 的 `open`、`close` |
| `activity/` | 带日期的 `txn`、`research`、`thesis`、`decision`、`review`、`journal` |

可以按 subject 拆，也可以按年份拆，一个大的 `activity/2026.nav` 行，按标的拆成多个小文件也行。

## 为什么用 Git

投资状态会变，Git 正好给每次推理和记账留下历史、diff、blame 和审阅。

```bash
cd investment
git init
git add .
git commit -m "Initial Navor workspace"
```

把 `.nav` 当真相来源，静态站点和 Reader 视图都是派生出来的。

## 示例仓库

仓库自带 [`example/`](../../example/)，有多账户、标的、研究和交易。打开方式：

```bash
nav serve example
```

## 下一步

- [编辑器支持](editor-support.zh.md)
- [投资仓库](../concepts/investment-repository.zh.md)
- [交易](../language/transactions.zh.md)
