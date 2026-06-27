# 小红书 MCP 接入调研

> 调研日期：2026-06-25  
> 结论：**有**成熟社区 MCP，与本仓库 Demo **高度重叠**，优先推荐 MCP 做发帖与运营。

## 主推 MCP

| 项目 | Stars | 传输 | 说明 |
|------|-------|------|------|
| [xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp) | 14k+ | HTTP `http://localhost:18060/mcp` | **首选**；Go + 浏览器自动化 |
| [x-mcp](https://github.com/xpzouying/x-mcp) | — | 浏览器插件 | 非技术用户、零部署 |
| [media-crawler-mcp-service](https://github.com/mcp-service/media-crawler-mcp-service) | — | MCP | 多平台；`xhs_search` 等偏**读取** |
| [china-mcp](https://github.com/12qw3er4ty5u-collab/china-mcp) | — | stdio | 含小红书读帖/用户；发帖能力有限 |

## xiaohongshu-mcp 工具（节选）

| Tool | 对应 Demo |
|------|-----------|
| `check_login_status` | `01_cookie_login` |
| `publish_content` / `publish_with_video` | `05_publish_note` |
| `search_feeds` / `list_feeds` | 调研扩展 |
| `get_feed_detail` | — |
| `like_feed` / `favorite_feed` / `post_comment_to_feed` | 调研扩展 |

## 能力对照

| 本仓库脚本 | Demo | xiaohongshu-mcp |
|------------|------|-----------------|
| `01_cookie_login` | ✅ | ✅ `check_login_status` |
| `02_sign` | x-s 算法演示 | ⚠️ 内置不暴露 |
| `03_copywriting` | 本地文案 | ❌（用 AI 生成后传给 publish） |
| `04_upload_image` | 图片上传 | ✅ 合并在 publish |
| `05_publish_note` | 发帖 | ✅ `publish_content` |
| `06_pipeline` | 全流程 | ✅ 多 tool 组合 |

## Cursor 接入示例

1. 下载 [Release](https://github.com/xpzouying/xiaohongshu-mcp/releases) 并启动服务（默认 `18060`）
2. 首次运行 `xiaohongshu-login` 完成扫码登录
3. Cursor 添加 HTTP MCP（具体字段以 Cursor 当前版本为准），或使用 OpenClaw/Claude 文档中的：

```bash
# 示例：CLI 添加
mcp add xiaohongshu-mcp http://localhost:18060/mcp
```

## 与本 Demo 的推荐组合

| 场景 | 推荐 |
|------|------|
| Cursor/Agent 真发帖、互动 | **xiaohongshu-mcp** |
| 研究 x-s 签名、离线文案模板 | **本仓库 `demo/xiaohongshu`** |
| 只读搜索/评论采集 | media-crawler-mcp / china-mcp |

## 本机现状

当前 Cursor **未配置**小红书 MCP。

## 风险

- 发布仍可能触发风控验证
- 需常驻本地服务 + 浏览器环境
