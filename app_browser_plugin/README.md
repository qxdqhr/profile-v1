# 浏览器扩展（git submodule）

仅挂载独立仓，**不进** pnpm workspace，**不进** 网关。目录名按产品拼写为 `app_browser_plugin`。

| slug | 路径 | 独立仓 |
|------|------|--------|
| majdata-download | `majdata-download/` | [majdata-download-extension](https://github.com/qxdqhr/majdata-download-extension) |

```bash
git submodule update --init app_browser_plugin/majdata-download
```
