# showmasterpiece — 新域迁移计划（`*-core` → `sa2kit/business/showmasterpiece`）

> SSOT 进度：本文件 · 总览：[DOMAIN-MIGRATION-ROADMAP.md](../../code-review/libraries/DOMAIN-MIGRATION-ROADMAP.md)  
> 现状包：`@profile/showmasterpiece-core`（~25k 行级）· 子应用 `app_web/showmasterpiece`

## 1. 策略

**分三波下沉**，保留独立 Docker 子应用与 `/showmasterpiece` 网关（蓝图 §12.1 S1 优点）：

| 波次 | 范围 | `*-core` 剩余 |
|------|------|----------------|
| **SMP1** | domain + server（DbService、booking、popup config） | ui/web 仍 core |
| **SMP2** | ui/web（动森 admin + 前台） | 薄 re-export |
| **SMP3** | 删冗余；可选独立 `@sa2kit/business-showmasterpiece` npm 包 | 仅兼容 index |

旧 sa2kit 1.x `business/showmasterpiece` 已本地化 — **以 profile core 为源码 SSOT 再下沉回 sa2kit 3.x business**，不恢复 1.6  npm 轨。

## 2. 目标骨架

```
sa2kit/business/showmasterpiece/
  domain/          booking 类型、权限规则、popup 配置 normalize
  server/          masterpiecesDbService、schema、routes 工厂
  ui/web/          前台 + admin（强制 sa2kit/common/ui + admin）
  ui/rn/           ⬜（暂无 RN 计划）
  PLATFORMS.md
```

## 3. 现状映射

| 现路径 | 目标 |
|--------|------|
| `showmasterpiece-core/src/types/*` | `domain/` |
| `showmasterpiece-core/src/logic/*` | `domain/` |
| `showmasterpiece-core/src/db/*`、`server/*` | `server/` |
| `showmasterpiece-core/src/service/*` | `server/services` |
| `showmasterpiece-core/src/ui/web/*` | `ui/web/` |
| `showmasterpiece-core/src/integrations/*` | `server/integrations` |
| `FIX_CHECKLIST.md` | **保留**在 core，迁移项并入本计划勾选 |

## 4. 分步任务

### M1 — domain + server（SMP1 / F2）

- [x] F1 占位：`domain/` booking/popup 类型 + `PLATFORMS.md` + exports（2026-09-04）
- [x] schema 下沉 `sa2kit/business/showmasterpiece/server`；`@profile/db` 聚合（2026-09-04）
- [x] bookingAccess 纯函数进 domain；core 薄 re-export
- [x] 迁 booking Query/Command + `bookingDelete` → `server/`；公开 + admin booking route 工厂（含 collections/batch）
- [x] 迁 popup / config / basic（categories·tags·site config）DbService；`homeTabConfig` normalize → domain
- [x] 迁 `collectionsDbService` / `artworksDbService`（去模块级全局 `db`，工厂注入 + core `initializeShowmasterpieceDb`）
- [x] catalog API route 工厂（collections / categories / tags / artworks）；image 仍宿主
- [ ] 抽 booking、category、collection、popup 全集类型与校验 → `domain/`（补齐）
- [x] route 工厂补齐 admin：`createListAdminBookingsHandler` 等
- [x] 删除 obsolete `SA2KIT_PLAN` / 1.x 发版文档（2026-09-03）

### M2 — ui/web（SMP2 / F3）

- [ ] 迁 `ui/web/components` 至 sa2kit；**禁止** shadcn 新件
- [ ] `ShowMasterpieceThemeRoot` 仍在子应用 layout；组件经门面
- [ ] `showmasterpiece-core` re-export `ui/web`

### M3 — 宿主与发布（F5）

- [ ] `app_web/showmasterpiece` 仅 page + api re-export
- [ ] Docker 镜像 build 不变；验证 nginx `/showmasterpiece`
- [ ] `measure:dist` 确认未 import `business/index` 聚合

### M4 — 可选产品化（SMP3）

- [ ] 评估独立 npm `@sa2kit/business-showmasterpiece`（仅当有外售画集 SaaS）
- [ ] PLATFORMS.md 声明 web ✅ only

## 5. 与旧 sa2kit 1.x 关系

| 项 | 决定 |
|----|------|
| sa2kit@1.6 showmasterpiece | 已废弃；不 pin |
| 删单 `deleteBooking(id, options?)` | 在 **新** `server/services/bookingCommandService.ts` 重写，不抄 1.x 路径 |
| `FIX_CHECKLIST.md` T4/T1 | 并入 M1 任务 |

## 6. 验收

- [ ] `/showmasterpiece` 前台 + admin 回归
- [ ] 预约删单权限与 HOST1 行为一致
- [ ] `pnpm --filter @profile/showmasterpiece build` 绿
- [ ] sa2kit 子路径 `business/showmasterpiece/server` 可被非 profile 宿主文档引用
