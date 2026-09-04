# 外部维护库（sa2kit / sa2kit-ui）

> 源码以 **git submodule** 挂在 `packages/sa2kit/`、`packages/sa2kit-ui/`，同时保持独立 GitHub 仓与 **npm 发布面**。  
> 本仓用 `workspace:*` 引用；客户仓 / 接单项目仍 `npm i sa2kit` 等（**启明星不变**）。  
> 本目录存放「目标架构 + 消费方/库源码联合 CR」。

## 目标架构（先读）

**[BLUEPRINT-multiplatform-sa2kit.md](./BLUEPRINT-multiplatform-sa2kit.md)** — 多端 SDK 蓝图 §0 北极星。

**当前执行**：**Phase F** 大域新域 — [DOMAIN-MIGRATION-ROADMAP.md](./DOMAIN-MIGRATION-ROADMAP.md)

| 已完成（归档） | 文档 |
|----------------|------|
| UI 统一 + 门禁 | `pnpm gate:ui`；`.cursor/rules/profile-v1-sa2kit-ui.mdc` |
| 接入 / ADR | `packages/sa2kit/docs/HOST-ONBOARDING.md`、`adr/002-*.md` |
| festivalCard 试点 | `packages/sa2kit/.../festivalCard/PLATFORMS.md` |

SSOT 短节：`.cursor/KNOWLEDGE_BASE.md` §1.1 / §7.0。

---

## CR 报告

| 库 | 本地源码 | npm / 消费方式 | 报告 |
|----|----------|----------------|------|
| **sa2kit** | submodule `packages/sa2kit/` | 本仓 `workspace:*`；对外 npm `sa2kit` | [sa2kit.md](./sa2kit.md) |
| **sa2kit-ui** | submodule `packages/sa2kit-ui/` | 本仓 `@sa2kit-ui/*` | [sa2kit-ui.md](./sa2kit-ui.md) |

### 关系示意（目标态）

```
sa2kit-ui ──► sa2kit/common/ui/{web,rn,taro}
                 │
sa2kit/common/*  +  sa2kit/business/<域>/{domain,server,ui/*}
                 │
     ┌───────────┼───────────┐
     ▼           ▼           ▼
 profile-v1   RN apps    Taro/Electron
 (web+api壳)  (ui/rn)    (ui/taro|web)
```

### 现状（2026-09-04）

```
Phase F · F1 ✅ · F2 🟡
  calendar: server+routes ✅
  teachHub: schema ✅ / handlers ⬜
  showmasterpiece: 未开
下一刀：teachHub T2 handlers，或 calendar C3 ui/web
```

详见 [DOMAIN-MIGRATION-ROADMAP.md](./DOMAIN-MIGRATION-ROADMAP.md)。

### profile-v1 内同名扩展（非上述两库）

| 包 | 说明 |
|----|------|
| `@sa2kit/exam` | 考试 SDK，profile 私有扩展 |
| `@sa2kit/feishu-bot` | 飞书 webhook 工具 |
