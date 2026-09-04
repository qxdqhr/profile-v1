# 大域新域迁移总览（Phase F）

> 日期：2026-09-04  
> **状态**：Phase F **完成**。Phase G **完成**（G1–G8 ✅）。  
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
| F2 | `server/` + schema 在 `@profile/db` 仍聚合导出 | ✅ calendar / teachHub / SMP |
| F3 | `ui/web` 切 import；`*-core` 仅 re-export | ✅ calendar / teachHub / SMP（Auth 壳） |
| F4 | RN：`ui/rn` stub 或 mobile 直引 domain | ✅ 2026-09-04：calendar/teachHub mobile → domain；ui/rn re-export；SMP 仍无 RN |
| F5 | 删 `*-core` 冗余实现（保留子应用壳） | ✅ 2026-09-04：三域 core 薄 re-export；宿主 page/api 壳 |

### F1 落地摘要（2026-09-04）

| 域 | 子路径 | core 过渡 |
|----|--------|-----------|
| calendar | `sa2kit/business/calendar/domain` | `@profile/calendar-core/shared` re-export |
| teachHub | `sa2kit/business/teachHub/domain` | `shared/types` + `lessonProgress` re-export |
| showmasterpiece | `sa2kit/business/showmasterpiece/domain` | domain + server 类型；UI 经 `ui/web` |

### F2 落地摘要（2026-09-04）

| 域 | 成果 |
|----|------|
| calendar | `server` schema + DbService + `routes` handler 工厂；宿主 API 直引 sa2kit + session 注入 |
| teachHub | schema + DbService + **全套 API routes** + `server/tasks`（generateLesson） |
| showmasterpiece | `server` 全套 DbService + **API routes 全家桶**（含 artwork image） |

### F3 落地摘要（2026-09-04）

| 域 | 成果 |
|----|------|
| calendar | `ui/web` 迁入 pages/components/hooks；`calendar-core` Auth 壳 + 组件 re-export |
| teachHub | `ui/web` 迁入 pages/layout/components；`teach-hub-core` Auth 壳 + pages re-export |
| showmasterpiece | `ui/web` + `ui/web/client`；`*-core` Auth 壳 + logic/types/services 薄 re-export（miniapp 保留） |

### F5 落地摘要（2026-09-04）

| 域 | 成果 |
|----|------|
| calendar | 删 core `components/` 重复实现；hooks/utils/ai/context → 薄 re-export；保留 export/import/recurrence/reminder 本地服务 |
| teachHub | 删 core `components/` 与 pages 实现体；hooks/store/styles/client → 薄 re-export；`pages/index` 仍 barrel |
| showmasterpiece | core 已薄；宿主 `app_web/showmasterpiece` page + api 壳；`ShowmasterpieceFileUrlResolver` 与 common `FileUrlResolver` 解耦 |
| 公共 | sa2kit `ui/web/*` exports 补 `.ts`/`.tsx` 后缀，保证 TypeScript 深路径可解析；`measure:dist`：勿 import `business/index`（~920KB） |

### F4 落地摘要（2026-09-04）

| 域 | 成果 |
|----|------|
| calendar | `ui/rn` stub + re-export domain；`calendar-mobile` 改引 `sa2kit/business/calendar/domain`，去掉 `@profile/calendar-core` |
| teachHub | domain 扩入 ApiClient/parsers/templates；`ui/rn` re-export；`teach-hub-mobile` 改引 domain；core/shared 薄 facade |
| showmasterpiece | 仍无 RN 计划；`ui/rn` 占位保持 |

## 已完成启明星阶段（归档摘要）

| 阶段 | 成果 |
|------|------|
| Phase U | UI 统一；`pnpm gate:ui` |
| Phase A/B | ADR-002、HOST-ONBOARDING、COMMON-PLATFORMS-EXPORTS |
| Phase C | festivalCard 多端试点 |
| Phase D | 删 `modules/aiApi` 薄层 |
| Phase E1 | `measure:dist`、PACKAGE-SPLIT-ROADMAP |

详见蓝图 [BLUEPRINT-multiplatform-sa2kit.md](./BLUEPRINT-multiplatform-sa2kit.md) §0。

## 下一阶段：Phase G（双库收敛）

> **执行中**（2026-09-04）— 蓝图 [§14](./BLUEPRINT-multiplatform-sa2kit.md#14-phase-g--双库收敛packages-仅保留-sa2kit--sa2kit-ui)  
> 目标：`packages/` 共享库只剩 `sa2kit` + `sa2kit-ui`；迁入 exam / feishu；清零 `*-core` facade；消融 `auth|db|config|ui`。

| Gate | 摘要 | 状态 |
|------|------|------|
| G1 | 飞书 → `sa2kit/common/feishu`；删 `sa2kit-feishu` | ✅ |
| G2 | exam → `sa2kit/business/exam`；删 `sa2kit-exam` | ✅ |
| G3 | teach-hub-core **清零**；宿主 `app_web/teach-hub/lib` | ✅ |
| G4 | showmasterpiece-core **清零**；宿主 `app_web/showmasterpiece/lib` + `ui/miniapp` | ✅ |
| G5 | calendar-core **清零**；宿主 `app_web/calendar/lib` | ✅ |
| G6 | `@profile/{auth,db,config,ui}` → `host/*`（迁出 packages） | ✅ |
| G7 | node-notes-core 清零 | ✅ |
| G8 | 仓库门禁：workspace 显式两库 + architecture gate | ✅ |

全文：[BLUEPRINT §14](./BLUEPRINT-multiplatform-sa2kit.md#14-phase-g--双库收敛packages-仅保留-sa2kit--sa2kit-ui)。

### G1 落地摘要（2026-09-04）

| 项 | 成果 |
|----|------|
| 库 | `sa2kit/src/common/feishu/*` + exports `sa2kit/common/feishu` |
| 消费者 | Home / ticketMonitor / `scripts/send-ci-feishu-notify.ts` → `sa2kit/common/feishu` |
| 删除 | `packages/sa2kit-feishu`；tsconfig `@sa2kit/feishu-bot` paths |

### G2 落地摘要（2026-09-04）

| 项 | 成果 |
|----|------|
| 库 | `sa2kit/business/exam/{domain,server,ui/*}` + PLATFORMS.md |
| schema | `server/schema.ts`；`@profile/db` `schema/exam` 薄 re-export |
| 消费者 | experiment / exam API / `modules/exam/server` → `sa2kit/business/exam/*` |
| 删除 | `packages/sa2kit-exam`；tsconfig `@sa2kit/exam` paths |

### G3 落地摘要（2026-09-04）

| 项 | 成果 |
|----|------|
| UI / routes / domain | 宿主直引 `sa2kit/business/teachHub/{ui/web,routes,domain,server}` |
| 宿主注入 | `app_web/teach-hub/lib/`：OSS、FileStore、generate、hostRouteConfig、Auth 壳 |
| 删除 | `packages/teach-hub-core`；CI path filter / tsconfig / package.json 清零 |
| 说明 | FileStore/generate 仍含 `@profile/db|config` 绑定，按蓝图留宿主；后续可再工厂化进 sa2kit |

### G4 落地摘要（2026-09-04）

| 项 | 成果 |
|----|------|
| UI / routes | 宿主直引 `sa2kit/business/showmasterpiece/{ui/web,routes,server}` |
| miniapp | → `sa2kit/business/showmasterpiece/ui/miniapp` |
| 宿主注入 | `app_web/showmasterpiece/lib/`：OSS、fileUrl、HostRouteConfig、rateLimit、Auth 壳、bootstrapDb |
| 删除 | `packages/showmasterpiece-core`；主站 modules 薄兼容；CI / db 依赖清零 |

### G5 落地摘要（2026-09-04）

| 项 | 成果 |
|----|------|
| domain | export/import/recurrence/reminder → `sa2kit/business/calendar/domain` |
| server | legacy helpers → `server/legacyHelpers`（`checkEventPermission` 注入 dbService） |
| 宿主 | `app_web/calendar/lib/CalendarPage` Auth+font 壳；pages/API 直引 sa2kit |
| 删除 | `packages/calendar-core`；CI / tsconfig / package.json 清零 |

### G6 落地摘要（2026-09-05）

| 项 | 成果 |
|----|------|
| 迁出 | `packages/{auth,db,config,ui}` → `host/{auth,db,config,ui}` |
| workspace | `pnpm-workspace.yaml` 增加 `host/*` |
| 包名 | 暂保留 `@profile/*` workspace 名（避免全仓 import 大爆炸）；能力仍委托 `sa2kit/common/*` |
| Docker / CI / drizzle / tsconfig | 路径改指 `host/` |
| packages/ | 仅剩 `sa2kit`、`sa2kit-ui` |

### G7 落地摘要（2026-09-05）

| 项 | 成果 |
|----|------|
| 库 | `sa2kit/business/nodeNotes/{domain,server,routes,ui/web}` + PLATFORMS.md |
| schema | `server/schema.ts`（无 auth FK）；`@profile/db` 聚合 `sa2kit/business/nodeNotes/server` |
| 宿主 | `app_web/node-notes/lib` Auth 壳 + hostRouteConfig；API 直引 routes 工厂 |
| 删除 | `packages/node-notes-core`；CI / tsconfig / package.json 清零 |

### G8 落地摘要（2026-09-05）

| 项 | 成果 |
|----|------|
| workspace | `pnpm-workspace.yaml` 去掉 `packages/*`，显式 `packages/sa2kit` + `packages/sa2kit-ui` |
| gate | `scripts/check-architecture-gate.mjs` 禁止 `packages/` 出现第三共享包 |
| 文档 | `packages/README.md` / 蓝图 / KNOWLEDGE_BASE 对齐「只剩两库」 |
