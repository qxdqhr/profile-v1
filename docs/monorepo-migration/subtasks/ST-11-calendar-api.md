# ST-11 calendar API 与数据联通

**任务 ID**：M-11  
**状态**：done  
**依赖**：M-10

## 交付物

- [x] `apps/calendar/app/api/calendar/*`（re-export `@profile/calendar-core` handlers）
- [x] `apps/calendar/app/api/auth/[...all]` — Better Auth
- [x] `apps/calendar/app/api/ai/*` — 识图 / 设置面板（sa2kit 内置任务）

## 验收记录（2026-06-11）

1. API 路径与 web 兼容：`/api/calendar/events` 等
2. 本地 `:3000` / `:3001` cookie 不共享 — 需在 calendar 应用单独登录（ST-18 反代后同域）

## 备注

MiMo 专用识图任务在 web 的 `aiApi` 模块；calendar 使用 sa2kit `registerCoreAiTasks`，与 web 行为略有差异时可后续对齐。
