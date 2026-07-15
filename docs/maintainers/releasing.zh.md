# 发布 Navor

`@navor/cli` 是面向用户的 npm 包，并提供 `nav` 命令。其余五个 `@navor/*` 包按依赖顺序发布以支撑它，其导入 API 不是公开契约。

## 一次性配置

1. 创建 `xwartz/navor`，并启用私密漏洞报告。
2. 预留 `@navor` npm scope。
3. 为每个已发布包配置 GitHub Actions trusted publishing，仓库为 `xwartz/navor`，工作流为 `.github/workflows/release.yml`，环境为 `release`。
4. 为 `release` 环境要求维护者审批。
5. 发布计划（`scripts/release-plan.mjs`）是已发布包集合与依赖顺序的唯一事实来源。

## 发布流程

1. 每次涉及用户可见包的变更都添加 Changeset。
2. `Version packages` 工作流会在 `main` 上创建版本 PR。
3. 合并版本 PR，随后创建并推送与 `packages/cli/package.json` 一致的签名 tag，例如 `v0.1.1`。
4. Release 工作流会确认 tag 提交位于 `main`、版本匹配并检查发布计划，再执行共享发布验证，并通过发布计划发布。
5. 工作流会对已发布的 `@navor/cli` 运行分发验收，然后创建 GitHub Release。

该工作流需要 Node.js 22.14+ 和 npm 11.5.1+。首次稳定版发布前，应在干净安装环境中对真实且非敏感的工作区运行 `nav build`。
