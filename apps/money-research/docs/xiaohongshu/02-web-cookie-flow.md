# 小红书 Web Cookie 与内部 API

## 关键域名

| 域名 | 用途 |
|------|------|
| `www.xiaohongshu.com` | 主站 H5 |
| `edith.xiaohongshu.com` | 主 API 网关（读 + 部分写） |
| `creator.xiaohongshu.com` | 创作者后台页面与部分写接口 |
| `ros-upload.xiaohongshu.com` | 图片/视频 COS 直传 |

## Cookie 获取

1. 浏览器登录 https://www.xiaohongshu.com
2. DevTools → Application → Cookies
3. 复制完整 Cookie 字符串到 `demo/xiaohongshu/data/cookies.json`

### 关键字段

| 字段 | 说明 |
|------|------|
| `a1` | 设备标识，参与 x-s-common 签名 |
| `webId` | Web 设备 ID |
| `web_session` | 登录会话（核心） |
| `gid` | 设备指纹相关 |

## 请求签名（PC Web）

每个 `edith` 请求需携带：

| Header | 说明 |
|--------|------|
| `x-s` | 请求签名（MD5 + 自定义编码） |
| `x-t` | 毫秒时间戳 |
| `x-s-common` | 公共参数 JSON 的自定义 Base64 |

算法参考开源库 `xhs`（ReaJason/xhs）的 `help.sign()`。Demo 在 `demo/xiaohongshu/lib/sign.py` 中封装。

## 核心接口速查

### 认证 / 账号

```
GET  /api/sns/web/v2/user/me          # 当前登录用户
GET  /api/sns/web/v1/user/selfinfo    # 账号信息（旧）
```

### 内容读取

```
POST /api/sns/web/v1/search/notes     # 搜索笔记
GET  /api/sns/web/v1/feed             # 推荐流
GET  /api/sns/web/v1/note/{id}        # 笔记详情
GET  /api/sns/web/v2/comment/page     # 评论列表
GET  /api/sns/web/v1/user/{id}        # 用户主页
```

### 互动写入

```
POST /api/sns/web/v1/note/like        # 点赞
POST /api/sns/web/v1/note/collect     # 收藏
POST /api/sns/web/v1/user/follow      # 关注
POST /api/sns/web/v1/comment/post     # 评论
```

### 创作者发布（重点）

```
GET  /api/media/v1/upload/web/permit?biz_name=spectrum&scene=image&file_count=1
PUT  https://ros-upload.xiaohongshu.com/{file_id}   # 直传图片
POST /web_api/sns/v2/note                           # 发布图文/视频笔记
```

发布请求体要点：

- `common.note_type`: `normal`（图文）/ `video`（视频）
- `image_info.images[].file_id`: 上传返回的 spectrum 路径
- `hash_tag`: 话题列表（可先 `get_suggest_topic` 搜索）
- `title`: 最多约 20 字
- `desc`: 正文，可内嵌 `#话题#`

## 与百度/夸克 Demo 的差异

网盘 Demo 侧重「分享链接 → 转存 → 再分享」；小红书 Demo 侧重「文案 → 上传 → 发帖」，签名与风控是主要技术难点。
