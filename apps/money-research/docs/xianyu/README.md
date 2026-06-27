# 闲鱼自动化工具可行性调研

> 调研目录：`/home/qhr/Desktop/project/moneyResearch/xianyu/`  
> 创建日期：2026-06-25  
> 目标：评估闲鱼平台「上架、发布、下架、消息、订单」等操作的自动化可行性

## 调研结论（摘要）

| 路径 | 适用场景 | 个人卖家可用 | 技术门槛 | 合规性 |
|------|----------|--------------|----------|--------|
| **官方 TOP API** | ISV/服务商、已验货/同城/租赁等垂直业务 | ❌ 需企业入驻 + 运营邀请 | 中 | ✅ 合规 |
| **闲鱼小程序开放平台** | 小程序内 H5 业务、订单闭环 | ❌ 定向邀请服务商 | 中 | ✅ 合规 |
| **Web Mtop 协议（PC/H5）** | 个人卖家批量发品、客服 Bot | ⚠️ Cookie 登录态 | 中-高 | ⚠️ 灰色 |
| **App Mtop + 签名逆向** | 全功能 App 级自动化 | ⚠️ 需设备/Frida | 高 | ⚠️ 灰色 |
| **浏览器自动化（Playwright）** | 低频次、人工辅助发品 | ✅ | 低-中 | ⚠️ 灰色 |

**核心发现**：闲鱼**没有**面向普通个人卖家的公开「发商品」REST API。普通 C 端发品能力主要存在于 Web/App 内部的 **Mtop 网关**；官方 TOP 接口以 **ISV 服务商** 为主，且多数需 **企业资质 + 闲鱼运营准入**。

## 文档索引

| 文档 | 内容 |
|------|------|
| [01-official-api.md](./01-official-api.md) | 淘宝/闲鱼开放平台官方 TOP API 清单与接入条件 |
| [02-mtop-protocol-api.md](./02-mtop-protocol-api.md) | Web/App 内部 Mtop 接口（发品、上传、类目、IM 等） |
| [03-automation-feasibility.md](./03-automation-feasibility.md) | 三种技术路线对比与推荐实施路径 |
| [04-open-source-references.md](./04-open-source-references.md) | 开源项目与 CLI 工具参考 |
| [05-risks-and-next-steps.md](./05-risks-and-next-steps.md) | 风控、合规风险与后续调研计划 |
| [06-mcp-integration.md](./06-mcp-integration.md) | **MCP 服务调研与 Cursor 接入** |

## 关键官方入口

- 闲鱼三方开放平台：https://open.goofish.com/doc/
- 淘宝开放平台 API 文档：https://open.taobao.com/api
- TOP 正式网关：`https://gw.api.taobao.com/router/rest`
- TOP 预发网关：`https://pre-gw.api.taobao.com/top/router/rest`
- Web Mtop 网关：`https://h5api.m.goofish.com/h5/{api}/{version}/`
- 图片上传 CDN：`https://stream-upload.goofish.com/api/upload.api`

## 发品相关 API 速查

### 官方（需 ISV 权限）

- `alibaba.idle.isv.item.publish` — 服务商商品发布
- `alibaba.idle.isv.item.edit` — 商品编辑
- `alibaba.idle.isv.item.downshelf` — 商品下架
- `alibaba.idle.isv.item.query` — 商品查询
- `alibaba.idle.isv.media.upload` — 图片上传
- `alibaba.idle.isv.auth.item.publish` — 同城三方服务商品发布
- `alibaba.idle.isv.auth.item.edit` — 同城三方服务商品编辑

### Web Mtop（Cookie + H5 签名）

- `mtop.idle.pc.idleitem.publish` — PC 端发品（核心）
- `mtop.taobao.idle.kgraph.property.recommend` — 类目/属性推荐
- `mtop.taobao.idle.local.poi.get` — 发布地址/POI
- `stream-upload.goofish.com` — 图片上传

## Demo 代码

可运行 Demo 位于仓库根目录 **[`../demo/`](../demo/)**：

- `demo/xianyu/` — 闲鱼脚本
- `demo/baidu-pan/` — 百度网盘脚本
- `demo/web/` — Next.js 统一测试台

本目录仅保留调研文档。

## 下一步

1. 明确业务形态：个人闲置 vs 企业 ISV vs 同城服务
2. 若走官方路线 → 联系闲鱼运营申请 ISV 准入（见 `01-official-api.md`）
3. 若走协议/自动化路线 → 搭建 Cookie 登录态管理 + 签名模块 PoC（见 `03-automation-feasibility.md`）
4. 小规模实测风控阈值（发布频率、IP、设备指纹）
