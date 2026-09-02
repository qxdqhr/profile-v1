# 夸克网盘 MCP 接入调研

> 调研日期：2026-06-25  
> 结论：**有**社区 MCP（文件管理向）；**无**官方 MCP；**无**「分享链接转存」专用 MCP。

## 可用 MCP 服务

| 项目 | 语言 | 能力摘要 |
|------|------|----------|
| [quark-nd-mcp](https://github.com/MichealJl/quark-nd-mcp) | Go / stdio | 列目录、上传/下载、移动、复制、删除、搜索、正则重命名 |
| [@mcpcn/mcp-pansou-search](https://www.npmjs.com/package/@mcpcn/mcp-pansou-search) | Node | **网盘资源搜索**（含夸克链接），非账号内操作 |

## quark-nd-mcp 工具（节选）

- `list_files` / `get_info`
- `upload_file` / `download_file`
- `create_folder` / `rename` / `delete` / `move` / `copy`
- `search` / `regex_rename`

鉴权：配置 `pan.quark.cn` 的 **Cookie**（与 Demo 相同）。

## 能力对照（MCP vs 本仓库 Demo）

| 本仓库脚本 | Demo 能力 | quark-nd-mcp | 说明 |
|------------|-----------|--------------|------|
| `01_cookie_login` | 登录检测 | ⚠️ 隐式（Cookie） | 无独立 login 工具 |
| `02_parse_share_link` | 解析 pwd_id | ❌ | |
| `03_verify_extract_code` | stoken | ❌ | |
| `04_transfer_save` | **分享转存** | ❌ | **核心差距** |
| `05_create_share` | 新建分享 | ❌ | |
| `06_pipeline` | 全流程 | ❌ | |

## Cursor 接入示例（quark-nd-mcp）

```json
{
  "mcpServers": {
    "quark-nd": {
      "command": "/absolute/path/to/quark-nd-mcp",
      "args": ["-config", "/absolute/path/to/config.json"]
    }
  }
}
```

`config.json` 中写入 Cookie 字符串（勿提交仓库）。

## 与本 Demo 的推荐组合

| 场景 | 推荐 |
|------|------|
| 分享链接 → 转存 → 再分享 | **本仓库 `demo/quark-pan` 脚本** |
| AI 管理夸克网盘内已有文件 | **quark-nd-mcp** |
| 按关键词搜公开夸克资源 | **mcp-pansou-search** |

## 本机现状

当前 Cursor **未配置**夸克网盘 MCP。
