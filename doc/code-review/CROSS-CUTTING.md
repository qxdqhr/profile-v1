# 跨切问题（Cross-Cutting）

> 更新：2026-08-29  
> 来源：首轮共享包 + cutover 子应用 + ideaList 评审

---

## CX-001 — 全站关闭 TypeScript 构建闸门（P1）

**现象**：以下应用均设置 `typescript.ignoreBuildErrors: true`：

- `apps/web`
- `apps/calendar` / `teach-hub` / `showmasterpiece`
- `apps/node-notes` / `money-research`

**风险**：类型错误可进入 Docker 镜像与生产；CI 矩阵 build 无法拦截。

**建议**：

1. 短期：在 CI 增加独立 `tsc --noEmit`（可不阻塞现有 docker build）。  
2. 中期：按应用逐个关掉 `ignoreBuildErrors`，先 calendar / teach-hub（体量相对可控）。

**状态**：open

---

## CX-002 — `@profile/db` schema 上帝对象（P2）

**现象**：`packages/db/src/schema/index.ts` 用相对路径硬编码聚合：

- `apps/web/src/modules/*/db/schema`
- `packages/*-core/src/db/schema`
- sa2kit 内建表、考试表等

**风险**：模块搬迁即破坏 db 包；循环依赖与迁移边界模糊。

**建议**：长期按领域拆 schema 入口（或 workspace 包显式导出 schema 再由 db 聚合）；新模块禁止再加深耦合前先登记本文件。

**状态**：open（接受为当前架构，跟踪演进）

---

## CX-003 — import 即连库 / 即初始化 auth（P2）

**现象**：

- `import '@profile/db'` → `ensureAppConfigLoaded()` + postgres 连接  
- `import '@profile/auth/server'` → 拉起 auth + 间接依赖 db

**风险**：脚本、测试、边缘路由副作用大；冷启动与错误面放大。

**建议**：懒连接工厂；脚本明确走 `preload`；文档化「禁止在 client bundle 导入 server 入口」。

**状态**：open

---

## CX-004 — DB `sslMode` 被忽略（P0/P1）

**位置**：`packages/db/src/client.ts` 读取 `sslMode` 后仍 `ssl: false`。

**风险**：生产库若强制 SSL，连接失败或被迫明文。

**建议**：按 `sslMode`（`disable` / `prefer` / `require`）映射到 `postgres` 的 `ssl` 选项；补环境冒烟。

**状态**：open

---

## CX-005 — Auth package exports 缺口（P2）

**现象**：消费方广泛使用 `@profile/auth/react`，但 `packages/auth/package.json` `exports` 未声明 `./react`（靠 tsconfig paths）。

**建议**：补上 `exports["./react"]`，与 `./client` / `./server` 对齐。

**状态**：open

---

## CX-006 — 子应用 `/api/ai` 与网关分流语义（P1）

**现象**：

- 生产 nginx：`/api/ai/*` → **web**  
- calendar / teach-hub / showmasterpiece 本地仍挂载 `/api/ai` 副本  
- calendar 前端默认请求根路径 `/api/ai`（依赖网关）

**风险**：文档不清时易改成相对路径导致子应用容器 404；双实现易 drift。

**建议**：在 KNOWLEDGE_BASE / 部署 runbook 明确「浏览器 AI → web；子应用副本仅 standalone」；考虑子应用去掉副本或共享同一 handler 包。

**状态**：open

---

## CX-007 — showmasterpiece API 双挂载（P0）

见 [apps/showmasterpiece.md](./apps/showmasterpiece.md)。  
`apps/web/src/app/api/showmasterpiece/**` 与子应用并存。

**状态**：open

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
