# nav serve

在工作区上启动本地 Navor Reader。

```bash
nav serve <workspace> [--port <port>]
```

## 选项

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `--port` | `5173` | Reader 的 HTTP 端口 |

## 示例

```bash
nav serve example
nav serve ./portfolio --port 3000
```

服务起来后，CLI 会打印 URL，浏览器打开就行。

## 行为

- 编译工作区下所有 `.nav` 文件
- 在 UI 中显示语义诊断，诊断不阻止打开工作区
- 本地开发时可暴露可选的同源价格端点

## 停止服务

在终端按 `Ctrl+C`。

## 相关

- [快速开始](../getting-started/your-first-nav.zh.md)
- [行情数据与隐私](../operations/market-data-and-privacy.zh.md)
