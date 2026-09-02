# ShowMasterpiece 模块优化计划

> **进度 SSOT**：[`src/modules/showmasterpiece/FIX_CHECKLIST.md`](../../../modules/showmasterpiece/FIX_CHECKLIST.md)  
> 本文件保留**问题全景、优先级说明与历史记录**；任务状态以 FIX_CHECKLIST 为准。  
> 最后同步：**2026-05-21**（P1 契约/初始化 + P2 日志）

**范围**：profile-v1（API / 脚本 / 薄页面）+ sa2kit（业务逻辑 / UI）

---

## 一、问题全景（含 2026-05-21 审计新增）

### 🔴 P0 — 安全（待办）

| ID | 问题 | 影响 | 状态 |
|----|------|------|------|
| S9 | 批量预订限流 + 体校验 + 最多 50 项/次 | `POST /bookings/batch` | ✅ |
| S10 | 创建预订 IP/凭证限流 | `POST /bookings` | ✅ |
| S11 | 宿主 `deleteBookingWithCredentialGuard`；sa2kit Command 仍待 T6 | `bookingDelete.ts` | ✅ 宿主 |
| S5 | `showmaster_config_permissions` 表未使用 | `/config/**` | ⏸ 产品设计 |

### 🔴 P0 — 安全（已完成）

| ID | 问题 | 状态 |
|----|------|------|
| S1 | 管理端预订接口鉴权 | ✅ |
| S2 | `GET /bookings` 须 QQ+手机 | ✅ |
| S2b | `GET/PUT/DELETE /bookings/[id]` | ✅ |
| S3 | 弹窗写操作与全量列表鉴权 | ✅ |
| S4 | `config/items` CRUD 鉴权 | ✅ |
| S6 | 500 不暴露 stack | ✅ |
| S7/S8 | 画集等写操作 + 管理员角色 | ✅ |
| T6-host | 用户删单 route 层凭证匹配 | ✅ |

### 🟠 P1 — API 设计（已完成）

| ID | 问题 | 状态 |
|----|------|------|
| A1 | `/admin/refresh` 改 POST | ✅ |
| A2 | 用户删单与 admin 删单语义分离 | ✅ |
| A3 | 合并 refresh 至 `POST /bookings/admin` | ✅ |

### 🟡 P2 — 响应格式（部分完成，仍有债）

| ID | 问题 | 状态 |
|----|------|------|
| R1 | 提供 `apiOk` / `apiFail` / `handleRouteError` | ✅ |
| R2 | 500 无 details 外泄 | ✅ |
| R3 | `apiData`/`apiErrorWithCode`；预订公开成功体仍裸对象；DELETE → `{ data }` | ✅ 宿主 |
| R4 | admin 预订仍裸对象（sa2kit）；其余列表 `{ success, data }` | ✅ 约定 |

建议目标契约：

```typescript
// 成功
{ data: T }

// 错误
{ error: { code: string; message: string } }
```

### 🔵 P3 — 前端（sa2kit，大部分已完成）

| ID | 问题 | 状态 |
|----|------|------|
| F1 | 未使用的 `ArtworkViewer` / `ThumbnailSidebar` import | ✅ sa2kit |
| F2 | 购物车三套状态机制 | ✅ sa2kit |
| F3 | config Mega Component 拆分 | ✅ sa2kit |
| F4 | 统一 SWR 等数据层 | N/A |
| FE1 | 宿主仅薄封装，UI 深度优化依赖 sa2kit 发版 | ⏸ |
| FE2 | config/history 经 layout 加载 init | ✅ |

### ⚪ P4 — 架构与性能

| ID | 问题 | 状态 |
|----|------|------|
| AR1 | 服务模块顶层单例 | ✅ |
| AR2 | UniversalExport 多实例缓存 | ✅ |
| AR3 | `bookings.id` primaryKey + 迁移 0055 | ✅ |
| INIT1 | layout 统一 `sa2kit-init` | ✅ |
| IMG1 | 图片 Base64（暂不改动） | ⏸ |
| IMG2 | 历史 Base64 只读 | ⏸ |
| PERF1 | collections overview + `nocache` | ✅ |

### 🛠 P5 — 运维脚本（已弃用）

| ID | 问题 | 状态 |
|----|------|------|
| OPS1–OPS4 | 活动/OSS/作品批量迁移 CLI | N/A 已移除（2026-05-21） |
| G2 | 脚本曾迁至 `scripts/`，迁移类已删 | ✅ |

### 📝 P6 — 配置与日志

| ID | 问题 | 状态 |
|----|------|------|
| CFG1 | `configEnvironment` 解析 environment | ✅ |
| LOG1 | `routeDebug` 生产静默 | ✅ 全 API |
| LOG2 | 删画集失败不泄露 message | ✅ |
| LOG3 | GET config 不打印全文 | ✅ |
| API1 | categories/tags 移除无用 searchParams | ✅ |
| DOC1 | 双文档状态一致（本次已同步） | ✅ |

### sa2kit 包内（Phase 2）

详见 [`SA2KIT_PLAN.md`](../../../modules/showmasterpiece/SA2KIT_PLAN.md)、[`SA2KIT_PUBLISH_CHECKLIST.md`](../../../modules/showmasterpiece/SA2KIT_PUBLISH_CHECKLIST.md)。

| ID | 问题 | 状态 |
|----|------|------|
| T6-sa2kit-cmd | `deleteBooking(id, options?)` | 🔄 代码在 sa2kit 仓，**npm 待发 1.6.115** |
| T1-host | profile-v1 类型补丁 | ✅ |
| T1-sa2kit / T4 | 导出收紧、`masterpiecesDbService` 去全局 db | ⬜ |
| T5 | migration 子包 | N/A |
| T2/T3/T6-web | 查询精确匹配、前端删单凭证 | ✅ |

---

## 二、模块架构速览

| 层级 | 路径 | 说明 |
|------|------|------|
| 页面 | `src/app/(pages)/testField/(cyhj)/ShowMasterPieces/` | re-export sa2kit 页面 |
| API 实现 | `src/modules/showmasterpiece/api/` | 鉴权、响应、转发服务 |
| 对外 URL | `src/app/api/showmasterpiece/**` | 薄 re-export |
| 初始化 | `src/modules/showmasterpiece/sa2kit-init.ts` | 文件 URL global 解析 |
| 业务/UI | `sa2kit@^1.6.114` | 画集、预订、管理端 |

---

## 三、历史执行记录（2026-04-06）

- ✅ 管理端预订、弹窗、config items 鉴权；移除 stack 泄露
- ✅ refresh → POST；合并 admin 路由
- ✅ booking 错误响应统一为 `{ error }`（部分路由，全量见 R3）
- ✅ sa2kit：F1–F3 前端清理；AR3 主键迁移
- ✅ AR2 universalExport 缓存修复

---

## 四、2026-05-21 审计摘要

**已完成且稳定**：Phase 0/1 安全与 API 分层、预订单例、图片 global 解析器、用户查单 QQ+手机、管理端 `requireAdmin`。

**仍需处理（已写入 FIX_CHECKLIST Phase 4–8）**：

1. ~~公开写接口防刷（S9、S10）~~ ✅
2. ~~删单 Command 凭证（T6-sa2kit-cmd）~~ ✅ 1.6.115
3. ~~迁移脚本~~ 已按产品决定移除（OPS N/A）
4. ~~响应格式与 config 环境（R3、R4、CFG1）~~ ✅ 宿主侧
5. ~~`sa2kit-init`、主要路由日志（INIT1、LOG*）~~ ✅；图片 Base64（IMG*）仍待
6. 类型补丁（T1）；migration 子包不再接入（T5 N/A）

---

## 五、验证

见 FIX_CHECKLIST「验证命令」一节。
