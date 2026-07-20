# AI 助手 skills

Navor skills 帮助 AI 助手处理本地投资仓库。它们是可移植的 `SKILL.md` 工作流，不是托管的 Navor 服务。

## 可用 skills

| Skill | 用途 | 默认权限 |
| --- | --- | --- |
| `navor-onboard` | 根据你提供的事实创建或整理工作区 | 确认拟写入记录后才写入 |
| `navor-record` | 记录研究、观点、决策、交易、复盘或日志 | 指令有歧义时，展示记录后才写入 |
| `navor-review` | 检查既有流程、执行情况和 Navor 诊断 | 只读 |

用 `npx skills add xwartz/navor` 安装集合后，可交互地选择 skill 和 agent，或使用[安装](installation.zh.md)中的命令。

## 边界

- skills 只处理你放入任务范围的本地工作区，不上传它，也不要求 Navor 账户。
- 除非你另外要求助手这么做，否则它们不会抓取价格、新闻或其他行情数据。
- 它们帮助整理和检查已记录事实，不提供投资、法律、税务或会计建议，也不会下单。
- `.nav` 源文件始终是事实来源。市值、PnL、组合视图和 Reader JSON 都是派生输出，不能作为源事实编辑。
