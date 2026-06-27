# 小红书发帖与创作者操作调研

> 调研目录：`moneyResearch/xiaohongshu/`  
> 创建日期：2026-06-25  
> 目标：评估小红书「发帖、互动、数据读取」等操作的自动化可行性

## 调研结论（摘要）

| 路径 | 适用场景 | 个人创作者可用 | 技术门槛 | 合规性 |
|------|----------|----------------|----------|--------|
| **官方开放平台 API** | 电商商家、ERP、打单、商品管理 | ❌ 无个人发帖权限 | 中 | ✅ 合规 |
| **创作者 Web API（Cookie + 签名）** | 图文/视频发布、素材上传 | ⚠️ 需浏览器 Cookie | 中-高 | ⚠️ 灰色 |
| **PC 主站 API（edith + x-s）** | 搜索、读笔记、点赞评论 | ⚠️ 需 Cookie + x-s 签名 | 高 | ⚠️ 灰色 |
| **浏览器自动化（Playwright）** | 低频发帖、规避签名维护 | ✅ | 低-中 | ⚠️ 灰色 |

**核心发现**：小红书**没有**面向个人创作者的官方「发笔记」REST API。开放平台类目以**电商/订单/商品**为主；创作者发布能力存在于 `creator.xiaohongshu.com` 与 `edith.xiaohongshu.com` 的内部接口，需 **Cookie 登录态 + x-s/x-t 请求签名**。

## 支持的操作矩阵

### 官方开放平台（需商家入驻）

| 能力包 | 典型接口 | 个人发帖 |
|--------|----------|----------|
| 商品/库存 | 商品 CRUD、素材中心 | ❌ |
| 订单/售后 | 订单拉取、发货、售后 | ❌ |
| 消息推送 | 商品/订单/售后事件 | ❌ |

### 创作者 / Web 非官方（Cookie 路线，社区逆向）

| 分类 | 操作 | 网关 | Demo 脚本 |
|------|------|------|-----------|
| **认证** | Cookie 登录检测、账号信息 | `edith.xiaohongshu.com` | `01_cookie_login.py` |
| **签名** | 生成 x-s / x-t / x-s-common | 本地算法 | `02_sign.py` |
| **文案** | 标题/正文/话题标签生成 | 本地 | `03_copywriting.py` |
| **素材** | 图片上传（spectrum） | `edith` + COS 上传 | `04_upload_image.py` |
| **发布** | 图文笔记发布 | `edith` `/web_api/sns/v2/note` | `05_publish_note.py` |
| **发布** | 视频笔记发布 | 创作者 API | 调研覆盖，Demo 未实现 |
| **管理** | 我的笔记列表、删除笔记 | `edith` | `01` 可扩展 |
| **读取** | 搜索笔记/用户、笔记详情、评论 | `edith` | 调研覆盖 |
| **互动** | 点赞、收藏、关注、评论 | `edith` | 调研覆盖 |
| **通知** | @、点赞、新关注未读 | `edith` | 调研覆盖 |
| **定时** | 定时发布 | 创作者后台 | 需 Playwright 或扩展 post_time |

## 发帖流程（图文）

```
Cookie（含 a1、web_session）
    ↓
① 登录检测 GET /api/sns/web/v2/user/me
    ↓
② 文案生成（标题 ≤20 字，正文含 #话题）
    ↓
③ 获取上传许可 GET /api/media/v1/upload/web/permit
    ↓
④ PUT 图片至 ros-upload.xiaohongshu.com
    ↓
⑤ POST /web_api/sns/v2/note 发布图文
```

## 文档索引

| 文档 | 内容 |
|------|------|
| [01-official-api.md](./01-official-api.md) | 官方开放平台能力与类目 |
| [02-web-cookie-flow.md](./02-web-cookie-flow.md) | Cookie、签名、核心 HTTP 接口 |
| [03-subtask-design.md](./03-subtask-design.md) | Demo 子任务拆分与错误处理 |
| [04-open-source-references.md](./04-open-source-references.md) | 开源项目参考 |
| [05-mcp-integration.md](./05-mcp-integration.md) | **MCP 服务调研与 Cursor 接入** |
| [demo/README.md](../demo/README.md) | 统一 Demo 运行说明 |

## Demo 代码

可运行 Demo 位于 **[`../demo/xiaohongshu/`](../demo/xiaohongshu/)**，Web 联调见 `demo/web`「小红书」标签页。

```bash
cd ../demo && source .venv/bin/activate
pip install -r requirements.txt
python xiaohongshu/scripts/01_cookie_login.py --save
python xiaohongshu/scripts/03_copywriting.py --topic "周末探店"
python xiaohongshu/scripts/06_pipeline.py --title "测试" --topic "生活" --dry-run
```

## 风险说明

- 签名算法随版本更新，需跟进社区库（如 `xhs`）
- 发布接口易触发验证码（type=124），Demo 默认支持 `--dry-run`
- 仅供个人调研学习，勿用于批量营销或违规引流
