# ST-01 pnpm workspace 根脚手架

**任务 ID**：M-01  
**状态**：done  
**依赖**：M-00

## 目标

在仓库根建立 pnpm workspace 骨架，**不移动业务代码**，保证现有 `pnpm dev` / `pnpm build` 仍可运行。

## 交付物

- [x] 根目录 `pnpm-workspace.yaml`（含 `'.'` 以便 Turborepo 识别根包）
- [x] 目录占位：`apps/.gitkeep`、`apps/README.md`
- [x] `packages/README.md`（已有 `sa2kit-*` 与计划 `@profile/*` 说明）
- [x] 根 `package.json` 已有 `private: true` 与 `packageManager`

## 实际 `pnpm-workspace.yaml`

```yaml
packages:
  - '.'
  - 'apps/*'
  - 'packages/*'
```

> `'.'` 为 ST-02 Turborepo 所需：否则 `turbo --filter=personal-website` 无法命中根 Next 应用。

## 包名约定

| 路径 | npm name |
|------|----------|
| `apps/web` | `@profile/web` |
| `apps/calendar` | `@profile/calendar` |
| `apps/teach-hub` | `@profile/teach-hub` |
| `packages/config` | `@profile/config` |
| `packages/auth` | `@profile/auth` |
| `packages/db` | `@profile/db` |
| `packages/ui` | `@profile/ui` |
| `packages/calendar-core` | `@profile/calendar-core` |
| `packages/teach-hub-core` | `@profile/teach-hub-core` |

## 已有 workspace 成员（迁移前）

| 包名 | 路径 |
|------|------|
| `@sa2kit/exam` | `packages/sa2kit-exam/` |
| `@sa2kit/feishu-bot` | `packages/sa2kit-feishu/` |

## 验收记录（2026-06-11）

1. `pnpm install` 成功（Scope: all 3 workspace projects → 加入 `'.'` 后为 4）
2. 未搬迁源码，`pnpm dev` / `pnpm build` 仍在根执行
3. `docs/monorepo-migration/TASKS.md` M-01 标为 done

## 风险

- 过早把整个项目挪进 `apps/web` 会导致路径大面积变更 — **本 ST 禁止搬迁源码**

## 备注

ST-07 才真正搬迁 `src/` → `apps/web/`；本 ST 仅搭架子。
