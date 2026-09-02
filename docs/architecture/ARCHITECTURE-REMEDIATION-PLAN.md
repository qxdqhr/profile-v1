# 架构九项改造计划（最高优先级）

> **状态**：**A→E 已完成**（2026-09-02）  
> 产品级余项（skill 目录公开读、玩法 BGM base64、无 per-resource ACL 等）见 [`AUTH-SURFACE-AUDIT.md`](./AUTH-SURFACE-AUDIT.md) Remaining risks，不阻塞本计划关闭。  
> **优先级**：**P0 — 全仓最高优先**（收尾期）；与北极星冲突时以本计划 + [蓝图 §0](../code-review/libraries/BLUEPRINT-multiplatform-sa2kit.md) 为准。  
> **创建**：2026-09-02  
> **关闭**：2026-09-02  
> **背景**：对照 `.cursor/KNOWLEDGE_BASE.md` 与 `docs/code-review/` 的架构评审结论。  
> **相关**：[`CROSS-CUTTING.md`](../code-review/CROSS-CUTTING.md)、[`CUSTOMER-VS-HOST.md`](./CUSTOMER-VS-HOST.md)、[`AUTH-SURFACE-AUDIT.md`](./AUTH-SURFACE-AUDIT.md)

---

## 0. 拍板决策（2026-09-02）

| 项 | 决策 |
|----|------|
| ShowMasterpiece 双挂载 | **1a** — 直接删除主站 `app_web/web/src/app/api/showmasterpiece/**` |
| 子应用 `/api/ai` | **2a** — 删除 calendar / teach-hub 本地副本；浏览器一律经网关打到 **web** |
| shared 包位置 | **已并入 `*-core/shared`**（删除 `npm/*-shared`）；禁止再新建独立 shared 包 |
| 生产库 | Phase B 验证默认只本地/dev；**不主动** `prodb:push` |
| 执行范围 | **Phase A→E 全做** |

---

## 1. 完成判定

| 检查 | 命令 / 证据 |
|------|-------------|
| 架构门禁 | `pnpm gate:architecture` |
| UI 门禁 | `pnpm gate:ui` |
| 类型闸门 | calendar / teach-hub / showmasterpiece / web 均 `ignoreBuildErrors: false` 且可 build |
| 鉴权面 | [`AUTH-SURFACE-AUDIT.md`](./AUTH-SURFACE-AUDIT.md) |

---

## 2. Phase 明细

### Phase A — 止血

| ID | 动作 | 状态 |
|----|------|------|
| A1 | `packages/db`：`sslMode` → 真实 `ssl` 映射 | ✅ |
| A2 | 删除主站 `api/showmasterpiece/**`（1a） | ✅ |
| A3 | 删除子应用 `/api/ai` 副本；nginx + 文档固化（2a） | ✅ |
| A4 | 关闭 calendar / teach-hub 的 `ignoreBuildErrors`；修到可 build | ✅ |
| A5 | examples admin 路由补 AuthGuard | ✅ |

### Phase B — `@profile/db` 依赖倒转

| ID | 动作 | 状态 |
|----|------|------|
| B1 | schema 只从 workspace 包 / 本地 `packages/db/src/schema` 导出 | ✅ |
| B2 | core + 主站 DB 模块改为包导出 / 迁入 db 包 | ✅ |
| B3 | exam 内联表迁到 `exam.ts` | ✅ |
| B4 | `app_web/web/src/db` 标 deprecated，仍 re-export `@profile/db` | ✅ |

### Phase C — 包布局与 SSOT

| ID | 动作 | 状态 |
|----|------|------|
| C1 | shared 统一在 `npm/`；文档标注后期可撤 | ✅（历史） |
| C1′ | 撤掉 `npm/*-shared`，并入 `*-core/src/shared` + exports | ✅ |
| C2 | 根 workspace 职责：脚本 + 门禁；业务依赖在 apps（持续收敛） | ✅ 文档化 |
| C3 | 删除过时 `bun.lock`（仅 pnpm-lock） | ✅ |
| C4 | 规则/知识库路径 `app_web/web/src/modules`；Route Group 决策树 | ✅ |

### Phase D — 主站变薄 + 闸门收尾

| ID | 动作 | 状态 |
|----|------|------|
| D1 | `pnpm gate:architecture` 禁止双挂载回流 | ✅ |
| D2 | ideaList `await params` P0；鉴权面审计与高危收紧 | ✅（范本 + AUTH 审计扫尾；剩余为产品级公开面/ACL） |
| D3 | showmasterpiece / web 关闭 `ignoreBuildErrors` | ✅ showmasterpiece + web（`tsc` + `pnpm build:showmasterpiece` / `pnpm build:web`） |
| D4 | DB 懒连接工厂 + `getDb()` | ✅ |

### Phase E — 仓库身份与旁路

| ID | 动作 | 状态 |
|----|------|------|
| E1 | [`CUSTOMER-VS-HOST.md`](./CUSTOMER-VS-HOST.md) | ✅ |
| E2 | 旁路隔离约定巩固（知识库 §7.0 + 本文） | ✅ |
| E3 | 实验田入口与 `/games` 决策树 | ✅（KB §2.2） |
| E4 | 验证实验 vs 可接单产品分区 | ✅（E1 文档） |

---

## 3. 进度日志

| 日期 | 摘要 |
|------|------|
| 2026-09-02 | 本文落地；拍板 1a / 2a；执行 A→E |
| 2026-09-02 | C1′：`calendar-shared` / `teach-hub-shared` 并入对应 core 的 `./shared`；删除 `npm/*-shared` |
| 2026-09-02 | D3：showmasterpiece + web `ignoreBuildErrors: false`，build 通过 |
| 2026-09-02 | D2 扫尾：sync task GET / vocaloid-booth-test 鉴权；filetransfer 挂载；BGM `?meta=1` |
| 2026-09-02 | **计划关闭**：A→E 全部 ✅；余项转入 AUTH 审计产品级跟踪 |

---

## 4. 门禁

```bash
pnpm gate:ui
pnpm gate:architecture
pnpm gate   # 两者
```
