# ST-15 teach-hub API / OSS / AI 任务

**任务 ID**：M-15  
**状态**：done  
**依赖**：M-14

## 目标

挂载 `/api/teach-hub/*`，迁移 OSS 与 AI 生成课时服务端逻辑，**从 web 注销 teachHub AI 注册**。

## 交付物

- [x] `apps/teach-hub/app/api/teach-hub/**` — 全部 re-export
- [x] `apps/teach-hub/instrumentation.ts` 调用 `ensureTeachHubAiTasksRegistered`
- [x] `packages/teach-hub-core/src/server/registerTasks.ts` — 单点注册 sa2kit + teach.generateLesson
- [x] 从 `apps/web` 的 `registerCoreTasks.ts` **移除** teachHub 注册
- [x] OSS `moduleId: teach-hub` 路径不变（`teachWorkspacePaths.ts`）

## API 清单

基路径 `/api/teach-hub`，由 `apps/teach-hub` 承载；web 兼容期仍保留转发（ST-16 删除）。

## AI 任务

- 定义：`packages/teach-hub-core/src/ai/generateLessonTask.ts`
- 注册：仅 `@profile/teach-hub` 进程（`instrumentation.ts` + `/api/ai/run` 兜底）
- web `/api/ai/run` 不再注册 `teach.generateLesson`；经 web `/api/teach-hub/.../generate` 时由 `generateLessonService` 懒注册

## 验收记录（2026-06-17）

1. `pnpm --filter @profile/teach-hub build` / `@profile/web build` 通过
2. web `registerCoreTasks.ts` 无 `@profile/teach-hub-core` 引用
3. teach-hub 构建产物含 `TEACH_SKILL_SYSTEM_PROMPT`；web 仍含（因 ST-16 前保留 `/api/teach-hub` 转发）

## 后续（ST-16）

删除 web 内 `/api/teach-hub` 与 `modules/teachHub`，web build 不再打包 teach agent 逻辑。
