# 投资仓库

Navor 投资仓库就是一个目录，里面放着描述你投资状态的一组 `.nav` 文件。

## 为什么是仓库，而不是数据库

文件夹里的纯文本好搬、好 diff、也不绑在某个厂商上，你可以复制、归档，或者放到 GitHub，不依赖 Navor 服务也能留着。

## 推荐布局

详见[组织仓库](../getting-started/organize-your-repository.zh.md)。常见拆法：

- `portfolio.nav`：资金和 `option` 设置
- `accounts/`、`assets/`：subject 定义
- `activity/`：带日期的活动和推理记录

## 生命周期

1. **初始化**：建文件，记下 `capital` 和 `open`
2. **运行**：追加 `research`、`thesis`、`decision`、`txn`
3. **复盘**：写 `review`、`journal`，在 Git 里看 diff
4. **发布**（可选）：`nav build` 出静态站点，按需部署价格代理

## 源文件与输出

`.nav` 是真相来源，Reader UI 和 `navor-data.json` 是算出来的视图，别手改派生 JSON。

## 相关

- [版本控制](version-control.zh.md)
- [纯文本](plain-text.zh.md)
