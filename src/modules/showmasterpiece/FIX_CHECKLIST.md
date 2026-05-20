# ShowMasterpiece 问题修复清单（profile-v1）

> **宿主范围**：仅 `profile-v1` 内改动；sa2kit 见 Phase 2/3（下一阶段）  
> 状态：⬜ 待办 · 🔄 进行中 · ✅ 完成 · ⏸ 依赖 sa2kit

**实现**：`src/modules/showmasterpiece/api/` · **URL**：`src/app/api/showmasterpiece/**`（薄 re-export）

---

## Phase 0 — 安全与断裂 ✅

| ID | 子任务 | 状态 |
|----|--------|------|
| S1 | 管理端预订 API `requireAdmin` | ✅ |
| S2 | `GET /bookings` 须 QQ+手机 | ✅ |
| S2b | `GET/PUT/DELETE /bookings/[id]` | ✅ |
| S3 | 弹窗全量列表需管理员 | ✅ |
| S4 | `config/items` 读写需管理员 | ✅ |
| S5 | `showmaster_config_permissions` | ⏸ sa2kit/产品设计 |
| S6 | 500 无 stack/details | ✅ |
| G1 | 文件 URL 仅 `sa2kit-init` | ✅ |
| G2 | 迁移脚本路径 | ✅ |
| S7 | 写操作 `requireAdmin` | ✅ |
| S8 | `admin` / `super_admin` | ✅ |
| T6-host | `DELETE /bookings/[id]` 凭证删单 | ✅ |

---

## Phase 1 — 架构 ✅

| ID | 子任务 | 状态 |
|----|--------|------|
| A1 | API 在 `modules/showmasterpiece/api` | ✅ |
| A2 | `app/api` 仅 re-export | ✅ |
| A3 | `api/lib/*` 公共库 | ✅ |
| R1 | `apiFail` / `apiOk` / `handleRouteError` | ✅ |
| R2 | 无对外 `details` | ✅ |
| AR1 | 预订服务单例 `bookingServices.ts` | ✅ |
| IMG | 图片路由走 global 解析器 | ✅ |

---

## Phase 2 — sa2kit `v1.6.114` ✅（已构建，待 npm 发布）

| ID | 子任务 | 状态 |
|----|--------|------|
| T2 | `getBookingsList` 精确 `eq` 匹配 | ✅ sa2kit |
| T3 | 小程序须 QQ+手机；Web 删单带凭证 | ✅ sa2kit |
| T6-sa2kit | `BookingService.deleteBooking(id, credentials)` | ✅ sa2kit |
| T1 | 类型去掉 `any` 补丁 | ⏸ |
| T4 | DbService 注入 `db` | ⏸ |
| T5 | 构建 `migration` 子包 | ⏸ |

> profile-v1 已锁定 `sa2kit@1.6.114`（本地验证通过 `pnpm build`）。若 `npm publish` 未执行，请在本机 `npm login` 后于 sa2kit 目录执行 `npm publish`，再 `pnpm up sa2kit@1.6.114`。

---

## Phase 3 — sa2kit UI ⏸

F1–F4 见 `src/app/api/showmasterpiece/OPTIMIZATION.md`

---

## 执行记录

| 日期 | 内容 |
|------|------|
| 2026-05-20 | P0/P1 全量落地；验证前补 T6-host、booking 单例、image 路由、config GET 鉴权 |

---

## 验证命令

```bash
pnpm exec tsc --noEmit --pretty false 2>&1 | rg "showmasterpiece" || echo "无 showmasterpiece 类型错误"
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
```
