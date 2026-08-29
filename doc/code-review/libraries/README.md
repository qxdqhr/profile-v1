# 外部维护库（sa2kit / sa2kit-ui）

> 源码不在 profile-v1 monorepo 内，但由同一维护者维护，且被 profile-v1 **强依赖**。  
> 本目录存放「目标架构 + 消费方/库源码联合 CR」。

## 目标架构（先读）

**[BLUEPRINT-multiplatform-sa2kit.md](./BLUEPRINT-multiplatform-sa2kit.md)** — **现行推荐蓝图**：

- sa2kit = 多端 SDK（`common` + `business` 同仓，按 `web|server|rn|taro` 导出）
- 宿主（profile Web、RN、Taro）只做壳；业务实现不复制
- sa2kit-ui = 设计系统，经 `sa2kit/common/ui*` 消费

旧稿 [TARGET-ARCHITECTURE.md](./TARGET-ARCHITECTURE.md) 已降级（其中「business 迁出」作废）。

SSOT 短节：`.cursor/KNOWLEDGE_BASE.md` §1.1。

---

## CR 报告

| 库 | 本地源码 | npm / 消费方式 | 报告 |
|----|----------|----------------|------|
| **sa2kit** | `/home/qhr/project/sa2kit` | `sa2kit@3.9.1` | [sa2kit.md](./sa2kit.md) |
| **sa2kit-ui** | `/home/qhr/project/sa2kit-ui` | `@sa2kit-ui/react` → `@qhr123/sa2kit-ui-react@0.1.6`；部分子应用仍用 `animal-island-ui@^0.9.6` | [sa2kit-ui.md](./sa2kit-ui.md) |

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
animal-island-ui ──仍被──► calendar / teach-hub / showmasterpiece
@sa2kit-ui/react ──► HomeV2；web 旧页靠 webpack alias
sa2kit/common/components ──► 另一套 shadcn 风（与动森 UI 并存）
*-core 已 cutover ──► 默认冻结，新多端优先进 sa2kit
```

详见 [BLUEPRINT](./BLUEPRINT-multiplatform-sa2kit.md)。

### profile-v1 内同名扩展（非上述两库）

| 包 | 说明 |
|----|------|
| `@sa2kit/exam` (`packages/sa2kit-exam`) | 考试 SDK，profile 私有扩展 |
| `@sa2kit/feishu-bot` (`packages/sa2kit-feishu`) | 飞书 webhook 工具 |
