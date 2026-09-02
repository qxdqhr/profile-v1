# 闲鱼 Mtop 内部协议 API 调研

> ⚠️ 以下接口为闲鱼 Web/App 客户端实际调用的 **Mtop 网关**接口，**非公开开放平台文档**。用于技术调研，生产使用存在账号封禁与服务条款风险。

## 1. Mtop 协议基础

### 1.1 网关

| 端 | 基础 URL |
|----|----------|
| Web/PC H5 | `https://h5api.m.goofish.com/h5/{api_name}/{version}/` |
| App | `https://acs.m.taobao.com/gw/{api_name}/{version}/` 等 |
| 图片上传 | `https://stream-upload.goofish.com/api/upload.api` |
| 登录/passport | `https://passport.goofish.com/` |

### 1.2 公共 Query 参数

| 参数 | 示例 | 说明 |
|------|------|------|
| `jsv` | `2.7.2` | JS SDK 版本 |
| `appKey` | `34839810` | Web 端固定 appKey |
| `t` | 毫秒时间戳 | |
| `sign` | MD5 签名 | 见下方签名算法 |
| `v` | `1.0` / `2.0` | API 版本 |
| `type` | `originaljson` | |
| `accountSite` | `xianyu` | |
| `dataType` | `json` | |
| `api` | `mtop.idle.pc.idleitem.publish` | API 名称 |
| `sessionOption` | `AutoLoginOnly` | |

### 1.3 Web H5 签名算法

```python
import hashlib

def generate_sign(t: str, token: str, data: str) -> str:
    """token 来自 Cookie _m_h5_tk 的前半段（下划线前）"""
    raw = f"{token}&{t}&{app_key}&{data}"
    return hashlib.md5(raw.encode()).hexdigest()
```

- `app_key` Web 端常用值：`34839810`
- Cookie 关键字段：`_m_h5_tk`、`_m_h5_tk_enc`、`cookie2`、`unb`、`tracknick` 等
- 令牌过期时接口返回 `ret` 含「令牌过期」，需重新请求 `_m_h5_tk`

### 1.4 App 端签名（更复杂）

App 请求额外需要 Header：

| Header | 说明 |
|--------|------|
| `x-sign` | 统一签名 |
| `x-sgext` | 安全扩展 |
| `x-mini-wua` | 设备风控参数 |
| `x-umt` | |
| `x-devid` / `utdid` | 设备 ID |
| `x-sid` | 会话 |
| `x-uid` | 用户 ID |

签名实现位于 `mtopsdk.security.InnerSignImpl.getUnifiedSign`，通常需 **Frida Hook** 或 **Unidbg/Native 模块** 调用。

---

## 2. 发品链路 API（Web PC 端）

> 参考开源实现：cv-cat/XianYuApis `goofish_apis.py`

### 2.1 完整发品流程

```
登录态 Cookie
    ↓
① 图片上传 (stream-upload.goofish.com)
    ↓
② 类目推荐 (mtop.taobao.idle.kgraph.property.recommend)
    ↓
③ 获取发布地址 (mtop.taobao.idle.local.poi.get)
    ↓
④ 提交发品 (mtop.idle.pc.idleitem.publish)
```

### 2.2 接口详情

#### ① 图片上传

```
POST https://stream-upload.goofish.com/api/upload.api
```

- 需 Cookie 登录态
- 返回：`object.url`、`object.pix`（如 `800x600`）

#### ② 类目/属性推荐

```
POST https://h5api.m.goofish.com/h5/mtop.taobao.idle.kgraph.property.recommend/2.0/
api=mtop.taobao.idle.kgraph.property.recommend
v=2.0
```

**请求体关键字段：**

```json
{
  "title": "商品标题",
  "description": "描述",
  "publishScene": "mainPublish",
  "scene": "newPublishChoice",
  "imageInfos": [{"url": "...", "widthSize": 800, "heightSize": 600, "major": true}]
}
```

**返回**：`categoryPredictResult`（catId、catName、channelCatId、tbCatId）、`cardList`（属性卡片）

#### ③ 发布地址 POI

```
POST https://h5api.m.goofish.com/h5/mtop.taobao.idle.local.poi.get/1.0/
api=mtop.taobao.idle.local.poi.get
```

**请求体：**

```json
{"longitude": 118.78, "latitude": 31.91}
```

**返回**：`commonAddresses[]` → divisionId、poiId、city、prov、area 等

#### ④ 发品提交（核心）

```
POST https://h5api.m.goofish.com/h5/mtop.idle.pc.idleitem.publish/1.0/
api=mtop.idle.pc.idleitem.publish
v=1.0
```

**请求体结构（精简）：**

```json
{
  "itemTypeStr": "b",
  "quantity": "1",
  "simpleItem": "true",
  "imageInfoDOList": [...],
  "itemTextDTO": {"title": "...", "desc": "..."},
  "itemPriceDTO": {"priceInCent": "99900", "origPriceInCent": "199900"},
  "itemPostFeeDTO": {
    "canFreeShipping": true,
    "supportFreight": true,
    "templateId": "0"
  },
  "itemAddrDTO": {
    "divisionId": "...",
    "poiId": "...",
    "gps": "lng,lat",
    "city": "...", "prov": "..."
  },
  "itemCatDTO": {
    "catId": "...",
    "channelCatId": "...",
    "tbCatId": "..."
  },
  "itemLabelExtList": [...],
  "publishScene": "pcMainPublish",
  "bizcode": "pcMainPublish",
  "sourceId": "pcMainPublish"
}
```

**邮费模式 `itemPostFeeDTO`：**

| 模式 | 字段设置 |
|------|----------|
| 包邮 | `canFreeShipping=true, supportFreight=true` |
| 按距离 | `supportFreight=true, templateId="-100"` |
| 一口价邮费 | `postPriceInCent`, `templateId="0"` |
| 无需邮寄 | `templateId="0"` |

---

## 3. 登录与鉴权 API

| API | URL 路径 | 说明 |
|-----|----------|------|
| `mtop.taobao.idlemessage.pc.login.token` | `/h5/mtop.taobao.idlemessage.pc.login.token/1.0/` | 获取/刷新 token |
| `mtop.taobao.idlemessage.pc.loginuser.get` | `/h5/mtop.taobao.idlemessage.pc.loginuser.get/1.0/` | 刷新登录用户信息 |
| `hasLogin.do` | `passport.goofish.com/newlogin/hasLogin.do` | 检测登录状态 |

**Cookie 获取方式：**

1. 浏览器登录 www.goofish.com → 导出 Cookie
2. 扫码登录（myfish 等框架支持）
3. Playwright 持久化 Context

---

## 4. 商品查询与管理 API

| API | 说明 |
|-----|------|
| `mtop.taobao.idle.pc.detail` | PC 商品详情 |
| `mtop.taobao.idle.awesome.detail.unit` | App 商品详情（需 App 签名） |
| `mtop.taobao.idle.pc.idleitem.downshelf` | 下架（待验证，CLI 工具引用） |
| `mtop.taobao.idle.pc.idleitem.delete` | 删除（待验证） |

---

## 5. IM 消息 API

| API / 协议 | 说明 |
|------------|------|
| WebSocket | 闲鱼 IM 长连接（myfish、goofish-cli 已实现） |
| `mtop.taobao.idlemessage.*` | 消息相关 Mtop |
| MessagePack | 部分消息体使用 msgpack 编码 |

**goofish-cli 已实现：**

- `im chats` — 会话列表
- `im history` — 历史消息
- `im send` — 发送消息
- `im watch` — WebSocket 监听

---

## 6. App 端额外接口（需 Native 签名）

| API | 说明 |
|-----|------|
| `mtop.taobao.idle.pc.idleitem.publish` | 部分版本 App 也走类似命名 |
| `mtop.taobao.idle.post.item` | App 发品（版本差异大） |
| `mtop.taobao.idle.user.page.head` | 用户主页 |
| `mtop.taobao.idle.search.*` | 搜索相关 |

> App 与 Web 的 `appKey`、签名算法、参数结构可能不同，需按目标版本抓包确认。

---

## 7. 风控相关

| 现象 | 原因 | 处理 |
|------|------|------|
| HTTP 419 | 滑块/风控 | 需 `x5sec` cookie，人工过滑块 |
| 「令牌过期」 | `_m_h5_tk` 失效 | 重新请求 token 接口 |
| 发布失败/限流 | 频率过高 | 随机延迟 5-15s/商品 |
| 签名错误 | token/device 不匹配 | 检查 cookie 完整性 |
| ISV 类错误 | 账号异常 | 降频或人工介入 |

**关键 Cookie/参数：**

- `_m_h5_tk` / `_m_h5_tk_enc`
- `x5sec`（滑块通过后）
- `unb`（用户 ID，也用于生成 deviceId）
- `cookie2`、`t`、`_tb_token_`

---

## 8. Web vs App 路线选择

| 维度 | Web Mtop (PC) | App Mtop |
|------|---------------|----------|
| 签名难度 | 低（MD5 + Cookie） | 高（Native 签名） |
| 功能覆盖 | 发品/详情/部分 IM | 全功能 |
| 稳定性 | App 改版影响小 | 每次大版本需适配 |
| 多账号 | Cookie 隔离即可 | 需多设备/多实例 |
| 推荐场景 | **批量发品、轻量 Bot** | 全链路深度自动化 |

**调研建议**：优先基于 **Web PC Mtop** 做 PoC，签名简单、文档/开源参考多。
