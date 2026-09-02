# moneyResearch

副业 / 平台自动化调研与 Demo。

## 目录

| 路径 | 说明 |
|------|------|
| [xianyu/](./xianyu/) | 闲鱼 API 调研文档 |
| [baidu-pan/](./baidu-pan/) | 百度网盘转存调研文档 |
| [quark-pan/](./quark-pan/) | 夸克网盘转存调研文档 |
| [xiaohongshu/](./xiaohongshu/) | 小红书发帖调研文档 |
| [bilibili-mall/](./bilibili-mall/) | B 站会员购/票务调研文档 |
| **[demo/](./demo/)** | **统一 Demo（多平台脚本 + Next.js 测试台）** |

## 快速开始

```bash
cd demo
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cd web && npm install && npm run dev
```

访问 http://localhost:3000，切换各平台标签页测试。

## MCP 服务对照（2026-06-25）

本机 `~/.cursor/mcp.json` 当前仅配置 `waimai-mcp`，**以下平台 MCP 均未接入**。各主题目录含接入调研文档：

| 平台 | 有 MCP？ | 推荐服务 | 能否替代本仓库 Demo | 文档 |
|------|----------|----------|---------------------|------|
| 闲鱼 | ✅ 社区 | [goofish-cli](https://github.com/fancyboi999/goofish-cli) | 发品/搜索可替代；签名演示仍用 Demo | [xianyu/06-mcp-integration.md](./xianyu/06-mcp-integration.md) |
| 百度网盘 | ✅ **官方** | [baidu-netdisk/mcp](https://github.com/baidu-netdisk/mcp) | **不能**替代分享转存；可管自有文件 | [baidu-pan/04-mcp-integration.md](./baidu-pan/04-mcp-integration.md) |
| 夸克网盘 | ✅ 社区 | [quark-nd-mcp](https://github.com/MichealJl/quark-nd-mcp) | **不能**替代分享转存；可管网盘内文件 | [quark-pan/03-mcp-integration.md](./quark-pan/03-mcp-integration.md) |
| 小红书 | ✅ 社区 | [xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp) | 发帖可优先 MCP；签名研究用 Demo | [xiaohongshu/05-mcp-integration.md](./xiaohongshu/05-mcp-integration.md) |
| B站会员购 | ❌ 票务专用 | 仅视频向 `@mcpcn/mcp-bilibili` | 购票仍用 Demo | [bilibili-mall/05-mcp-integration.md](./bilibili-mall/05-mcp-integration.md) |

## 原则

- **调研文档** → 各主题目录
- **可运行 Demo** → 统一放在根目录 `demo/` 下
