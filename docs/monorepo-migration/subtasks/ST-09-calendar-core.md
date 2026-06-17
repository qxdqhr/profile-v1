# ST-09 packages/calendar-core 搬迁

**任务 ID**：M-09  
**状态**：done  
**依赖**：M-05, M-07

## 交付物

- [x] `packages/calendar-core/`（原 `modules/calendar` 全量迁入）
- [x] `package.json` exports：`.`、`./server`、`./api/*`
- [x] `apps/web/src/modules/calendar/` 兼容层（re-export + `CalendarPage` 注入 dateCalculator）
- [x] `packages/db` schema 改引 `calendar-core/src/db/schema`

## 依赖处理

| 原依赖 | 处理 |
|--------|------|
| `@/lib/auth` | `@profile/auth` |
| `@/db` | `@profile/db` |
| `@/lib/utils` | `calendar-core/src/utils/cn.ts` |
| `@/modules/aiApi` | `sa2kit/common/aiApi/client` + `integrations/aiDefaults.ts` |
| `@/modules/dateCalculator` | `CalendarPage.toolsPanel` 由 web 兼容层注入 |

## 验收记录（2026-06-11）

1. `@/modules/calendar` 路径在 web 仍可用
2. `calendar-core` 不 import `apps/web`
3. API 转发 `apps/web/src/app/api/calendar/*` 不变

## 后续（ST-12）

删除 web 内 `modules/calendar` 兼容层，路由直引 `@profile/calendar-core`。
