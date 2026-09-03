# 外部维护库（sa2kit / sa2kit-ui）

> 源码以 **git submodule** 挂在 `packages/sa2kit/`、`packages/sa2kit-ui/`，同时保持独立 GitHub 仓与 **npm 发布面**。  
> 本仓用 `workspace:*` 引用；客户仓 / 接单项目仍 `npm i sa2kit` 等（**启明星不变**）。  
> 本目录存放「目标架构 + 消费方/库源码联合 CR」。

## 目标架构（先读）

**[BLUEPRINT-multiplatform-sa2kit.md](./BLUEPRINT-multiplatform-sa2kit.md)** — **现行推荐蓝图**：

- sa2kit = 多端 SDK（`common` + `business` 同仓，按 `web|server|rn|taro` 导出）
- 宿主（profile Web、RN、Taro）只做壳；业务实现不复制
- sa2kit-ui = 设计系统，经 `sa2kit/common/ui*` 消费

旧稿 TARGET-ARCHITECTURE.md 已删除（其中「business 迁出」作废）；以 BLUEPRINT 为准。

SSOT 短节：`.cursor/KNOWLEDGE_BASE.md` §1.1 / §7.0。

---

## CR 报告

| 库 | 本地源码 | npm / 消费方式 | 报告 |
|----|----------|----------------|------|
| **sa2kit** | submodule `packages/sa2kit/`（`github.com/qxdqhr/sa2kit`） | 本仓 `workspace:*`；对外 npm `sa2kit` | [sa2kit.md](./sa2kit.md) |
| **sa2kit-ui** | submodule `packages/sa2kit-ui/`（`github.com/qxdqhr/sa2kit-ui`） | 本仓 `@sa2kit-ui/*` → `workspace:*`；对外 `@qhr123/sa2kit-ui-react` | [sa2kit-ui.md](./sa2kit-ui.md) |

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

### 现状债（收敛中）

```
Phase U ✅ — UI 经 sa2kit/common/ui*；pnpm gate:ui
Phase A/B ✅ — ADR-002、HOST-ONBOARDING、COMMON-PLATFORMS-EXPORTS
Phase C 🔄 — festivalCard 骨架/exports/PLATFORMS；UI 门面迁移进行中
Phase E — S2 评估见 [PHASE-E-S2-EVALUATION.md](./PHASE-E-S2-EVALUATION.md)（大域 S1）；包体 `measure:dist`
*-core 已 cutover ──► 默认冻结，新多端优先进 sa2kit
```

详见 [BLUEPRINT](./BLUEPRINT-multiplatform-sa2kit.md)。

### profile-v1 内同名扩展（非上述两库）

| 包 | 说明 |
|----|------|
| `@sa2kit/exam` (`packages/sa2kit-exam`) | 考试 SDK，profile 私有扩展 |
| `@sa2kit/feishu-bot` (`packages/sa2kit-feishu`) | 飞书 webhook 工具 |
