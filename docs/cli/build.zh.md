# nav build

编译工作区并输出静态站点。

```bash
nav build <workspace> --out <dir> [--fetch-prices]
```

## 选项

| 选项 | 说明 |
| --- | --- |
| `--out` | 输出目录（必填） |
| `--fetch-prices` | 构建时快照实时价格 |

## 示例

```bash
nav build portfolio --out dist/site
nav build example --out dist/site --fetch-prices
```

输出包含 `index.html`、浏览器资源与 `navor-data.json`。

## 默认行为

不加 `--fetch-prices` 时构建只包含工作区事实，不调用行情接口；加上 `--fetch-prices` 时价格在构建时写入快照。

## 托管站点与实时价格

托管 Reader 可向同源 `POST /api/prices` 请求价格，从 [`deploy/`](../../deploy/README.zh.md) 复制模板，并阅读[部署](../operations/deployment.zh.md)。

## 相关

- [部署](../operations/deployment.zh.md)
- [行情数据与隐私](../operations/market-data-and-privacy.zh.md)
