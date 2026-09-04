# teach-hub — 新域迁移计划（`*-core` → `sa2kit/business/teachHub`）

> SSOT 进度：本文件 · 总览：[DOMAIN-MIGRATION-ROADMAP.md](../../code-review/libraries/DOMAIN-MIGRATION-ROADMAP.md)  
> 现状包：`@profile/teach-hub-core` · 子应用 `app_web/teach-hub` · RN `app_mobile/teach-hub-mobile`

## 1. 目标

| 项 | 迁移后 |
|----|--------|
| 工作区 / 课时领域模型 | `sa2kit/business/teachHub/domain` |
| OSS + DB 编排 | `sa2kit/business/teachHub/server` |
| Web UI（工作区、课时、Mission） | `sa2kit/business/teachHub/ui/web` |
| RN / Desktop | `ui/rn` stub → mobile/desktop 渐进 |
| AI 备课 | `teach-hub-core/ai/generateLessonTask` → `server/tasks`（注册 `sa2kit/common/aiApi/server`） |
| 宿主 | `app_web/teach-hub` 薄壳；API re-export + 用户/workspace 鉴权 |

> npm 导出名建议 **`teachHub`**（camelCase，与 festivalCard 一致）；路径 `sa2kit/business/teachHub/*`。

## 2. 现状映射

| 现路径 | 目标 |
|--------|------|
| `teach-hub-core/src/types/*` | `domain/` |
| `teach-hub-core/src/shared/*` | `domain/client` |
| `teach-hub-core/src/services/*` | `server/services` |
| `teach-hub-core/src/api/*` | `server/routes` |
| `teach-hub-core/src/integrations/ossFile.ts` | `server/integrations` 或共用 `sa2kit/common/file` |
| `teach-hub-core/src/ai/*` | `server/tasks` |
| `teach-hub-core/src/pages/*`、`components/*` | `ui/web/` |
| `teach-hub-core/src/store/*` | `ui/web/store`（Web 专用） |

## 3. 分步任务

### T1 — domain + PLATFORMS（F1）

- [x] `business/teachHub/domain`：Workspace、Lesson、Mission、Progress 类型
- [x] `PLATFORMS.md`（web ✅ / server ✅ / rn 🟡 / taro ⬜）
- [x] exports + tsup entry

### T2 — server（F2）

- [x] schema 下沉 `sa2kit/business/teachHub/server`；`@profile/db` 聚合（2026-09-04）
- [ ] 迁 workspace CRUD、OSS 文件读写 handler 工厂
- [ ] `generateLesson` 任务定义进 `server/tasks`（仍 `registerAiTask`）
- [ ] `app_web/teach-hub/app/api/teach-hub/*` 薄 re-export + **workspace 归属校验**在宿主
- [x] schema 经 `@profile/db` 聚合

### T3 — ui/web（F3）

- [ ] 仪表盘、工作区、课时 iframe 页迁 `ui/web`
- [ ] 动森 UI 经 `sa2kit/common/ui`（子应用 layout 已 load style）
- [ ] `teach-hub-core` → re-export

### T4 — 多端（F4）

- [ ] `ui/rn` stub；teach-hub-mobile 先继续 `*-core/shared` → 改引 `domain`
- [ ] teach-hub-desktop 同 Web 子集或 WebView

### T5 — 收尾（F5）

- [ ] 删 core 重复代码；保留 package 名 `@profile/teach-hub-core` 作兼容 facade
- [ ] 更新 [teach-hub-plan.md](../../../packages/teach-hub-core/src/teach-hub-plan.md) 指向本计划

## 4. 鉴权要点

- 所有 `/api/teach-hub/workspaces/[id]/*`：**宿主**校验 `workspace.userId === session.user.id`
- 库内 handler 接受 `userId` 注入，不读 cookie

## 5. 验收

- [ ] 子应用 `/teach-hub` build + 工作区创建/上传 zip/生成课时 E2E
- [ ] teach-hub-mobile 引 domain 类型编译通过
- [ ] 无 `@/modules/*` 或 profile 私有路径出现在 sa2kit business 内
