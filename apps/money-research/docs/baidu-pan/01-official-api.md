# 百度网盘开放平台 API 调研

## 1. 官方入口

- 开放平台：https://pan.baidu.com/union/home
- 文档中心：https://pan.baidu.com/union/doc/

## 2. 分享转存官方接口

### `POST /rest/2.0/xpan/share?method=transfer`

- 文档：https://pan.baidu.com/union/doc/xksmyoqgv
- 鉴权：`access_token`（OAuth）
- 参数：`shareid`、`from`（分享者 uk）、`sekey`（randsk）、`fsidlist`、`path`

### APaaS 版本（付费）

- `POST /apaas/1.0/share/transfer?product=netdisk`
- 需 `appid`、`access_token`、`short_url`、`spwd`（加密提取码）
- 部分能力需购买分享服务

## 3. 与 Web Cookie 路线对比

| 维度 | 官方 OAuth | Web Cookie |
|------|------------|------------|
| 申请门槛 | 开发者注册 + 审核 | 浏览器导出 Cookie |
| 转存 | access_token 调用 | BDUSS + bdstoken |
| 合规 | ✅ | ⚠️ 灰色 |
| 个人可用 | 需应用审核 | ✅ |
| 稳定性 | 高 | 中（随页面改版） |

## 4. 其他官方能力（节选）

| API | 说明 |
|-----|------|
| `xpan/file` | 文件管理 |
| `xpan/share` | 分享管理 |
| `xpan/multimedia` | 上传下载 |

## 5. 结论

个人自动化转存 **优先 Web Cookie PoC**；若产品化需走开放平台 OAuth 并评估 APaaS 计费。
