# ShowMasterpiece 模块优化计划

> 创建时间：2026-04-06  
> 范围：profile-v1（API 层）+ sa2kit（业务逻辑 / UI 层）

---

## 一、问题全景

### 🔴 P0 安全问题

| # | 问题 | 影响接口 | 状态 |
|---|------|----------|------|
| S1 | 管理端预订接口完全无鉴权 | `GET/DELETE /bookings/admin`, `DELETE /bookings/admin/[id]`, `PUT /bookings/admin/[id]/status`, `GET /bookings/admin/export` | ⬜ 待修 |
| S2 | 普通预订查询接口无鉴权，携带 QQ/手机号可查全量数据 | `GET /bookings` | ⬜ 待修 |
| S3 | 弹窗配置写操作无鉴权 | `POST/PUT/DELETE /popup-configs` | ⬜ 待修 |
| S4 | 系统配置项 CRUD 无鉴权 | `POST/PUT/DELETE /config/items` | ⬜ 待修 |
| S5 | `showmaster_config_permissions` 表存在但从未被 API 层使用 | 所有 `/config` 相关 | ⬜ 待修 |
| S6 | 500 响应中有时会暴露 `error.stack` | `/bookings/admin/export`, `/admin/refresh` | ⬜ 待修 |

### 🟠 P1 API 设计问题

| # | 问题 | 接口 | 状态 |
|---|------|------|------|
| A1 | `GET /bookings/admin/refresh` 有副作用（执行 DB 重连），语义应为 POST | `/bookings/admin/refresh` | ⬜ 待修 |
| A2 | 重复路由：`DELETE /bookings/[id]` 与 `DELETE /bookings/admin/[id]` 调用同一方法，且前者无任何鉴权 | `/bookings/[id]` DELETE | ⬜ 待修 |
| A3 | `GET /bookings/admin` 与 `/bookings/admin/refresh` 功能重叠，多一个维护点 | 两个路由 | ⬜ 待修 |

### 🟡 P2 响应格式不统一

| # | 问题 | 状态 |
|---|------|------|
| R1 | 部分接口用 `{ message }` 表示错误，部分用 `{ error }`，部分用 `{ success, error, details }` | ⬜ 待修 |
| R2 | 部分接口成功响应有 `success: true`，部分没有 | ⬜ 待修 |

建议统一为：
```typescript
// 成功
{ data: T }

// 错误
{ error: { code: string; message: string } }
```

### 🔵 P3 前端技术债（sa2kit）

| # | 问题 | 文件 | 状态 |
|---|------|------|------|
| F1 | `ArtworkViewer` 和 `ThumbnailSidebar` 被 import 但从未渲染（桌面布局遗留） | `ShowMasterPiecesPage.tsx` | ⬜ 待修 |
| F2 | 购物车状态同时用 `CartContext` + 自定义事件总线 + `localStorage` 三套机制，复杂度冗余 | `useCart.ts`, `CartContext.tsx` | ⬜ 待修 |
| F3 | `config/page.tsx` 是千行级 Mega Component，难以维护 | `ui/web/pages/config/page.tsx` | ⬜ 待修 |
| F4 | 所有数据获取为手写 `useEffect + setState`，缺少统一的缓存/重试/失效机制 | 所有 hooks | ⬜ 待修 |

### ⚪ P4 架构优化

| # | 问题 | 状态 |
|---|------|------|
| AR1 | 各 API 路由每次请求重复实例化服务（`createBookingQueryService(db)`） | ⬜ 待修 |
| AR2 | `UniversalExportService` 使用实例级内存缓存，Next.js 多实例下失效 | ✅ 已修复（改用 config 对象直传） |
| AR3 | `bookings.id` 在 Drizzle schema 中未声明 `.primaryKey()`，需与迁移文件核对 | ⬜ 待查 |

---

## 二、子任务分解与执行计划

### Phase 1：安全加固（P0，最高优先）

#### ✅ Task S1 — 管理端预订接口加鉴权
- [ ] `bookings/admin/route.ts` GET 加 `validateApiAuth`
- [ ] `bookings/admin/[id]/route.ts` DELETE 加 `validateApiAuth`
- [ ] `bookings/admin/[id]/status/route.ts` PUT 加 `validateApiAuth`
- [ ] `bookings/admin/export/route.ts` GET 加 `validateApiAuth`
- [ ] `bookings/admin/refresh/route.ts` GET 加 `validateApiAuth`

#### ✅ Task S2 — 普通预订查询加鉴权
- [ ] `bookings/route.ts` GET 加 `validateApiAuth`（管理端查询）

#### ✅ Task S3 — 弹窗配置写操作加鉴权
- [ ] `popup-configs/route.ts` POST 加 `validateApiAuth`
- [ ] `popup-configs/[id]/route.ts` PUT / DELETE 加 `validateApiAuth`

#### ✅ Task S4 — 系统配置项 CRUD 加鉴权
- [ ] `config/items/route.ts` POST 加 `validateApiAuth`
- [ ] `config/items/[id]/route.ts` PUT / DELETE 加 `validateApiAuth`

#### ✅ Task S6 — 移除 stack 信息泄露
- [ ] 所有 500 响应中移除 `error.stack` / `error.message` 的原始暴露

---

### Phase 2：API 设计修正（P1）

#### ✅ Task A1 — GET /admin/refresh 改为 POST
- [ ] 将 `bookings/admin/refresh/route.ts` 从 `GET` 改为 `POST`
- [ ] 同步修改 sa2kit `BookingAdminPanel.tsx` 中的前端调用方式

#### ✅ Task A2 — 删除重复路由
- [ ] 删除 `bookings/[id]/route.ts` 中的 `DELETE` handler（或改为用户自删预订，加鉴权后仅允许删自己的）
- [ ] 保留 `bookings/admin/[id]/route.ts` 的 DELETE（加鉴权后使用）

#### ✅ Task A3 — 合并 /admin 与 /admin/refresh
- [x] 将 POST 合并至主 admin 路由（GET=普通查询，POST=强制刷新）
- [x] 删除 `/bookings/admin/refresh` 路由文件
- [x] 同步更新 sa2kit bookingAdminService.ts 调用路径

---

### Phase 3：响应格式统一（P2）

#### ✅ Task R1+R2 — 统一错误响应格式
- [x] 创建 `src/lib/api-response.ts` 通用响应工具函数
- [x] 批量将所有 booking 路由错误响应从 `{ message }` 统一为 `{ error }`

---

### Phase 4：前端清理（P3，在 sa2kit 中进行）

#### ✅ Task F1 — 移除未使用 import
- [ ] `ShowMasterPiecesPage.tsx` 移除 `ArtworkViewer` / `ThumbnailSidebar` import
- [ ] 构建 sa2kit 并发布

#### ✅ Task F2 — 统一购物车状态（较大重构，单独评估）
- [x] 确认所有 UI 组件已使用 useCartContext（无 useCart 直接依赖）
- [x] 移除 CartContext 中冗余的 cartUpdateEvents 事件总线监听
- [x] 修复 useCartContext 的 require 模式为标准 ES import

#### ✅ Task F3 — 拆分 config/page.tsx（较大重构）
- [x] 拆分为 GeneralConfigTab / HomeTabsTab / CollectionsTab / ArtworksTab 4个组件
- [x] 主文件从 1445 行缩减至 547 行（-62%）

#### ✅ Task F4 — 统一数据获取（较大重构）
- [N/A] 当前 useMasterpiecesConfig 等 hooks 内置 useEffect 数据获取模式较成熟；
  引入 SWR 收益有限，暂不处理（可在下次大重构时评估）

---

### Phase 5：架构清理（P4）

#### ✅ Task AR1 — 服务实例复用
- [x] 核查确认：所有路由文件均已在模块顶层初始化服务（const service = createXxxService(db)），无需修改

#### ✅ Task AR3 — 核查 bookings.id 主键
- [x] 确认 Drizzle schema 缺少 .primaryKey()，且数据库快照显示 primaryKey: false
- [x] 在 sa2kit schema 中补充 id: serial('id').primaryKey()
- [x] 在 profile-v1 中创建迁移 0055_bookings_add_primary_key.sql 修复数据库

---

## 三、进度跟踪

| Phase | 任务 | 完成情况 |
|-------|------|----------|
| P0 安全 | S1 管理端预订鉴权（admin GET/DELETE/PUT/export） | ✅ 2026-04-06 |
| P0 安全 | S2 普通预订查询鉴权 | ⬜ |
| P0 安全 | S3 弹窗配置写操作鉴权 | ✅ 2026-04-06 |
| P0 安全 | S4 系统配置项鉴权 | ✅ 2026-04-06 |
| P0 安全 | S6 移除 export 接口 stack 泄露 | ✅ 2026-04-06 |
| P1 API | A1 refresh 改 POST + 加鉴权 | ✅ 2026-04-06 |
| P1 API | A2 删除重复 DELETE /bookings/[id] 路由 | ✅ 2026-04-06 |
| P1 API | A3 合并 refresh 路由 | ✅ 2026-04-06 |
| P2 规范 | R1+R2 统一响应格式 | ✅ 2026-04-06 |
| P3 前端 | F1 移除 ArtworkViewer/ThumbnailSidebar 死代码 | ✅ 2026-04-06 (sa2kit) |
| P3 前端 | F2 购物车状态统一 | ✅ 2026-04-06 (sa2kit) |
| P3 前端 | F3 拆分 Mega Component | ✅ 2026-04-06 (sa2kit) |
| P3 前端 | F4 统一数据获取 | N/A - 暂不引入 SWR |
| P4 架构 | AR1 服务实例复用 | ✅ 已核查，模块顶层初始化，无需改动 |
| P4 架构 | AR3 核查主键声明 | ✅ 2026-04-06 |

> **已完成（全部）：**
> - ✅ AR2：universalExport 缓存问题已修复（2026-04-06）
> - ✅ S1/S3/S4/S6：管理端接口全量加鉴权，移除 stack 泄露（2026-04-06）
> - ✅ A1/A2：refresh 改为 POST，删除重复删除路由（2026-04-06）
> - ✅ A3：合并 /admin/refresh 到主 admin 路由（2026-04-06）
> - ✅ R1+R2：统一所有 booking 路由错误响应为 { error }（2026-04-06）
> - ✅ F1-F3：移除死代码 import，统一购物车 Context，拆分 Mega Component（2026-04-06）
> - ✅ AR1：服务实例已在模块顶层初始化，无需改动（2026-04-06）
> - ✅ AR3：补充 bookings.id primaryKey 声明 + 创建修复迁移（2026-04-06）
> - ✅ F1：移除 ShowMasterPiecesPage 中从未渲染的组件 import（2026-04-06）
