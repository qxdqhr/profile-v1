# 跨切问题（Cross-Cutting）

> 更新：2026-08-29  
> 来源：首轮共享包 + cutover 子应用 + ideaList 评审

---

## CX-001 — 全站关闭 TypeScript 构建闸门（P1）

**现象**：以下应用曾设置 `typescript.ignoreBuildErrors: true`。

**进展（2026-09-02）**：`web/calendar`、`web/teach-hub` 已改为 `false`，并通过生产 build 类型检查。其余（web / showmasterpiece / node-notes / money-research）仍待 Phase D3。

**状态**：partial

---

## CX-002 — `@profile/db` schema 上帝对象（P2）

**进展（2026-09-02）**：schema 聚合改为包名导出 + `packages/db/src/schema/*` 本地文件；**禁止**相对路径反向依赖 `web/web`。exam 已拆到 `exam.ts`。

**状态**：closed（结构债降级为 workspace 环，跟踪演进）

---

## CX-003 — import 即连库 / 即初始化 auth（P2）

**进展（2026-09-02）**：`@profile/db` 改为懒连接（Proxy + `getDb()`）；首次访问才 `ensureAppConfigLoaded` + 建连。Auth 仍可能在 import server 时初始化。

**状态**：partial（db 已懒；auth 另跟）

---

## CX-004 — DB `sslMode` 被忽略（P0/P1）

**进展（2026-09-02）**：`packages/db/src/client.ts` 按 `disable|prefer|require|verify-full` 映射 postgres `ssl`。

**状态**：closed

---

## CX-005 — Auth package exports 缺口（P2）

**现象**：`./react` 已在 `packages/auth/package.json` exports 中声明。

**状态**：closed

---

## CX-006 — 子应用 `/api/ai` 与网关分流语义（P1）

**进展（2026-09-02）**：删除 calendar / teach-hub `/api/ai` 副本；nginx 显式 `/api/ai/` → web；文档写入 KNOWLEDGE_BASE §7.3。门禁：`pnpm gate:architecture`。

**状态**：closed

---

## CX-007 — showmasterpiece API 双挂载（P0）

**进展（2026-09-02）**：已删除 `web/web/src/app/api/showmasterpiece/**`；生产仅子应用。门禁：`pnpm gate:architecture`。

**状态**：closed

---

## CX-008 — 运维脚本 schema 引用错误（P2）

**位置**：`scripts/update-admin-password.ts` import `userSessions`，`@profile/auth/schema` 实际导出为 `session`。

**风险**：脚本无法运行；紧急改密流程失效。

**建议**：改为正确表名并本地 dry-run。

**状态**：open

---

## CX-009 — 配置与迁移路径双轨（P2）

- 运行时：YAML via `@profile/config`（可被 `DATABASE_URL` 覆盖）  
- drizzle-kit / 部分 migrate：偏 `DATABASE_URL` + dotenv

**建议**：统一文档与脚本入口（一律 `--import @profile/config/preload`）。

**状态**：open

---

## CX-010 — sa2kit 角色枚举大小写漂移（P0）

**现象**：

- DB enum：`USER` / `ADMIN` / `SUPER_ADMIN`（`sa2kit/.../enums.ts`）  
- `@profile/auth` `isAdminRole`：正确 `toUpperCase()`  
- sa2kit `UserMenu`：比较 `role === 'admin'` → 管理员永远显示「普通用户」  
- `scripts/update-admin-password.ts`：查询小写 `admin`（且错误 import `userSessions`）

**建议**：库侧修 UserMenu；脚本对齐 enum；全仓 grep 小写 role 字面量。

**详见**：[libraries/sa2kit.md](./libraries/sa2kit.md) SK-002  

**状态**：open

---

## CX-011 — UI 三套并行 + animal-island 双轨（P0）

**现象**：

1. `@profile/ui`（Tailwind preset）  
2. `sa2kit/common/components`（shadcn 业务组件）  
3. 动森 UI：`@sa2kit-ui/react`（web HomeV2）vs `animal-island-ui@0.9.6`（calendar/teach-hub/showmasterpiece）vs webpack alias（web 旧页）

**风险**：样式/API drift、安全修复只修一边、Turbopack 下 alias 失效。

**目标态（已升级）**：sa2kit 为**多端 SDK**（common + business 同仓按端导出）；UI/主题经 `sa2kit/common/ui*`；profile / RN / Taro 只做宿主壳。见 [BLUEPRINT-multiplatform-sa2kit.md](./libraries/BLUEPRINT-multiplatform-sa2kit.md)。

**建议**：凡改动先问「能否让下一单客户仓直接引用库」；执行上按蓝图 **北极星 > Phase U（UI 统一）> 试点 / 功能优化**。

**详见**：[libraries/sa2kit-ui.md](./libraries/sa2kit-ui.md) SUI-001；**执行计划** [libraries/UI-UNIFICATION-PLAN.md](./libraries/UI-UNIFICATION-PLAN.md)；蓝图 §0 / §7 Phase U  

**状态**：closed（2026-08-29）— Phase U 完成：UI 经 `sa2kit/common/ui*`；profile `pnpm gate:ui` / sa2kit `pnpm gate:ui` 固化；见 [UI-UNIFICATION-PLAN.md](./libraries/UI-UNIFICATION-PLAN.md)

---

## CX-012 — business admin / 文件上传鉴权在宿主（P0/P1）

**现象**：sa2kit admin UI 与 universalFile 服务不内置 session；安全完全依赖 profile route。  
已知暴露面：`examples/test-yourself-admin` 无 AuthGuard。

**建议**：建立「宿主必须鉴权」清单；缺省 route 补 Guard；库 README 标明契约。

**详见**：[libraries/sa2kit.md](./libraries/sa2kit.md) SK-001 / SK-003  

**状态**：open

---

## 已关闭

（暂无）
