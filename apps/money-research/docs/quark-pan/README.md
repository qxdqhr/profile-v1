# 夸克网盘分享转存自动化调研

> 目标：给定分享链接 → 自动转存到 Cookie 账号网盘 → 自动生成新分享链接

## 流程总览

```
分享链接 + 提取码(可选)
    ↓
① Cookie 登录验证
    ↓
② 解析分享链接 (pwd_id)
    ↓
③ 获取 stoken (/share/sharepage/token)
    ↓
④ 获取分享文件列表 (/share/sharepage/detail)
    ↓
⑤ 转存 (/share/sharepage/save) + 轮询 task
    ↓
⑥ 创建新分享 (/share + /share/password)
```

## 子任务与脚本

| 步骤 | 脚本 | 说明 |
|------|------|------|
| 1 | `demo/quark-pan/scripts/01_cookie_login.py` | 检测登录、账号信息 |
| 2 | `demo/quark-pan/scripts/02_parse_share_link.py` | 解析 pwd_id / 提取码 |
| 3 | `demo/quark-pan/scripts/03_verify_extract_code.py` | 验证提取码，获取 stoken |
| 4 | `demo/quark-pan/scripts/04_transfer_save.py` | 转存到指定目录 |
| 5 | `demo/quark-pan/scripts/05_create_share.py` | 生成新分享链接 |
| 全流程 | `demo/quark-pan/scripts/06_pipeline.py` | 串联 1→5 |

## 文档索引

| 文档 | 内容 |
|------|------|
| [01-web-cookie-flow.md](./01-web-cookie-flow.md) | Web API 与参数 |
| [02-subtask-design.md](./02-subtask-design.md) | 子任务拆分与错误码 |
| [03-mcp-integration.md](./03-mcp-integration.md) | **MCP 服务调研与 Cursor 接入** |
| [demo/README.md](../demo/README.md) | 统一 Demo 说明 |

## 关键 Cookie

从 `pan.quark.cn` 开发者工具复制完整 Cookie 请求头（通常含 `__puus`、`__kp` 等字段）。

## 快速开始

```bash
cd ../demo
source .venv/bin/activate
python quark-pan/scripts/01_cookie_login.py --save
python quark-pan/scripts/06_pipeline.py \
  --url "https://pan.quark.cn/s/xxxxx?pwd=abcd" \
  --pwd abcd
```

Web 联调： `cd web && npm run dev` → 「夸克网盘」标签页。
