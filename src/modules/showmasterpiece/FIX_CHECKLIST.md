# ShowMasterpiece 问题修复与优化清单（profile-v1）

> **单一事实来源（SSOT）**：本文件为 ShowMasterpiece 模块待办、进度与验证的权威清单。  
> **宿主范围**：`profile-v1` 内改动；依赖 sa2kit 发版的项标 ⏸。  
> 状态：⬜ 待办 · 🔄 进行中 · ✅ 完成 · ⏸ 依赖 sa2kit/产品设计 · N/A 暂不处理

**实现**：`src/modules/showmasterpiece/api/` · **URL**：`src/app/api/showmasterpiece/**`（薄 re-export）  
**关联文档**：[`src/app/api/showmasterpiece/OPTIMIZATION.md`](../../app/api/showmasterpiece/OPTIMIZATION.md)（全景）· [`SA2KIT_PLAN.md`](./SA2KIT_PLAN.md)（sa2kit 仓改动）

**架构**：页面薄封装 `sa2kit/showmasterpiece`；npm 当前 `sa2kit@^1.6.114`；**1.6.115 删单已编码待发版**（见 [`SA2KIT_PUBLISH_CHECKLIST.md`](./SA2KIT_PUBLISH_CHECKLIST.md)）。

---

## Phase 0 — 安全与断裂 ✅（2026-05-20 前落地）

| ID | 子任务 | 影响 | 状态 |
|----|--------|------|------|
| S1 | 管理端预订 API `requireAdmin` | `bookings/admin/**` | ✅ |
| S2 | `GET /bookings` 须 QQ+手机（非管理员） | `bookings/route.ts` GET | ✅ |
| S2b | `GET/PUT/DELETE /bookings/[id]` 凭证或管理员 | `bookings/[id]/route.ts` | ✅ |
| S3 | 弹窗全量列表需管理员；`enabledOnly+scene` 可公开 | `popup-configs/route.ts` GET | ✅ |
| S4 | `config/items` 读写需管理员 | `config/items/**` | ✅ |
| S6 | 500 无 stack/details 外泄 | `api/lib/response.ts` | ✅ |
| S7 | 画集/作品/分类写操作 `requireAdmin` | `collections/**`、`categories` POST 等 | ✅ |
| S8 | 管理员角色 `admin` / `super_admin` | `api/lib/auth.ts` | ✅ |
| G1 | 文件 URL 解析走 `sa2kit-init` global | `masterpiecesDbService`、图片路由 | ✅ |
| G2 | 运维脚本目录 `scripts/`（数据迁移 CLI 已移除） | `scripts/README.md` | ✅ |
| T6-host | `DELETE /bookings/[id]` 路由层凭证删单 | `bookings/[id]/route.ts` DELETE | ✅ |

---

## Phase 1 — 架构 ✅

| ID | 子任务 | 状态 |
|----|--------|------|
| A1 | API 在 `modules/showmasterpiece/api` | ✅ |
| A2 | `app/api` 仅 re-export | ✅ |
| A3 | `api/lib/*` 公共库（auth、response、bookingServices） | ✅ |
| R1 | 提供 `apiFail` / `apiOk` / `handleRouteError` | ✅ |
| R2 | 500 不对外附带 `details` | ✅ |
| AR1 | 预订服务单例 `bookingServices.ts` | ✅ |
| IMG0 | 图片路由走 global 解析器 | ✅ |
| A3-old | 合并 `/bookings/admin/refresh` → `POST /bookings/admin` | ✅ |
| A2-old | 用户删单保留于 `/bookings/[id]` DELETE（非重复 admin 语义） | ✅ |

---

## Phase 2 — sa2kit 包内

| ID | 子任务 | 说明 | 状态 |
|----|--------|------|------|
| T2 | `getBookingsList` 精确 `eq` 匹配 | 防模糊查询泄露 | ✅ 1.6.114 |
| T3 | 小程序须 QQ+手机；Web 删单 UI 带凭证 | sa2kit 前端 | ✅ |
| T6-sa2kit-web | `BookingService.deleteBooking(id, credentials)` | Web 客户端 | ✅ |
| T6-sa2kit-cmd | `deleteBooking(id, options?)` + `UNAUTHORIZED` | sa2kit **1.6.115 代码就绪** | 🔄 待发版 npm |
| T1-host | profile-v1 `sa2kit-showmasterpiece.d.ts` | 宿主类型 | ✅ |
| T1-sa2kit | showmasterpiece 导出收紧 `any` | sa2kit 仓 | ⬜ |
| T4 | `masterpiecesDbService` 去模块级全局 `db` | 见 SA2KIT_PLAN | ⬜ |
| T5 | migration 子包 | 宿主已弃用 CLI | N/A |
| S5 | `showmaster_config_permissions` 接 API | 产品设计 | ⏸ |

> 见 [`SA2KIT_PLAN.md`](./SA2KIT_PLAN.md)。

---

## Phase 3 — sa2kit UI（历史项，2026-04-06 大部分已完成）

| ID | 子任务 | 状态 |
|----|--------|------|
| F1 | 移除 `ShowMasterPiecesPage` 未渲染 import | ✅ sa2kit |
| F2 | 购物车统一 `CartContext` | ✅ sa2kit |
| F3 | 拆分 config Mega Component | ✅ sa2kit |
| F4 | 引入 SWR 等统一数据层 | N/A 暂不处理 |

---

## Phase 4 — 安全补强 ✅

| ID | 优先级 | 子任务 | 影响接口/文件 | 状态 |
|----|--------|--------|---------------|------|
| S9 | 🔴 高 | **批量预订**限流 + 体校验 + 单次条数上限（仍为用户公开接口） | `POST /bookings/batch` | ✅ |
| S10 | 🔴 高 | **创建预订** IP/凭证滑动窗口限流（60s 内 30 次/IP） | `POST /bookings` | ✅ |
| S11 | 🟠 中 | 宿主预校验 + 1.6.115 Command 校验（发版前仅宿主生效） | `bookingDelete.ts` | ✅ 宿主 |
| S5 | 🟠 中 | `showmaster_config_permissions` 未接入 API | 所有 `/config` | ⏸ |

**说明**：发版前删单安全靠宿主 `bookingDelete`；发版 1.6.115 后 Command 层同步校验。见 `SA2KIT_PLAN.md`。

---

## Phase 5 — API 契约与工程质量 ✅

| ID | 优先级 | 子任务 | 说明 | 状态 |
|----|--------|--------|------|------|
| R3 | 🟡 中 | 新增 `apiData`/`apiErrorWithCode`；预订公开成功体仍裸对象（sa2kit）；DELETE 成功改 `{ data }` | `api/lib/response.ts` | ✅ 宿主可分阶段 |
| R4 | 🟡 中 | 管理端 `bookings/admin` 仍裸 `{ bookings, stats }`（sa2kit）；列表类已 `{ success, data }` | 文档约定 | ✅ 文档化 |
| CFG1 | 🟡 中 | `environment` 由 query/body + `NODE_ENV` 默认解析 | `configEnvironment.ts` | ✅ |
| API1 | ⚪ 低 | `categories`/`tags` GET 移除未用 `searchParams` | 两路由 | ✅ |
| LOG1 | ⚪ 低 | `routeDebug`/`routeWarn` 生产静默；API 路由已统一 | `routeLog.ts`、全 api | ✅ |
| LOG2 | ⚪ 低 | 删画集失败统一 `apiError`，不泄露 `error.message` | `collections/[id]/route.ts` | ✅ |
| LOG3 | ⚪ 低 | `GET /config` 不再打印完整配置对象 | `config/route.ts` | ✅ |

---

## Phase 6 — 运维与迁移 N/A（2026-05-21 产品决定）

> **不再支持**活动迁移与画集批量数据迁移 CLI；相关脚本与 `package.json` 命令已移除。新数据请经管理端 + Universal File 维护。Drizzle 库表迁移（`devdb:migrate`）不受影响。

| ID | 说明 | 状态 |
|----|------|------|
| OPS1–OPS4 | 多活动 / OSS / 作品迁移脚本与 `migration:*`、`migrate:multi-events*` 命令 | N/A 已删除 |

---

## Phase 7 — 架构与性能（IMG 暂缓）

| ID | 优先级 | 子任务 | 说明 | 状态 |
|----|--------|--------|------|------|
| INIT1 | 🟠 中 | **`ShowMasterPieces/layout.tsx` 统一 `sa2kit-init`**；`page.tsx` 移除重复 import | layout.tsx | ✅ |
| IMG1 | 🟡 中 | 图片路由 Base64（暂不改动） | `collections/.../image/route.ts` | ⏸ |
| IMG2 | ⚪ 低 | 历史 Base64 只读兼容 | 产品决策 | ⏸ |
| AR2 | ✅ | `UniversalExportService` 多实例缓存问题 | 已改 config 直传 | ✅ |
| AR3 | ✅ | `bookings.id` 补充 `.primaryKey()` + 迁移 0055 | Drizzle / DB | ✅ |
| PERF1 | ⚪ 低 | overview 尊重 `nocache`；缓存头抽取 `collectionCache.ts` | `collections/route.ts` | ✅ |
| DOC1 | 🟡 中 | `OPTIMIZATION.md` 与本文状态同步，避免「⬜ 待修」误导 | 文档 | ✅ |

---

## Phase 8 — 待发版与宿主兼容 🔄

| ID | 说明 | 状态 |
|----|------|------|
| PUB1 | `SA2KIT_PLAN.md` + `SA2KIT_PUBLISH_CHECKLIST.md` | ✅ |
| PUB2 | npm 保持 `^1.6.114`；本地可用 `file:../sa2kit` | ✅ |
| HOST1 | `bookingDelete` 宿主预校验（114 安全） | ✅ |
| HOST2 | `sa2kit-showmasterpiece-server.d.ts` 前瞻类型 | ✅ 发版后删 |
| HOST3 | 管理端删单成功 `{ data }` | ✅ |

---

## Phase 9 — 前端（宿主 + sa2kit）⏸

| ID | 说明 | 状态 |
|----|------|------|
| FE1 | 宿主仅 3 个薄 client 页面，深度 UI 优化需在 **sa2kit 发版** | ⏸ |
| FE2 | `config`/`history` 经 layout 加载 `sa2kit-init`（见 INIT1） | ✅ |

---

## 建议实施顺序

1. **P0–P1**：安全、契约、初始化 — ✅
2. **待发版**：你 push sa2kit **1.6.115** → 按 `SA2KIT_PUBLISH_CHECKLIST.md` 升级 profile-v1
3. **下一版 sa2kit**：T4 工厂注入、T1-sa2kit 类型收紧
4. **暂缓**：IMG*、S5、FE1

---

## 执行记录

| 日期 | 内容 |
|------|------|
| 2026-04-06 | P0/P1 安全与 API 结构（见 OPTIMIZATION.md 历史） |
| 2026-05-20 | Phase 0/1 全量落地；T6-host、booking 单例、image 路由 |
| 2026-05-21 | 全模块审计；Phase 4–8 待办写入本清单；同步 OPTIMIZATION.md |
| 2026-05-21 | P0：S9/S10 预订写接口限流；S11 宿主删单二次校验 |
| 2026-05-21 | P1：INIT1、CFG1、R3/R4 契约工具；P2：LOG*、API1 |
| 2026-05-21 | 移除画集数据/活动迁移脚本与 package 命令（OPS1–4 N/A） |
| 2026-05-21 | T1 类型补丁瘦身；LOG1 全 API；PERF1 collections 缓存 |
| 2026-05-21 | sa2kit 1.6.115：T6-sa2kit-cmd；SA2KIT_PLAN.md；profile-v1 删单对接 |
| 2026-05-21 | 待发版文档：SA2KIT_PUBLISH_CHECKLIST；npm 保持 ^1.6.114；宿主删单兼容 |

---

## 验证命令

```bash
pnpm exec tsc --noEmit --pretty false 2>&1 | grep -i showmaster || echo "无 showmasterpiece 类型错误"
pnpm build   # 全量构建（耗时）
```

### 手工 API 抽检

```bash
BASE=http://localhost:3000

# 无参预订列表 → 400
curl -s "$BASE/api/showmasterpiece/bookings" | jq .

# 弹窗全量 → 403
curl -s "$BASE/api/showmasterpiece/popup-configs" | jq .

# 配置项列表 → 403
curl -s "$BASE/api/showmasterpiece/config/items" | jq .

# 批量预订（应 400/429，非 201）
curl -s -X POST "$BASE/api/showmasterpiece/bookings/batch" \
  -H 'Content-Type: application/json' -d '{}' | jq .
```
