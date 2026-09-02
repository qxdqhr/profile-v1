# 百度网盘分享转存自动化调研

> 目标：给定分享链接 → 自动转存到 Cookie 账号网盘 → 自动生成新分享链接

## 流程总览

```
分享链接 + 提取码(可选)
    ↓
① Cookie 登录验证 (BDUSS/STOKEN/bdstoken)
    ↓
② 解析分享页 (surl / shareid / uk / fs_id)
    ↓
③ 提取码验证 (randsk / BDCLND) — 有密码时
    ↓
④ 转存到指定目录 (/share/transfer)
    ↓
⑤ 创建新分享 (/share/set)
```

## 子任务与脚本

| 步骤 | 脚本 | 说明 |
|------|------|------|
| 1 | `demo/baidu-pan/scripts/01_cookie_login.py` | 检测登录、获取 bdstoken、容量 |
| 2 | `demo/baidu-pan/scripts/02_parse_share_link.py` | 解析链接、抓取 yunData |
| 3 | `demo/baidu-pan/scripts/03_verify_extract_code.py` | 验证提取码，拿 randsk |
| 4 | `demo/baidu-pan/scripts/04_transfer_save.py` | 转存到指定 path |
| 5 | `demo/baidu-pan/scripts/05_create_share.py` | 生成新分享链接 |
| 全流程 | `demo/baidu-pan/scripts/06_pipeline.py` | 串联 1→5 |

## 文档索引

| 文档 | 内容 |
|------|------|
| [01-official-api.md](./01-official-api.md) | 百度网盘开放平台官方 API |
| [02-web-cookie-flow.md](./02-web-cookie-flow.md) | Web Cookie 协议与接口参数 |
| [03-subtask-design.md](./03-subtask-design.md) | 子任务拆分与错误码 |
| [04-mcp-integration.md](./04-mcp-integration.md) | **MCP 服务调研与 Cursor 接入** |
| [demo/README.md](../demo/README.md) | Demo 运行说明 |

## 技术路线结论

| 路线 | 适用 | 门槛 |
|------|------|------|
| **Web Cookie 协议** | 个人账号自动转存 | 中（推荐 PoC） |
| **开放平台 OAuth** | 企业/ISV 正式接入 | 高（需申请、部分付费） |

本 Demo 采用 **Web Cookie 协议**，与浏览器手动转存行为一致。

## 关键 Cookie

- `BDUSS` — 登录凭证（必须）
- `STOKEN` — 安全令牌（强烈建议）
- `BAIDUID` — 设备标识（自动生成）
- `BDCLND` — 提取码验证后写入（有密码分享时需要）

## 快速开始

```bash
cd ../demo
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 填入 baidu-pan/data/cookies.json 后
python baidu-pan/scripts/01_cookie_login.py --save
python baidu-pan/scripts/06_pipeline.py --url "https://pan.baidu.com/s/1xxxx?pwd=abcd" --pwd abcd
```

Web 联调：`cd web && npm run dev` → 切换「百度网盘」标签页。

> ⚠️ 仅供调研自用，请勿提交真实 Cookie 到 Git。
