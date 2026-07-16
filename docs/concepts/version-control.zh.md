# 版本控制

投资决策会变，版本控制就是用来记这种变化的。

## 为什么用 Git

Git 给纯文本备好历史、diff、blame、分支和审阅，观点或交易一改，就能看到 patch，不用去翻数据库版本。

```bash
git diff
git log -- portfolio.nav activity/
```

## 只追加的纪律

Navor 约定只追加：事实或观点变了，就加新指令，别改旧日期，也别删旧观点，不然审计链断了，派生视图也会乱。

## 审阅流程

大改动可以像审代码一样做：

- 大额再平衡或观点重写时开分支
- 改完跑诊断（`nav serve` 或 CI）
- 用 `nav format --check` 保持格式一致

## 长期维护

2019 年的券商导出和 2024 年的观点可以放在同一个仓库里，Git tag 还能标税务年度或策略大调整。

## 相关

- [投资仓库](investment-repository.zh.md)
- [设计哲学](../philosophy.zh.md)
