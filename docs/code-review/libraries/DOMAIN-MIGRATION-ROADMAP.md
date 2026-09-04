# 大域新域迁移总览（Phase F）

> 日期：2026-09-04  
> **当前主线**：Phase F — SMP1 domain/server；calendar / teachHub F2–F3 ✅（含 generateLesson tasks）。  
> **模板**：festivalCard Phase C（`sa2kit/business/festivalCard/PLATFORMS.md`）  
> **门禁**：UI 仍只经 `sa2kit/common/ui*`；`pnpm gate:ui`

## 域级计划

| 域 | 计划文档 | 优先级 | 策略 |
|----|----------|--------|------|
| **calendar** | [docs/modules/calendar/DOMAIN-MIGRATION.md](../modules/calendar/DOMAIN-MIGRATION.md) | P1 | 先 `domain` + `shared` API 类型，再 server/ui |
| **teach-hub** | [docs/modules/teach-hub/DOMAIN-MIGRATION.md](../modules/teach-hub/DOMAIN-MIGRATION.md) | P1 | OSS 编排 + AI lesson 任务已 sa2kit 化，先抽 domain/server |
| **showmasterpiece** | [docs/modules/showmasterpiece/DOMAIN-MIGRATION.md](../modules/showmasterpiece/DOMAIN-MIGRATION.md) | P2 | 体量大；子应用与 Docker 发布链保留，分阶段下沉 server→ui |

## 目标骨架（三域统一）

```
sa2kit/business/<domain>/
  domain/           ← 自 *-core/shared、types、纯函数
  server/           ← DbService、schema 导出、route handler 工厂
  ui/web/           ← 自 *-core/pages、components
  ui/rn/            ← 自 app_mobile/*-mobile（或 stub → 渐进）
  PLATFORMS.md
  index.ts          ← 文档用；宿主用子路径
```

## 宿主不变

| 层 | 职责 |
|----|------|
| `app_web/<子应用>/` | 薄 page、Docker、basePath |
| `app/api/<域>/*` 或子应用 `app/api/*` | re-export + **鉴权 Guard** |
| `packages/*-core` | 过渡期 re-export `sa2kit/business/<域>/*`，勿双轨加功能 |
| `app_mobile/*` | 改 import 为 sa2kit 子路径 + `./shared` 聚合 |

## 阶段 gates

| Gate | 验收 | 状态 |
|------|------|------|
| F0 | 三份 DOMAIN-MIGRATION.md + 本总览 | ✅ 2026-09-03 |
| F1 | 每域 `domain/` + `PLATFORMS.md` + package exports 占位 | ✅ 2026-09-04 |
| F2 | `server/` + schema 在 `@profile/db` 仍聚合导出 | 🟡 calendar ✅；teachHub ✅；SMP server DbService 全家桶 ✅（SMP2 ui 仍 ⬜） |
| F3 | `ui/web` 切 import；`*-core` 仅 re-export | 🟡 calendar ✅；teachHub ✅；SMP ⬜ |
| F4 | RN：`ui/rn` stub 或 mobile 直引 web 子集 | ⬜（F1 已有 rn stub） |
| F5 | 删 `*-core` 冗余实现（保留子应用壳） | ⬜ |

### F1 落地摘要（2026-09-04）

| 域 | 子路径 | core 过渡 |
|----|--------|-----------|
| calendar | `sa2kit/business/calendar/domain` | `@profile/calendar-core/shared` re-export |
| teachHub | `sa2kit/business/teachHub/domain` | `shared/types` + `lessonProgress` re-export |
| showmasterpiece | `sa2kit/business/showmasterpiece/domain` | 占位类型；全集仍在 core |

### F2 落地摘要（2026-09-04）

| 域 | 成果 |
|----|------|
| calendar | `server` schema + DbService + `routes` handler 工厂；宿主 API 直引 sa2kit + session 注入 |
| teachHub | schema + DbService + **全套 API routes** + `server/tasks`（generateLesson） |
| showmasterpiece | `server` 全套 DbService + **API routes 全家桶**（含 artwork image）；SMP2 ui/web ⬜ |

### F3 落地摘要（2026-09-04）

| 域 | 成果 |
|----|------|
| calendar | `ui/web` 迁入 pages/components/hooks；`calendar-core` Auth 壳 + 组件 re-export |
| teachHub | `ui/web` 迁入 pages/layout/components；`teach-hub-core` Auth 壳 + pages re-export |
| showmasterpiece | 未开 |

## 已完成启明星阶段（归档摘要）

| 阶段 | 成果 |
|------|------|
| Phase U | UI 统一；`pnpm gate:ui` |
| Phase A/B | ADR-002、HOST-ONBOARDING、COMMON-PLATFORMS-EXPORTS |
| Phase C | festivalCard 多端试点 |
| Phase D | 删 `modules/aiApi` 薄层 |
| Phase E1 | `measure:dist`、PACKAGE-SPLIT-ROADMAP |

详见蓝图 [BLUEPRINT-multiplatform-sa2kit.md](./BLUEPRINT-multiplatform-sa2kit.md) §0。
