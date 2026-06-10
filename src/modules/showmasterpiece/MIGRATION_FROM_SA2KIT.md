# ShowMasterpiece — 从 sa2kit 迁出至 profile-v1

> **目标**：ShowMasterpiece 为 profile-v1 专属业务，不再依赖 `sa2kit/showmasterpiece` npm 子路径；模块仍保持 `src/modules/showmasterpiece/` 内聚，参照 `ideaList` 分层。  
> **源码参考**：`/home/qhr/project/sa2kit/src/business/showmasterpiece`  
> **进度 SSOT**：本文件 + [`FIX_CHECKLIST.md`](./FIX_CHECKLIST.md)

---

## 现状（2026-06-08 迁移后）

| 层级 | 位置 | 说明 |
|------|------|------|
| API 路由 | `src/modules/showmasterpiece/api/` | ✅ profile-v1 |
| 服务端 DB/Command | `@/modules/showmasterpiece/server` | ✅ 已本地化 |
| 前端页面/组件 | `@/modules/showmasterpiece` → `ui/web/` | ✅ 已本地化 |
| 类型补丁 | ~~`src/types/sa2kit-showmasterpiece*.d.ts`~~ | ✅ 已删除 |
| Schema 挂载 | `src/db/schema/index.ts` re-export 模块内 schema | ✅ |

**外部依赖（保留）**：`sa2kit/universalFile`（文件存储）、`sa2kit/auth/legacy`（管理端鉴权）、`@/services/universalExport`（预订导出）。

---

## 目标目录结构

```text
src/modules/showmasterpiece/
├── MIGRATION_FROM_SA2KIT.md    # 本文件
├── FIX_CHECKLIST.md
├── index.ts
├── init.ts                     # 原 sa2kit-init.ts
├── db/
│   ├── schema/                 # Drizzle 表定义
│   └── services/               # DbService、BookingCommand/Query
├── server/index.ts             # 服务端 barrel（替代 sa2kit/showmasterpiece/server）
├── types/
├── logic/                      # hooks、contexts、shared
├── services/                   # 客户端 API / 业务 service
├── components/                 # 原 ui/web/components
├── pages/                      # 原 ui/web/pages
└── api/                        # 已有 Next route handlers
```

---

## 分阶段计划

### Phase 1 — 服务端与 Schema ✅

| ID | 任务 | 状态 |
|----|------|------|
| P1-1 | 复制 `server/schema` → `db/schema` | ✅ |
| P1-2 | 复制 `server/services` → `db/services` | ✅ |
| P1-3 | 复制 `types/` | ✅ |
| P1-4 | 新增 `server/index.ts` barrel | ✅ |
| P1-5 | `src/db/schema/index.ts` 改导本地 schema | ✅ |
| P1-6 | API / `masterpiecesDbService` 等改 `@/modules/showmasterpiece/server` | ✅ |
| P1-7 | 删除 `sa2kit-showmasterpiece-server.d.ts` | ✅ |
| P1-8 | lint / 无 `sa2kit/showmasterpiece/server` import | ✅ |

**验收**：项目中无 `sa2kit/showmasterpiece/server` import；Drizzle schema 仍与现有库表一致。

---

### Phase 2 — 前端 UI 与客户端 Service ✅

| ID | 任务 | 说明 | 状态 |
|----|------|------|------|
| P2-1 | 复制 `logic/` | hooks、CartContext | ✅ |
| P2-2 | 复制 `service/` | api client、bookingService 等 | ✅ |
| P2-3 | 复制 `ui/web/` | 保留原目录层级 | ✅ |
| P2-4 | 修正 `fileService.ts` → `sa2kit/universalFile/server` | 客户端配置辅助 | ✅ |
| P2-5 | 修正 `exportConfig.ts` → `@/services/universalExport/types` | ✅ |
| P2-6 | 薄页面改 import `@/modules/showmasterpiece` | ShowMasterPieces 三页 | ✅ |
| P2-7 | 删除 `sa2kit-showmasterpiece.d.ts` | ✅ |

**不迁入**：`ui/miniapp/`（已复制但未接入；profile-v1 无 Taro，后续可删目录减噪）。

**验收**：`/testField/ShowMasterPieces` 及 config/history 子路由可正常访问；无 `sa2kit/showmasterpiece` import。

---

### Phase 3 — 收尾与文档

| ID | 任务 | 状态 |
|----|------|------|
| P3-1 | `sa2kit-init.ts` 重命名为 `init.ts`，更新 layout import | ✅ |
| P3-2 | 归档 `SA2KIT_PLAN.md` / `SA2KIT_PUBLISH_CHECKLIST.md` | ⬜ |
| P3-3 | 更新 `FIX_CHECKLIST.md` Phase 2 为「已本地化」 | ⬜ |
| P3-4 | 更新 `.cursor/KNOWLEDGE_BASE.md` 2.3 节 | ✅ |
| P3-5 | （可选）在 sa2kit 仓标记 showmasterpiece 为 deprecated | ⬜ |

---

## 模块边界约定

1. **对内**：`@/modules/showmasterpiece` 或 `@/modules/showmasterpiece/server` 为唯一入口，禁止再从 sa2kit 引用 showmasterpiece。
2. **对外依赖**：文件服务、鉴权、通用导出通过 profile-v1 已有模块或 sa2kit 其他子包接入，不反向耦合。
3. **API**：继续 `modules/.../api` + `app/api/showmasterpiece` 薄 re-export。
4. **数据库**：schema 定义在模块内，`src/db/schema/index.ts` 仅 re-export，迁移命令仍用根 `package.json` 脚本。

---

## 回滚

若 Phase 1 出现问题，恢复 `sa2kit/showmasterpiece/server` import 并删除 `db/`、`types/` 副本即可；数据库无结构变更，无需 migration。
