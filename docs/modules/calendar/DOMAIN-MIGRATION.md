# calendar — 新域迁移计划（`*-core` → `sa2kit/business/calendar`）

> SSOT 进度：本文件 · 总览：[DOMAIN-MIGRATION-ROADMAP.md](../../code-review/libraries/DOMAIN-MIGRATION-ROADMAP.md)  
> 现状包：`@profile/calendar-core` · 子应用 `app_web/calendar` · RN `app_mobile/calendar-mobile`

## 1. 目标

| 项 | 迁移后 |
|----|--------|
| 领域类型 / 校验 | `sa2kit/business/calendar/domain` |
| API handler 工厂 | `sa2kit/business/calendar/server` + `…/routes` |
| Web UI | `sa2kit/business/calendar/ui/web` |
| RN | `sa2kit/business/calendar/ui/rn`（先 stub，后从 mobile 抽） |
| 宿主 | `app_web/calendar` 薄 page；`app/api/calendar/*` re-export + 鉴权 |
| DB schema | 仍 `@profile/db` 聚合（禁止反向依赖 web） |

## 2. 现状映射

| 现路径 | 目标 |
|--------|------|
| `calendar-core/src/shared/*` | `business/calendar/domain` + `domain/client` |
| `calendar-core/src/types/*` | `domain/types` |
| `calendar-core/src/services/*` | `server/services` |
| `calendar-core/src/server.ts` / `api/*` | `server/routes`（Next handler 工厂） |
| `calendar-core/src/components/*` | `ui/web/components` |
| `calendar-core/src/pages/CalendarPage.tsx` | `ui/web/pages` |
| `calendar-core/src/integrations/*` | 保留 thin wrapper 或 `server/bootstrap` |
| AI 识图 | 已用 `sa2kit/common/aiApi` — **不搬** |

## 3. 分步任务

### C1 — domain + PLATFORMS（F1）

- [x] 新建 `sa2kit/business/calendar/domain/`（从 `shared` 抽类型 + `eventDisplay` 纯函数）
- [x] 新建 `PLATFORMS.md`（web ✅ / server ✅ / rn ⬜ stub）
- [x] `package.json` exports + `tsup.entries.business.ts`
- [x] `calendar-core/shared` → re-export domain（过渡期）

### C2 — server（F2）

- [x] 迁 `server` 服务与 drizzle schema 引用至 `business/calendar/server`
- [x] `create*Handler(config)` 模式（参照 festivalCard/routes）
- [x] `app_web/calendar/app/api/calendar/*` 仅 re-export + session 鉴权（注入 getSessionUser）
- [x] `@profile/db` schema 行 `export * from 'sa2kit/business/calendar/server'`

### C3 — ui/web（F3）

- [x] 迁 `CalendarPage` 及视图组件至 `ui/web`
- [x] UI 仅 `sa2kit/common/ui`（已无 animal-island）；鉴权用 `sa2kit/common/auth`
- [x] `calendar-core` 页面为 Auth 壳 + re-export；组件/hooks 自 `sa2kit/.../ui/web`
- [x] `pnpm --filter @profile/calendar` / sa2kit `build:business` 绿（ui/web 入口）

### C4 — RN（F4）

- [ ] `ui/rn/index.ts` stub 或迁 calendar-mobile 共用组件（**暂缓**）
- [ ] mobile 改 import：`sa2kit/business/calendar/ui/rn` 或 `domain` + 自绘壳

### C5 — 收尾（F5）

- [x] 删 `calendar-core` 内重复实现，保留 `index.ts` 兼容导出（Auth 壳 + 薄 re-export；export/import/recurrence/reminder 仍本地）
- [ ] 更新 `docs/monorepo-migration/` 归档说明（可选）

## 4. 风险

| 风险 | 对策 |
|------|------|
| 主站 `/api/calendar` 与日历子应用双路由 | 以子应用 `app_web/calendar` 为 SSOT；主站仅兼容 redirect |
| RN 与 Web 设置同步 | 继续 `shared` client types 经 domain 导出 |

## 5. 验收

- [ ] 客户仓可 `import { … } from 'sa2kit/business/calendar/domain'` 无 profile 路径
- [ ] Docker 日历镜像 build + smoke `/calendar`
- [ ] `calendar-mobile` Expo 编译通过
