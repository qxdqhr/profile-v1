# Money Research（Profile V1 子应用）

副业 / 平台自动化调研与 Demo 测试台，挂载于 `/money-research`（开发 `:3004`）。

## 目录

| 路径 | 说明 |
|------|------|
| `docs/` | 各平台 API 调研文档 |
| `demo/` | Python 自动化脚本（Next API 通过 `spawn` 调用） |
| `app/` | Next.js 测试台 UI + Route Handlers |

## 开发

```bash
# 仓库根目录
pnpm dev:money-research

# Python 依赖（首次）
cd apps/money-research/demo
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

访问 http://localhost:3004/money-research（生产网关：https://域名/money-research/）。

## 生产

与 calendar / showmasterpiece 相同：`NEXT_PUBLIC_BASE_PATH=/money-research`，Docker 镜像 `qhr-profile-money-research`。
