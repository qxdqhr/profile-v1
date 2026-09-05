# 外部维护库（sa2kit / sa2kit-ui）

> 源码以 **git submodule** 挂在 `packages/sa2kit/`、`packages/sa2kit-ui/`，同时保持独立 GitHub 仓与 **npm 发布面**。  
> 本仓用 `workspace:*` 引用；客户仓 / 接单项目仍 `npm i sa2kit` 等（**启明星不变**）。  
> 本目录存放「目标架构 + 消费方/库源码联合 CR」。

## 目标架构（先读）

**[BLUEPRINT-multiplatform-sa2kit.md](./BLUEPRINT-multiplatform-sa2kit.md)** — 多端 SDK 蓝图 §0 北极星。

**Phase G 完成**（G1–G8 ✅）：`packages/` 仅 `sa2kit` + `sa2kit-ui`。蓝图 [§14](./BLUEPRINT-multiplatform-sa2kit.md#14-phase-g--双库收敛packages-仅保留-sa2kit--sa2kit-ui) · [DOMAIN-MIGRATION-ROADMAP.md](./DOMAIN-MIGRATION-ROADMAP.md)

| 已完成（归档） | 文档 |
|----------------|------|
| UI 统一 + 门禁 | `pnpm gate:ui`；`.cursor/rules/profile-v1-sa2kit-ui.mdc` |
| 接入 / ADR | `packages/sa2kit/docs/HOST-ONBOARDING.md`、`adr/002-*.md` |
| festivalCard 试点 | `packages/sa2kit/.../festivalCard/PLATFORMS.md` |
| Phase F 大域 | calendar / teachHub / showmasterpiece → `sa2kit/business/*` |
| Phase G1–G4 | feishu / exam / teach-hub-core / showmasterpiece-core 清零 |

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
Phase F · F0–F5 ✅
Phase G · G1–G4 ✅（feishu / exam / teach-hub-core / showmasterpiece-core）
Phase G 已收束；各域产品优化见 PENDING-OPTIMIZATION（需用户点名「优化项目」）
```

详见 [DOMAIN-MIGRATION-ROADMAP.md](./DOMAIN-MIGRATION-ROADMAP.md) 与蓝图 §14。

### profile-v1 内过渡包（Phase G 继续清零）

| 包 | 说明 | Phase G |
|----|------|---------|
| `*-core` / `@profile/{auth,db,config,ui}` | 过渡 facade / 基建薄包 | G3–G8 |
