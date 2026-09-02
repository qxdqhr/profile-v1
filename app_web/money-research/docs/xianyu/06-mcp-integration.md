# 闲鱼 MCP 接入调研

> 调研日期：2026-06-25  
> 结论：**有**社区 MCP 服务，可部分替代本仓库 `demo/xianyu` 脚本；**无**官方 MCP。

## 可用 MCP 服务

| 项目 | 语言/传输 | 能力摘要 | 成熟度 |
|------|-----------|----------|--------|
| [goofish-cli](https://github.com/fancyboi999/goofish-cli) | Python / stdio（`uvx goofish-cli`） | 发布/下架/查询/收藏/IM/WebSocket 消息；**推荐** | ⭐⭐⭐ |
| [xianyu-mcp](https://pypi.org/project/xianyu-mcp/) | Python / stdio 或 HTTP | Playwright 登录、发品、搜索、收藏、卖家主页 | ⭐⭐ |
| [goofish-mcp-server](https://github.com/mercy719/goofish-mcp-server) | Node + Playwright / stdio | `search_items`、`get_item_detail`、`monitor_keyword` | ⭐⭐ |

## 能力对照（MCP vs 本仓库 Demo）

| 本仓库脚本 | Demo 能力 | goofish-cli MCP | xianyu-mcp | 说明 |
|------------|-----------|-----------------|------------|------|
| `01_cookie_login` | Cookie / 登录检测 | ✅（浏览器态） | ✅ | MCP 用 Playwright 持久化 Profile |
| `02_sign` | Mtop 签名演示 | ⚠️ 内置 | ⚠️ 内置 | 不暴露独立 sign 工具 |
| `03_copywriting` | 本地文案生成 | ❌ | ❌ | 需本仓库脚本或 LLM |
| `04_publish_item` | 上架发品 | ✅ `goofish_item_publish` 等 | ✅ | MCP 更接近真实运营 |
| `05_shipping` | 发货配置生成 | ⚠️ 部分（物流/地址 API） | ⚠️ | 以 mtop/页面能力为准 |

## Cursor 接入示例（goofish-cli）

编辑 `~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "goofish": {
      "command": "uvx",
      "args": ["goofish-cli"]
    }
  }
}
```

首次使用需在 Playwright 浏览器中完成闲鱼登录（持久化 Profile）。

## 与本 Demo 的推荐组合

| 场景 | 推荐 |
|------|------|
| AI 对话里搜商品、看详情、发品 | **goofish-cli MCP** |
| 研究 Mtop 签名、文案模板 | **本仓库 `demo/xianyu` 脚本** |
| 长连接收消息 | goofish-cli WebSocket 工具 |

## 本机现状（2026-06-25）

当前 `~/.cursor/mcp.json` 仅配置 `waimai-mcp`、`openclaw-gateway`，**未接入闲鱼 MCP**。

## 风险

- 均非官方服务，接口随闲鱼页面变更而失效
- Playwright 需本机图形环境或 headed 登录
- 勿将 Cookie/Profile 目录提交到 Git
