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
- [ ] 将 `forceRefresh` 参数合并回主 admin 路由处理
- [ ] 删除 `/bookings/admin/refresh` 路由文件

---

### Phase 3：响应格式统一（P2）

#### ✅ Task R1+R2 — 统一错误响应格式
- [ ] 在 `src/lib/api-response.ts` 创建通用响应工具函数
- [ ] 批量更新所有 showmasterpiece API 路由使用统一格式

---

### Phase 4：前端清理（P3，在 sa2kit 中进行）

#### ✅ Task F1 — 移除未使用 import
- [ ] `ShowMasterPiecesPage.tsx` 移除 `ArtworkViewer` / `ThumbnailSidebar` import
- [ ] 构建 sa2kit 并发布

#### ✅ Task F2 — 统一购物车状态（较大重构，单独评估）
- [ ] 分析 `cartUpdateEvents` 的使用场景
- [ ] 判断是否所有使用方都在 `CartProvider` 树内
- [ ] 合并到纯 Context 方案

#### ✅ Task F3 — 拆分 config/page.tsx（较大重构）
- [ ] 将各 Tab 内容拆分为独立组件文件
- [ ] 或拆分为独立子路由

#### ✅ Task F4 — 统一数据获取（较大重构）
- [ ] 评估引入 SWR 替代手写 useEffect 模式

---

### Phase 5：架构清理（P4）

#### ✅ Task AR1 — 服务实例复用
- [ ] 将服务初始化移到路由文件模块顶层（已有部分路由这样做了，需统一）

#### ✅ Task AR3 — 核查 bookings.id 主键
- [ ] 对照 Drizzle 迁移文件确认 `comic_universe_bookings.id` 是否正确声明为主键

---

## 三、进度跟踪

| Phase | 任务 | 完成情况 |
|-------|------|----------|
| P0 安全 | S1 管理端预订鉴权 | ⬜ |
| P0 安全 | S2 普通预订查询鉴权 | ⬜ |
| P0 安全 | S3 弹窗配置写操作鉴权 | ⬜ |
| P0 安全 | S4 系统配置项鉴权 | ⬜ |
| P0 安全 | S6 移除 stack 泄露 | ⬜ |
| P1 API | A1 refresh 改 POST | ⬜ |
| P1 API | A2 删除重复 DELETE 路由 | ⬜ |
| P1 API | A3 合并 refresh 路由 | ⬜ |
| P2 规范 | R1+R2 统一响应格式 | ⬜ |
| P3 前端 | F1 移除死代码 import | ⬜ |
| P3 前端 | F2 购物车状态统一 | ⬜ |
| P3 前端 | F3 拆分 Mega Component | ⬜ |
| P3 前端 | F4 统一数据获取 | ⬜ |
| P4 架构 | AR1 服务实例复用 | ⬜ |
| P4 架构 | AR3 核查主键声明 | ⬜ |

> **已完成：**
> - ✅ AR2：universalExport 缓存问题已修复（config 对象直传，不再发 configId 字符串）
