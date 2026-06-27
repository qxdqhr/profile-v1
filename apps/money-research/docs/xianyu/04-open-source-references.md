# 开源项目与工具参考

## 1. 项目对比

| 项目 | Stars | 语言 | 路线 | 发品 | IM | 维护状态 |
|------|-------|------|------|------|-----|----------|
| [cv-cat/XianYuApis](https://github.com/cv-cat/XianYuApis) | ~275 | Python/JS | Web Mtop | ✅ | ⚠️ | 活跃 |
| [cv-cat/XianyuAndroidApis](https://github.com/cv-cat/XianyuAndroidApis) | — | Python/Frida | App 签名 RPC | ⚠️ | ❌ | 示例级 |
| [Kaguya233qwq/myfish](https://github.com/Kaguya233qwq/myfish) | — | Python | App 协议 + WS | ⚠️ | ✅ | 活跃 |
| [fancyboi999/goofish-cli](https://github.com/fancyboi999/goofish-cli) | — | Go | Web Mtop | ✅ | ✅ | 活跃 |
| [laozuzhen/xianyu-openclaw-channel](https://github.com/laozuzhen/xianyu-openclaw-channel) | — | Python | Playwright | ✅ | ⚠️ | — |

---

## 2. cv-cat/XianYuApis（Web 发品参考）

**仓库**：https://github.com/cv-cat/XianYuApis

**核心文件**：`goofish_apis.py`

**已实现接口：**

| 方法 | Mtop API |
|------|----------|
| `get_token()` | `mtop.taobao.idlemessage.pc.login.token` |
| `refresh_token()` | `mtop.taobao.idlemessage.pc.loginuser.get` |
| `upload_media()` | `stream-upload.goofish.com/api/upload.api` |
| `get_item_info()` | `mtop.taobao.idle.pc.detail` |
| `get_public_channel()` | `mtop.taobao.idle.kgraph.property.recommend` |
| `get_default_location()` | `mtop.taobao.idle.local.poi.get` |
| `public()` | `mtop.idle.pc.idleitem.publish` |

**签名**：`utils/goofish_utils.py` → `generate_sign(t, token, data)`

**使用方式：**

```python
from goofish_apis import XianyuApis
from utils.goofish_utils import trans_cookies, generate_device_id

cookies = trans_cookies("cookie2=xxx; _m_h5_tk=xxx; unb=xxx; ...")
client = XianyuApis(cookies, generate_device_id(cookies['unb']))
result = client.public(
    images_path=["/path/to/img.jpg"],
    goods_desc="测试商品标题",
    price={"current_price": 99.0, "original_price": 199.0},
    ds={"choice": "包邮", "can_self_pickup": False}
)
```

**价值**：★★★★★ — **发品 PoC 最直接参考**

---

## 3. cv-cat/XianyuAndroidApis（App 签名 RPC）

**仓库**：https://github.com/cv-cat/XianyuAndroidApis

**架构：**

```
Frida 注入 com.taobao.idlefish
  → Hook InnerSignImpl.getUnifiedSign
  → RPC 返回 x-sign / x-sgext / x-mini-wua
  → Python 组装请求
```

**关键文件：**

- `goofish_rpc.js` — Frida RPC 脚本
- `goofish_client.py` — Python 客户端

**示例 API**：`mtop.taobao.idle.awesome.detail.unit/1.0/`

**价值**：★★★ — App 签名调试参考，发品需自行扩展

---

## 4. Kaguya233qwq/myfish（Bot 框架）

**仓库**：https://github.com/Kaguya233qwq/myfish

**特点：**

- 纯 Python 异步（asyncio + httpx）
- Sign 算法编译为 Native 二进制模块
- 插件式架构（类似 NoneBot）
- 支持扫码登录、WS 通讯、MessagePack 解包
- 适配器模式可扩展到其他平台

**已实现：**

- ✅ 扫码登录
- ✅ Auth 凭证管理
- ✅ Web 端大部分 API + WS
- ✅ 插件开发体验

**价值**：★★★★ — **IM Bot / 自动客服** 首选框架

---

## 5. fancyboi999/goofish-cli（CLI 工具）

**仓库**：https://github.com/fancyboi999/goofish-cli

**命令清单（16 个）：**

| 命令 | 说明 | 写操作 |
|------|------|--------|
| `auth login` | 导入 Cookie/JSON 登录态 | ❌ |
| `auth status` | 检查登录态 | ❌ |
| `auth reset-guard` | 解除风控熔断 | ❌ |
| `item get` | 商品详情 | ❌ |
| `item publish` | 发布商品 | ✅ |
| `item delete` | 下架/删除 | ✅ |
| `media upload` | 图片上传 | ✅ |
| `category recommend` | AI 类目识别 | ❌ |
| `location default` | 默认发布地址 | ❌ |
| `im chats` | 会话列表 | ❌ |
| `im history` | 历史消息 | ❌ |
| `im send` | 发送消息 | ✅ |
| `im watch` | WS 监听 | ❌ |

**Skill 体系（AI Agent 集成）：**

- `goofish-publish-item` — 发品全流程
- `goofish-reply-buyer` — 买家消息自动回复
- `goofish-risk-guard` — 风控护栏
- `goofish-shop-diagnosis` — 店铺诊断

**价值**：★★★★★ — **功能最全的开箱工具**，Go 实现，带风控

---

## 6. laozuzhen/xianyu-openclaw-channel（Playwright 方案）

**仓库**：https://github.com/laozuzhen/xianyu-openclaw-channel

**路线**：Playwright 浏览器自动化

**API 端点：**

- `POST /api/products/publish` — 单个发品
- `POST /api/products/batch-publish` — 批量发品
- `GET /api/products/templates` — 模板

**防检测策略：**

- 禁用 `AutomationControlled`
- 真实 User-Agent
- 操作随机延迟 0.5-1.5s
- 商品间延迟 5-15s

**价值**：★★★ — 适合不想碰协议的场景

---

## 7. 选型建议

| 你的目标 | 推荐项目 | 理由 |
|----------|----------|------|
| 快速验证 Web 发品 | XianYuApis | Python、代码简单、发品链路完整 |
| 生产级 CLI 工具 | goofish-cli | 命令齐全、风控内置、持续维护 |
| IM 自动客服 Bot | myfish | 异步框架、WS 支持、插件生态 |
| App 全接口 | XianyuAndroidApis + 自研 | Frida 签名 + 自行封装 |
| 低代码/免协议 | xianyu-openclaw-channel | Playwright 模拟 |

---

## 8. 本地试用建议

### 快速试用 goofish-cli

```bash
# 安装（以 release 二进制或 go install 为准，参见仓库 README）
go install github.com/fancyboi999/goofish-cli@latest

# 导入 Cookie
goofish auth login --cookie "cookie2=xxx; _m_h5_tk=xxx; ..."

# 检查状态
goofish auth status

# 发布测试
goofish item publish \
  --title "测试商品" \
  --desc "调研测试，勿拍" \
  --images ./test.jpg \
  --price 0.01
```

### 快速试用 XianYuApis

```bash
git clone https://github.com/cv-cat/XianYuApis.git
cd XianYuApis
pip install -r requirements.txt
# 编辑 goofish_apis.py 底部 cookies_str
python goofish_apis.py
```

> ⚠️ 试用请使用测试账号，发布低价测试品并及时下架。

---

## 9. 可复用的技术组件

| 组件 | 来源 | 用途 |
|------|------|------|
| `generate_sign()` | XianYuApis | Web H5 MD5 签名 |
| `trans_cookies()` | XianYuApis | Cookie 字符串解析 |
| `generate_device_id()` | XianYuApis | 从 unb 生成 deviceId |
| Frida RPC 签名 | XianyuAndroidApis | App 签名服务 |
| 风控词表 | goofish-cli | 发布前扫描 |
| MessagePack 解包 | myfish | IM 消息解析 |
| 议价策略 | goofish-cli skill | 三档议价逻辑 |
