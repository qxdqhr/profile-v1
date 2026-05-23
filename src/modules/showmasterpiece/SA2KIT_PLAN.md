# ShowMasterpiece — sa2kit 包修改计划（profile-v1 联动）

> **源码仓**：`/home/qhr/project/sa2kit`  
> **进度 SSOT**：[`FIX_CHECKLIST.md`](./FIX_CHECKLIST.md)  
> **发版核对**：[`SA2KIT_PUBLISH_CHECKLIST.md`](./SA2KIT_PUBLISH_CHECKLIST.md)

---

## 版本与依赖策略

| 环境 | profile-v1 `sa2kit` | 删单行为 |
|------|---------------------|----------|
| **npm 生产（当前）** | `^1.6.114` | 仅宿主 `bookingDelete` 校验 + `deleteBooking(id)`（第二参数运行时被忽略） |
| **本地联调** | `file:../sa2kit`（可选） | 宿主校验 + Command `deleteBooking(id, options)`（1.6.115 源码） |
| **发版后** | `^1.6.115` | 宿主 + Command 双层校验 |

**注意**：profile-v1 业务代码已按 1.6.115 编写（`deleteBooking` 第二参数）。在 **未升级 npm 包前**，安全依赖宿主 `bookingDelete.ts` 的预校验，不依赖 sa2kit Command 层。

---

## 待发版（1.6.115）— 代码已在 sa2kit 仓，尚未 push/npm

| ID | 改动 | 文件（sa2kit） | profile-v1 对接 |
|----|------|----------------|-----------------|
| T6-sa2kit-cmd | `deleteBooking(id, options?)`；`UNAUTHORIZED` | `server/services/bookingCommandService.ts` | `bookingDelete.ts`、`bookings/**` |
| — | 导出 `BookingDeleteCredentials`、`DeleteBookingOptions` | `server/services/index.ts` | `sa2kit-showmasterpiece-server.d.ts`（临时类型） |
| — | CHANGELOG `[1.6.115]` | `CHANGELOG.md` | — |

**发版后必做**：见 [`SA2KIT_PUBLISH_CHECKLIST.md`](./SA2KIT_PUBLISH_CHECKLIST.md)。

---

## 已合并到 sa2kit 仓（待你 push）

```text
sa2kit/
  package.json          # version 1.6.115
  CHANGELOG.md          # [1.6.115] T6-sa2kit-cmd
  src/business/showmasterpiece/server/services/
    bookingCommandService.ts
    index.ts
```

---

## 待办（sa2kit 仓，发版后迭代）

| ID | 优先级 | 任务 | 说明 |
|----|--------|------|------|
| T4 | 🟡 | `masterpiecesDbService` 去模块级 `let db` | 建议新增 `createMasterpiecesDbServices(db)` 工厂，逐步弃用 `categoriesDbService` 等全局单例 |
| T1-sa2kit | 🟡 | 收紧 Command/Query 的 `body: any` | 对齐 `booking-XgzSe0NL` 类型 |
| T5 | N/A | migration 子包 | profile-v1 已移除迁移 CLI |
| S5 | ⏸ | `showmaster_config_permissions` | 需产品设计 |

### T4 实施草案（下一版 sa2kit）

1. `initializeShowmasterpieceDb(db, resolver)` 改为返回 `{ categoriesDbService, collectionsDbService, ... }`。
2. 保留现有单例导出并标记 `@deprecated`，给 profile-v1 一版过渡期。
3. profile-v1 `masterpiecesDbService.ts` 改为使用工厂实例（仅包装层改动）。

---

## 本地联调（不发版时）

```bash
cd /home/qhr/project/sa2kit && pnpm build
cd /home/qhr/project/profile-v1 && pnpm add sa2kit@file:../sa2kit
pnpm exec tsc --noEmit --pretty false 2>&1 | grep -i showmaster || echo OK
```

恢复 npm：`pnpm add sa2kit@^1.6.114`（CI/他人克隆默认）

---

## profile-v1 后续（不依赖 sa2kit 发版）

| ID | 说明 | 状态 |
|----|------|------|
| HOST1 | 删单宿主预校验 + 1.6.115 前瞻调用 | ✅ |
| HOST2 | `sa2kit-showmasterpiece-server.d.ts` 临时类型 | ✅ 发版后删 |
| HOST3 | 管理端删单响应 `{ data }`（R3） | 见本次提交 |
| IMG* | 图片 Base64 | ⏸ 暂不改动 |
