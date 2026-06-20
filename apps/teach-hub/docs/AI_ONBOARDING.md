# AI Onboarding — teachHub 一页全貌

> **目的**：让 AI 或新协作者在下一次会话中 5 分钟内理解项目，知道改哪里、怎么跑、有哪些坑。  
> **最后更新**：2026-06-20

## 一句话

teachHub 是 **teach skill 的多租户 Web 壳**：用户登录后创建学习工作区，在 OSS 存 HTML 课时，在 DB 记进度，用 Mimo 按需生成下一课。

## 仓库位置

```
profile-v1/
  apps/teach-hub/              ← 子应用（路由壳、部署）  ★ 你在这里
  packages/teach-hub-core/     ← 业务逻辑 + UI + API 实现  ★ 改功能主要在这里
  apps/web/                    ← 主站，/teach-hub 只做 302 重定向
```

## 30 秒启动

```bash
cd /path/to/profile-v1
pnpm dev:teach-hub    # http://localhost:3002
# 主站同时跑：pnpm dev  → 实验田或 /teach-hub 跳转
```

共享配置：`config/app.config.local.yaml`（DB、Auth、OSS、AI key）

## 架构一张图

```
用户 → teach-hub 子应用 (Next.js :3002)
         ├─ UI: teach-hub-core/pages + components
         ├─ API: teach-hub-core/api → re-export 自 app/api/teach-hub
         ├─ Auth: @profile/auth session cookie（与主站共享）
         ├─ DB: PostgreSQL (teach_workspaces, teach_lesson_progress, teach_generate_jobs)
         ├─ OSS: sa2kit, moduleId=teach-hub, path=teach-hub/{userId}/{wsId}/
         └─ AI: teach.generateLesson → Mimo (仅本子应用 instrumentation 注册)
```

## 用户主路径（按顺序理解）

1. **登录** → `TeachHubLayout` + `AuthGuard`
2. **首页** `/` → 工作区卡片列表（`TeachHubHomePage`）
3. **新建** `/new` → `createWorkspace` → OSS 写入空 MISSION/RESOURCES/NOTES
4. **或导入** → `POST .../import` multipart zip
5. **工作区** `/w/:id` → 课时列表 + `GenerateLessonButton` + `ProgressBar`
6. **Mission** `/w/:id/mission` → `MissionEditor` → `PUT .../files/MISSION.md`
7. **生成** → `POST .../generate` → Mimo → OSS 新 `lessons/NNNN-*.html`
8. **阅读** `/w/:id/lesson/:slug` → `LessonViewer` fetch HTML → `srcDoc` iframe
9. **完成** → `POST .../progress { status: 'completed' }`
10. **循环** 8-9 直到可生成下一课

## 改代码决策树

```
要改 UI/交互？
  └─ packages/teach-hub-core/src/pages/ 或 components/

要改 API 行为？
  └─ packages/teach-hub-core/src/api/
  └─ packages/teach-hub-core/src/services/

要改数据库？
  └─ packages/teach-hub-core/src/db/schema.ts
  └─ 然后在 @profile/db 聚合迁移

要改 OSS 路径/文件逻辑？
  └─ services/teachHubFileStore.ts
  └─ utils/teachWorkspacePaths.ts

要改 Mimo prompt/生成校验？
  └─ ai/teachAgentPrompt.ts
  └─ ai/teachSkillSystemPrompt.ts
  └─ ai/validateGenerateOutput.ts

要改路由/部署/basePath？
  └─ apps/teach-hub/app/
  └─ apps/teach-hub/next.config.ts
  └─ utils/routes.ts（前缀逻辑）

要改样式？
  └─ styles/tw.ts（Tailwind 类名常量，不是独立 CSS 文件）
```

## 必读文件（按优先级）

| 优先级 | 文件 | 为什么 |
|--------|------|--------|
| P0 | `packages/teach-hub-core/docs/DATA.md` | OSS 契约 + DB 表 + API 契约 |
| P0 | `packages/teach-hub-core/src/utils/routes.ts` | 路由前缀，踩坑最多 |
| P0 | `packages/teach-hub-core/src/services/generateLessonService.ts` | 生成流程全貌 |
| P1 | `packages/teach-hub-core/src/services/teachHubFileStore.ts` | OSS 读写 |
| P1 | `packages/teach-hub-core/src/services/teachHubClient.ts` | 前端 API 调用 |
| P1 | `packages/teach-hub-core/src/components/LessonViewer.tsx` | 课时渲染 |
| P2 | `apps/teach-hub/instrumentation.ts` | AI 任务注册入口 |
| P2 | `apps/teach-hub/next.config.ts` | 构建/环境 |
| P2 | `packages/teach-hub-core/docs/TASKS.md` | 任务状态与 backlog |

## 常见陷阱

1. **路由双重前缀**：生产 `NEXT_PUBLIC_BASE_PATH=/teach-hub` 时，`TEACH_HUB_BASE` 必须为空；Link 不要再拼 `/teach-hub`。
2. **AI 任务注册**：`teach.generateLesson` 只在 `apps/teach-hub/instrumentation.ts` 注册；改主站 `registerCoreTasks` 无效。
3. **iframe 加载**：用 `srcDoc`（fetch API 代理后的 HTML），不要直接嵌 OSS CDN URL（X-Frame-Options）。
4. **鉴权**：所有 API 用 `requireUser` + `requireWorkspace`；`userId` 永远从 session 取，不信任请求体。
5. **生成前置**：下一课前必须完成上一课；同一工作区不能并发 running job。
6. **改 API 后**：子应用 `app/api/` 若是 re-export，实际改 `teach-hub-core/src/api/`。
7. **样式**：用 `styles/tw.ts` 导出常量；注意变量初始化顺序（曾导致 build 失败）。

## 环境变量速查

| 变量 | 本地 dev | 生产 Docker |
|------|----------|-------------|
| `NEXT_PUBLIC_BASE_PATH` | 不设 | `/teach-hub` |
| `NEXT_PUBLIC_TEACH_HUB_BASE_URL` | `''` 或不设 | `''` |
| `NEXT_DIST_DIR` | `.next-teach-hub` | `.next-teach-hub` |
| `PORT` | `3002` | `3002` |

## 测试/验证清单

- [ ] 未登录访问 API → 401
- [ ] 用户 A 不能读用户 B 的 workspaceId → 403
- [ ] 创建空工作区 → OSS 有 MISSION.md
- [ ] 导入含 `lessons/0001-*.html` 的 zip → 概览显示 1 课
- [ ] 打开课时 → iframe 内测验可交互
- [ ] 标记完成 → 刷新后进度仍在
- [ ] Mission 填 Why → 「开始第一课」→ OSS 出现 `lessons/0001-*.html`
- [ ] 完成 0001 → 「生成下一课」→ 出现 0002
- [ ] `pnpm build:teach-hub` 通过

## 相关文档

- [ARCHITECTURE.md](./ARCHITECTURE.md) — 完整架构与工作流图
- [CHANGELOG.md](./CHANGELOG.md) — 版本历史
- [packages/teach-hub-core/docs/](../packages/teach-hub-core/docs/) — 数据契约、子任务 ST-01~ST-11
- [packages/teach-hub-core/src/teach-hub-plan.md](../packages/teach-hub-core/src/teach-hub-plan.md) — 原始开发计划

## 当前状态（2026-06-20）

- **Phase 1 + 2**：已完成
- **最近工作**：资源页编辑器、课时阅读进度条、子应用网关部署
- **下一步 backlog**：测验 postMessage、zip 导出、starter fork（见 TASKS.md T-12+）
