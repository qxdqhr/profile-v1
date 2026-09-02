# 小红书 Demo 子任务设计

## 脚本清单

| 步骤 | 脚本 | 输入 | 输出 |
|------|------|------|------|
| 01 | `01_cookie_login.py` | Cookie | 登录态、昵称、user_id |
| 02 | `02_sign.py` | URI、body | x-s、x-t、x-s-common |
| 03 | `03_copywriting.py` | 主题、要点 | title、desc、topics |
| 04 | `04_upload_image.py` | 图片路径 | file_id、宽高 |
| 05 | `05_publish_note.py` | 标题、正文、图片 | note_id 或 dry-run 预览 |
| 06 | `06_pipeline.py` | 主题 + 图片 | 串联 03→05 |

## 错误处理

| 场景 | 表现 | 处理 |
|------|------|------|
| 无 Cookie | `未提供 Cookie` | 写入 `data/cookies.json` |
| Cookie 过期 | `登录失效` / 401 | 重新浏览器登录 |
| 签名失败 | `SignError` | 更新 `xhs` 库版本 |
| 发布风控 | `NeedVerifyError` / captcha 124 | 改用手动发布或 Playwright |
| 标题过长 | 平台截断 | 脚本自动截断至 20 字 |
| 无图片 | 图文笔记失败 | 至少提供 1 张本地图片 |

## 依赖

- `requests`：HTTP
- `xhs`：签名与创作者 API 封装（基于社区逆向，见 `04-open-source-references.md`）
- `lxml`：`xhs` 上传流程依赖

## Web 测试台 API

| 路由 | 脚本 |
|------|------|
| `POST /api/xiaohongshu/cookie-login` | 01 |
| `POST /api/xiaohongshu/sign` | 02 |
| `POST /api/xiaohongshu/copywriting` | 03 |
| `POST /api/xiaohongshu/upload-image` | 04 |
| `POST /api/xiaohongshu/publish` | 05 |
| `POST /api/xiaohongshu/pipeline` | 06 |
