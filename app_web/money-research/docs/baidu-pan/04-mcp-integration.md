# 百度网盘 MCP 接入调研

> 调研日期：2026-06-25  
> 结论：**有**百度官方 MCP；能力偏「已登录网盘文件管理」，**不包含**本 Demo 的「分享链接转存」。

## 官方 MCP

| 项目 | 类型 | 文档 |
|------|------|------|
| [baidu-netdisk/mcp](https://github.com/baidu-netdisk/mcp) | **官方** SSE + stdio | 需 `access_token`（OAuth） |

### 官方工具清单（节选）

| MCP Tool | 能力 |
|----------|------|
| `user_info` | 用户信息 |
| `file_list` / `file_meta` | 列目录、文件详情 |
| `file_upload_stdio` | 本地上传（仅 stdio） |
| `file_sharelink_set` | **创建**分享链接 |
| `file_keyword_search` | 文件名搜索 |
| `file_copy` / `file_move` / `file_del` | 文件管理 |

## 能力对照（MCP vs 本仓库 Demo）

| 本仓库脚本 | Demo 能力 | 官方 MCP | 说明 |
|------------|-----------|----------|------|
| `01_cookie_login` | Cookie + bdstoken | ✅ `user_info`（OAuth token） | 鉴权方式不同 |
| `02_parse_share_link` | 解析他人分享链接 | ❌ | MCP 无此工具 |
| `03_verify_extract_code` | 验证提取码 | ❌ | |
| `04_transfer_save` | **转存到网盘** | ❌ | **核心差距** |
| `05_create_share` | 转存后再分享 | ✅ `file_sharelink_set` | 仅对已存在文件建链 |
| `06_pipeline` | 链接→转存→分享 | ⚠️ 仅后半段「建分享」 | 转存仍需本 Demo |

## Cursor 接入示例（SSE）

1. 在百度网盘开放平台获取 `access_token`（见官方文档）
2. 配置 `~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "baidu-netdisk": {
      "url": "https://mcp-pan.baidu.com/sse?access_token=YOUR_ACCESS_TOKEN"
    }
  }
}
```

本地上传需 stdio 模式 + `uv` 运行 `netdisk.py`（见官方 README）。

## 与本 Demo 的推荐组合

| 场景 | 推荐 |
|------|------|
| 他人分享链接一键转存 | **本仓库 `demo/baidu-pan` 脚本** |
| AI 管理自己网盘文件、搜索、上传、建分享 | **官方百度网盘 MCP** |
| 跨网盘资源搜索（非转存） | `@mcpcn/mcp-pansou-search`（第三方） |

## 本机现状

当前 Cursor **未配置**百度网盘 MCP。
