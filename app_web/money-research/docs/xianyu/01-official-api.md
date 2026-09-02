# 闲鱼官方开放平台 API 调研

## 1. 平台架构概览

闲鱼 API 体系挂载在 **淘宝开放平台（TOP）** 之上，分为多条业务线：

```
淘宝开放平台 (TOP)
├── 闲鱼（通用）
├── 闲鱼已验货
├── 闲鱼电商 SAAS
├── 闲鱼租赁
├── 闲鱼回收
├── 闲鱼同城/三方服务
└── 闲鱼小程序（open.goofish.com）
```

### 网关地址

| 环境 | HTTP | HTTPS |
|------|------|-------|
| 正式 | `http://gw.api.taobao.com/router/rest` | `https://eco.taobao.com/router/rest` |
| 预发 | — | `https://pre-gw.api.taobao.com/top/router/rest` |

### 公共请求参数

| 参数 | 必须 | 说明 |
|------|------|------|
| `method` | ✅ | API 名称，如 `alibaba.idle.isv.item.publish` |
| `app_key` | ✅ | 应用 AppKey |
| `sign_method` | ✅ | `hmac` 或 `md5` |
| `sign` | ✅ | 参数签名 |
| `timestamp` | ✅ | `yyyy-MM-dd HH:mm:ss`，GMT+8 |
| `v` | ✅ | 固定 `2.0` |
| `session` | 视接口 | OAuth 授权 token（需授权接口必传） |
| `format` | 否 | `json` 或 `xml` |

### 授权方式

- **OAuth 2.0**：前端拿 `code` → 服务端 `taobao.top.auth.token.create` 换 `accessToken`
- **测试授权页**：`https://open.api.goofish.com/authorize?response_type=token&client_id=${appKey}&sp=xianyu&force_auth=true`（token 有效期 180 天）

---

## 2. 接入门槛（重要）

### 闲鱼小程序开放平台

> 来源：https://open.goofish.com/doc/quick-start.html

- **不对外公开申请**，仅面向闲鱼运营小二**定向邀请**的服务商
- 需 **淘宝企业账号**，且「淘宝开放平台入驻主体 = 闲鱼入驻主体 = 合同签约主体」三者一致
- 小程序后端接口**必须部署在阿里云聚石塔**
- AppKey 类目：
  - C 端：`闲鱼垂直行业-C端`
  - B 端（订单能力）：`闲鱼垂直行业-B端`

### ISV 商品发布 API

- 错误码 `ISV_NOTALLOW_ACCESS`：服务商未准入 → 需联系闲鱼运营
- 错误码 `TOP_USER_NOT_IDLE`：登录用户不是闲鱼用户 → 需闲鱼 App 登录

**结论**：普通个人开发者**无法直接申请**官方发品 API，除非成为签约 ISV 或特定垂直行业（已验货、同城服务、租赁等）合作方。

---

## 3. 商品相关官方 API（发品链路）

### 3.1 核心发品接口

#### `alibaba.idle.isv.item.publish` — 服务商闲鱼商品发布

- 文档：https://open.fliggy.com/docs/api.htm?apiId=47401
- 类目：**闲鱼已验货**
- 需授权：✅

**请求参数 `item_param`（IdleItemApiDo）主要字段：**

| 字段 | 必须 | 说明 |
|------|------|------|
| `title` | ✅ | 标题，≤30 字 |
| `desc` | ✅ | 描述，≤5000 字 |
| `reserve_price` | ✅ | 售价（元） |
| `images` | ✅ | 图片 ID 列表（最多 9 张，来自 upload 接口） |
| `category_id` | ✅ | 商品类目 ID |
| `channel_cat_id` | 可选 | 渠道类目 ID |
| `division_id` | ✅ | 行政区划 ID（6 位） |
| `sp_biz_type` | ✅ | 业务分类（手机:1, 潮品:2, 3C:9 等） |
| `stuff_status` | 可选 | 新旧程度 0-100 |
| `transport_fee` | 可选 | 邮费 |
| `original_price` | 可选 | 原价 |
| `trade_type` | 可选 | 0 仅在线 / 1 仅线下 / 2 均可 |
| `pv_list` | 可选 | 属性键值对（品牌、型号等） |
| `item_sku_list` | 可选 | SKU 列表 |

#### `alibaba.idle.isv.media.upload` — 图片上传

- 文档：https://developer.alibaba.com/docs/api.htm?apiId=47466
- 参数：`data`（byte[]）、`name`（文件名）、`type`（0=图片，1=视频暂不支持）
- Content-Type：`multipart/form-data`

#### `alibaba.idle.isv.item.edit` — 商品编辑

- 在 publish 基础上增加 `item_id` 字段

#### `alibaba.idle.isv.item.downshelf` — 商品下架

#### `alibaba.idle.isv.item.query` — 单商品查询

#### `alibaba.idle.isv.item.query.batch` — 批量查询

### 3.2 发品辅助接口

| API | 说明 |
|-----|------|
| `alibaba.idle.isv.item.cpv.recommend` | 类目属性推荐 |
| `alibaba.idle.isv.item.cpv.recommend.property.search` | 属性搜索 |
| `alibaba.idle.isv.item.cpv.category.fulltree` | 类目全树 |
| `alibaba.idle.isv.item.cpv.category.fulltree.with.priv` | 带权限类目树 |
| `alibaba.idle.isv.item.ai.desc.generate` | AI 生成描述 |
| `alibaba.idle.isv.item.price.advice` | 定价建议 |
| `alibaba.idle.isv.item.ship.type` | 发货方式 |
| `alibaba.idle.isv.item.ship.locations.query` | 发货地址查询 |
| `alibaba.idle.isv.item.media.pic.to.id` | 图片 URL 转 ID |
| `alibaba.idle.isv.item.url.query` | 商品 URL 查询 |
| `alibaba.idle.isv.item.qrcode.generate` | 商品二维码 |

### 3.3 同城/三方服务专用

| API | 说明 |
|-----|------|
| `alibaba.idle.isv.auth.item.publish` | 同城三方服务商品发布 |
| `alibaba.idle.isv.auth.item.edit` | 同城三方服务商品编辑 |

文档：https://doc.alidayu.com/docs/api.htm?apiId=74431

---

## 4. 订单相关官方 API（小程序/ISV）

> 来源：https://open.goofish.com/doc/development/dev/server.html

| 序号 | 模块 | 接口 method |
|------|------|-------------|
| 1 | 订单创建 | `alibaba.idle.isv.goosefish.order.create` |
| 2 | 订单查询 | `alibaba.idle.isv.order.query` |
| 3 | 虚拟发货 | `alibaba.idle.isv.goosefish.virtual.delivery` |
| 4 | 物流发货 | `alibaba.idle.isv.order.ship` |
| 5 | 退款查询 | `alibaba.idle.isv.refund.query` |
| 6 | 关闭订单 | `alibaba.idle.isv.order.close` |
| 7 | 部分退款 | `alibaba.idle.isv.order.part.refund` |
| 8 | 发货后退款 | `alibaba.idle.isv.order.after.send.refund` |
| 9 | 退货退款 | `alibaba.idle.isv.order.dealrefund` |
| 10 | 物流公司 | `alibaba.idle.logistics.companies.query` |
| 11 | 用户信息 | `alibaba.idle.goosefish.user.info.query` |
| 12 | 用户年龄 | `alibaba.idle.isv.open.user.age.info.query` |
| 13 | 绑定支付宝 | `alibaba.idle.isv.open.user.bind.account.query` |

### 通用发货（非 ISV 小程序）

| API | 说明 |
|-----|------|
| `alibaba.idle.order.dummy.send` | 闲鱼无需物流发货 |

---

## 5. 其他垂直业务 API（节选）

| 分类 | 代表 API |
|------|----------|
| 租赁 | `alibaba.idle.rent.item.add/edit/query`、`alibaba.idle.rent.media.upload` |
| 回收 | `alibaba.idle.recycle.order.query/perform` |
| 寄卖 | `alibaba.idle.consignment.order.get/perform` |
| 拍卖 | `alibaba.idle.tender.btob.item.upload/delete/query` |
| 电商 SAAS | 闲鱼币抵扣等（`developer.alibaba.com/docs/api.htm?apiId=72059`） |

---

## 6. 小程序 vs 真实发品的关系

> 来源：https://open.goofish.com/doc/development/other/questions.html

**重要概念**：

- 小程序内展示的商品 ≠ 闲鱼 App 内的真实闲置宝贝
- 官方订单流程要求：服务商在闲鱼 App **手动发一个通用商品**，获取 `item_id`，所有小程序订单统一用这个 ID 拉起创单
- 即：**官方小程序路线并不提供「代替用户在闲鱼发闲置」的能力**，而是围绕已有商品做交易闭环

---

## 7. 官方路线适用性评估

| 需求 | 官方 API 能否满足 | 备注 |
|------|-------------------|------|
| 个人卖家批量发闲置 | ❌ | 无公开 C 端发品 API |
| ISV 代运营发品（已验货） | ✅ | 需准入 + `alibaba.idle.isv.item.publish` |
| 同城服务发品 | ✅ | `alibaba.idle.isv.auth.item.publish` |
| 租赁商品管理 | ✅ | `alibaba.idle.rent.item.*` |
| 订单/发货/退款自动化 | ✅ | 小程序 ISV 权限包 |
| 小程序内业务 | ✅ | 定向邀请 |

**若目标是「个人/小团队自动上架闲置」**，官方 API **不是可行路径**；需转向 Mtop 协议或浏览器自动化（见 `02-mtop-protocol-api.md`）。
