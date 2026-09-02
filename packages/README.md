

# packages/

本目录为 pnpm workspace 成员包（领域 core / 基建）。

| 包名 | 路径 | 说明 |
|------|------|------|
| `@profile/config` | `config/` | 配置 |
| `@profile/auth` | `auth/` | 鉴权薄封装 |
| `@profile/db` | `db/` | DB 客户端 + schema 聚合 |
| `@profile/ui` | `ui/` | Tailwind preset |
| `@profile/calendar-core` | `calendar-core/` | 日历领域；RN/客户端见 `./shared` |
| `@profile/teach-hub-core` | `teach-hub-core/` | TeachHub 领域；RN/客户端见 `./shared` |
| `@profile/showmasterpiece-core` | `showmasterpiece-core/` | ShowMasterpiece 全量业务 |
| `@profile/node-notes-core` | `node-notes-core/` | 节点笔记 |
| `@sa2kit/exam` | `sa2kit-exam/` | 考试模块 |
| `@sa2kit/feishu-bot` | `sa2kit-feishu/` | 飞书通知 |

## 跨端 client-safe 代码

原 `npm/*-shared` 已并入各 core 的 `src/shared/`，经 package `exports` 暴露：

- `@profile/calendar-core/shared`（及 `/shared/types`、`/shared/api`、…）
- `@profile/teach-hub-core/shared`（及 `/shared/types`、`/shared/api`、`/shared/routes`、…）

**禁止**新建独立 `*-shared` 包（无论 `packages/` 还是 `npm/`）。shared 路径不得依赖 Next server-only 或 `@profile/db`。

主站 Next：`web/web/`（`@profile/web`）。架构改造：[`docs/architecture/ARCHITECTURE-REMEDIATION-PLAN.md`](../docs/architecture/ARCHITECTURE-REMEDIATION-PLAN.md)。
