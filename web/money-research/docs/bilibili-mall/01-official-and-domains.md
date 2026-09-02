# 域名与业务划分

## 核心域名

| 域名 | 业务 |
|------|------|
| `www.bilibili.com` | 主站，Cookie 来源 |
| `api.bilibili.com` | 主站 API（nav、bili_ticket、WBI） |
| `show.bilibili.com` | 会员购票务（漫展、演出） |
| `mall.bilibili.com` | 会员购商城、盲盒市集 C2C |

## 官方开放能力

B 站开放平台主要面向直播、视频、电商服务商等，**不包含**个人「会员购票」或「市集下单」的公开文档化 API。会员购相关能力均为 Web/App 内部接口。

## Cookie 关键字段

| 字段 | 用途 |
|------|------|
| `SESSDATA` | 登录会话 |
| `bili_jct` | CSRF Token |
| `DedeUserID` | 用户 UID |
| `buvid3` | 设备标识（部分接口 2025+ 必需） |

从 `https://www.bilibili.com` 登录后，在开发者工具 Application → Cookies 中复制。
