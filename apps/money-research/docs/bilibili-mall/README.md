# B 站会员购 / 票务自动化调研

> 调研目录：`moneyResearch/bilibili-mall/`  
> 目标：评估会员购市集购物与会员购票务的 API 自动化可行性

## 调研结论（摘要）

| 路径 | 适用场景 | 个人可用 | 技术门槛 | 合规性 |
|------|----------|----------|----------|--------|
| **官方开放平台** | 无面向 C 端的会员购/票务开放 API | ❌ | — | ✅ |
| **show.bilibili.com 票务 API** | 漫展/演出查询、抢票下单 | ⚠️ Cookie | 中-高 | ⚠️ 灰色 |
| **mall.bilibili.com 市集 API** | C2C 盲盒市集浏览、商品详情 | ⚠️ Cookie（部分可匿名） | 中 | ⚠️ 灰色 |
| **浏览器自动化 + 极验** | 高频抢票、滑块验证 | ✅ | 中 | ⚠️ 灰色 |

**核心发现**：B 站**没有**公开的会员购/票务 REST 开放平台。业务接口分布在 `show.bilibili.com`（票务）与 `mall.bilibili.com`（实物/市集），鉴权依赖 **SESSDATA**、**bili_jct**（CSRF），部分主站接口需 **bili_ticket** / **WBI 签名**。

## 支持的操作矩阵

### 票务（show.bilibili.com）

| 分类 | 操作 | Demo |
|------|------|------|
| 认证 | Cookie 登录检测 | ✅ `01_cookie_login` |
| 签名 | 生成 bili_ticket | ✅ `02_bili_ticket` |
| 解析 | 项目/市集链接解析 | ✅ `03_parse_link` |
| 查询 | 场次/票档、购票人、地址 | ✅ `04_list_inventory` |
| 下单 | 预下单 prepare（获取 token） | ✅ `05_prepare_order` |
| 流程 | 解析→选票→预下单 | ✅ `06_pipeline` |
| 下单 | createV2 创建订单 | 📄 调研（Demo 默认 dry-run） |
| 风控 | 极验 gaia_vtoken | 📄 需人工/Playwright |

### 会员购市集（mall.bilibili.com）

| 分类 | 操作 | Demo |
|------|------|------|
| 浏览 | C2C 市集列表 | ✅ `04`（`--market`） |
| 详情 | 商品详情 queryC2cItemsDetail | ✅ `04` |
| 下单 | 市集购买下单 | 📄 调研文档 |

## 购票流程

```
Cookie（SESSDATA + bili_jct）
    ↓
① 登录检测 GET /x/web-interface/nav
    ↓
② 解析项目链接 → project_id
    ↓
③ GET /api/ticket/project/getV2
    ↓
④ 选择 screen_id + sku_id，GET 购票人/地址
    ↓
⑤ POST /api/ticket/order/prepare → token
    ↓
⑥ POST /api/ticket/order/createV2（易触发风控）
```

## 文档索引

| 文档 | 内容 |
|------|------|
| [01-official-and-domains.md](./01-official-and-domains.md) | 域名与业务划分 |
| [02-ticket-api.md](./02-ticket-api.md) | 票务核心接口 |
| [03-mall-market-api.md](./03-mall-market-api.md) | 会员购市集接口 |
| [04-subtask-design.md](./04-subtask-design.md) | Demo 子任务设计 |
| [05-mcp-integration.md](./05-mcp-integration.md) | **MCP 服务调研与 Cursor 接入** |
| [demo/README.md](../demo/README.md) | 运行说明 |

## Demo

```bash
cd ../demo && source .venv/bin/activate
python bilibili-mall/scripts/02_bili_ticket.py
python bilibili-mall/scripts/03_parse_link.py --url "https://show.bilibili.com/platform/detail.html?id=12345"
python bilibili-mall/scripts/06_pipeline.py --url "..." --dry-run
```
