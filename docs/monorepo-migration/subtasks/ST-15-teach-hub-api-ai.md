# ST-15 teach-hub API / OSS / AI 任务

**任务 ID**：M-15  
**状态**：pending  
**依赖**：M-14

## 目标

挂载 `/api/teach-hub/*`，迁移 OSS 与 AI 生成课时服务端逻辑，**从 web 注销 teachHub AI 注册**。

## 交付物

- [ ] `apps/teach-hub/app/api/teach-hub/**` — 全部 re-export
- [ ] `apps/teach-hub/instrumentation.ts`（或 `server/register.ts`）调用 `registerTeachHubAiTasks`
- [ ] 从 `apps/web` 的 `registerCoreTasks.ts` **移除** teachHub 注册
- [ ] OSS `moduleId: teach-hub` 路径不变

## API 清单

见 `src/modules/teachHub/docs/DATA.md` 基路径 `/api/teach-hub`。

## AI 任务

- 迁移：`teachHub/ai/generateLessonTask.ts`
- 确保仅 teach-hub 进程启动时注册（避免 web build 拉取无关 AI 逻辑）

## 验收标准

1. 创建空工作区 → 上传 zip → 浏览 lesson
2. Mission 编辑 → 触发「生成下一课」→ OSS 出现新 html
3. web 单独 build 不包含 teach agent prompt 字符串（可选 grep 验证）

## 风险

- 若 web 与 teach-hub 同时部署且都注册 AI 任务 → **重复消费**；必须单点注册
