# B 站会员购 / 票务 MCP 接入调研

> 调研日期：2026-06-25  
> 结论：**无**会员购票务专用 MCP；仅有**主站视频/数据**向 MCP，**不能**替代本 Demo 的 `show.bilibili.com` 购票流程。

## 可用 MCP（非票务）

| 项目 | 定位 | 与会员购关系 |
|------|------|--------------|
| [@mcpcn/mcp-bilibili](https://www.npmjs.com/package/@mcpcn/mcp-bilibili) | B 站**开放平台 OAuth** | 视频投稿、分区、稿件管理；❌ 非 show 票务 |
| [media-crawler-mcp-service](https://github.com/mcp-service/media-crawler-mcp-service) | 多平台爬虫 MCP | `bili_search`、详情、评论；❌ 无购票 |
| [china-mcp](https://github.com/12qw3er4ty5u-collab/china-mcp) | 中文平台聚合 | B 站搜索/读帖；❌ 无会员购 |
| npm `bilibili-mcp-server` 等 | 社区零散 | 多为 Cookie 读数据 |

## 能力对照（MCP vs 本仓库 Demo）

| 本仓库脚本 | Demo（票务） | 现有 B 站 MCP |
|------------|--------------|---------------|
| `01_cookie_login` | nav 登录检测 | ⚠️ OAuth 或 Cookie 读接口 |
| `02_bili_ticket` | GenWebTicket | ❌ |
| `03_parse_link` | show 项目解析 | ❌ |
| `04_list_inventory` | 场次/票档、市集 | ❌ |
| `05_prepare_order` | prepare 预下单 | ❌ |
| `06_pipeline` | 购票流程 | ❌ |

## 官方 @mcpcn/mcp-bilibili 能力（供参考）

- `bilibili_upload_video` — 开放平台视频投稿
- `bilibili_get_video_list` — 稿件列表
- 需 **open.bilibili.com** 应用与 OAuth，与 `SESSDATA` 票务 Cookie **不是同一体系**

## Cursor 接入示例（开放平台视频 MCP）

```json
{
  "mcpServers": {
    "mcp-bilibili": {
      "command": "npx",
      "args": ["-y", "@mcpcn/mcp-bilibili"]
    }
  }
}
```

按包内文档完成 OAuth 授权（**不能用于会员购票**）。

## 与本 Demo 的推荐组合

| 场景 | 推荐 |
|------|------|
| 漫展/演出查票、预下单 | **本仓库 `demo/bilibili-mall` 脚本** |
| 市集商品浏览 | 本 Demo `04 --market` 或后续自研 MCP |
| B 站 UP 主视频投稿 | `@mcpcn/mcp-bilibili` |
| 搜索 B 站视频做调研 | media-crawler `bili_search` |

## 后续自建 MCP 建议

若需 Agent 调购票，可包装本仓库 Python 客户端为 MCP Server：

```
tools: bilibili_parse_project, bilibili_list_skus, bilibili_prepare_order, bilibili_pipeline
transport: stdio
auth: SESSDATA cookie env
```

## 本机现状

当前 Cursor **未配置** B 站相关 MCP。
