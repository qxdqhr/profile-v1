# ST-04 REST API 路由

**任务 ID**：T-04  
**状态**：done  
**依赖**：ST-02, ST-03

## 目标

实现 `/api/teach-hub/*` 路由，连接鉴权、DB 与 OSS 文件层。

## 交付物

- [x] `src/modules/teachHub/api/workspaces/route.ts` — GET, POST
- [x] `src/modules/teachHub/api/workspaces/[id]/route.ts` — GET, PATCH, DELETE
- [x] `src/modules/teachHub/api/workspaces/[id]/files/route.ts` — GET 列表
- [x] `src/modules/teachHub/api/workspaces/[id]/files/[...path]/route.ts` — GET, PUT
- [x] `src/modules/teachHub/api/workspaces/[id]/import/route.ts` — POST multipart
- [x] `src/modules/teachHub/api/workspaces/[id]/progress/route.ts` — GET, POST
- [x] `src/app/api/teach-hub/**` — 路由 re-export
- [x] `services/teachHubClient.ts` — 前端 fetch 封装
- [x] `utils/htmlLinkRewriter.ts` — 课时 HTML 链接改写
- [x] `utils/missionParser.ts` — MISSION 解析（PUT 时更新摘要）
- [x] `api/_helpers.ts` — 鉴权与工作区归属校验

## API 一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/teach-hub/workspaces` | 我的工作区列表 |
| POST | `/api/teach-hub/workspaces` | 创建空工作区 |
| GET | `/api/teach-hub/workspaces/:id` | 详情 + lessons + progress |
| PATCH | `/api/teach-hub/workspaces/:id` | 更新 title / status |
| DELETE | `/api/teach-hub/workspaces/:id` | 归档 |
| GET | `/api/teach-hub/workspaces/:id/files` | 文件列表 |
| GET | `/api/teach-hub/workspaces/:id/files/*path` | 读文件（HTML 自动改写链接） |
| PUT | `/api/teach-hub/workspaces/:id/files/*path` | 写 md/json 等 |
| POST | `/api/teach-hub/workspaces/:id/import` | zip 导入 |
| GET/POST | `/api/teach-hub/workspaces/:id/progress` | 学习进度 |

HTML 原文：GET 加 `?raw=1`

## 验收标准

1. 登录后可创建 → 导入 zip → 列文件 → 读 HTML
2. 跨用户 workspaceId 返回 403
3. 与 DATA.md API 表一致
