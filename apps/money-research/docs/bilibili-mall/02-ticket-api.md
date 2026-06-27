# 票务 API（show.bilibili.com）

## 项目信息

```
GET https://show.bilibili.com/api/ticket/project/getV2
  ?id={project_id}&project_id={project_id}&requestSource=neul-next
```

返回 `screen_list`（场次）及每场的 `ticket_list`（票档/sku）。

## 购票人 / 地址

```
GET https://show.bilibili.com/api/ticket/buyer/list?project_id={id}&src=ticket
GET https://show.bilibili.com/api/ticket/addr/list?project_id={id}&src=ticket
```

需登录 Cookie。

## 预下单

```
POST https://show.bilibili.com/api/ticket/order/prepare?project_id={id}
Content-Type: application/x-www-form-urlencoded

count=1&order_type=1&project_id={id}&screen_id={screen_id}&sku_id={sku_id}
&buyer_info={json}&pay_money={fen}&timestamp={ms}&newRisk=true&requestSource=neul-next
```

返回 `token` 字段，供创建订单使用。

## 创建订单

```
POST https://show.bilibili.com/api/ticket/order/createV2?project_id={id}
```

载荷含 `token`、`deviceId`、`clickPosition`、购票人信息等。不同项目认证规则不同：

- **无证 / 联系人**：`buyer` + `tel`
- **一单一证 / 一人一证**：`buyer_info` JSON 数组

## 常见错误码

| errno | 含义 |
|-------|------|
| 209001 | 缺少联系人姓名/手机 |
| 100001 | 未登录或 Cookie 失效 |
| — | 极验验证（需 gaia_vtoken） |

## 链接格式

- `https://show.bilibili.com/platform/detail.html?id={project_id}`
- `https://show.bilibili.com/ticket/detail?id={project_id}`
