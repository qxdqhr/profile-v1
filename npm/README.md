# npm/

本目录曾放置跨端 `*-shared` 包（`@profile/calendar-shared`、`@profile/teach-hub-shared`）。

**已并入对应 `*-core` 的 client-safe 导出**（2026-09-02）：

| 旧包 | 新导入 |
|------|--------|
| `@profile/calendar-shared` | `@profile/calendar-core/shared`（另有 `/shared/types`、`/shared/api`、`/shared/utils/dateUtils`） |
| `@profile/teach-hub-shared` | `@profile/teach-hub-core/shared`（另有 `/shared/types`、`/shared/api`、`/shared/routes`、parsers / templates 等） |

源码位置：`packages/calendar-core/src/shared/`、`packages/teach-hub-core/src/shared/`。  
`pnpm-workspace.yaml` 仍保留 `npm/*` glob，本目录当前无 workspace 包。

详见 [`docs/architecture/ARCHITECTURE-REMEDIATION-PLAN.md`](../docs/architecture/ARCHITECTURE-REMEDIATION-PLAN.md) Phase C / C1′。
