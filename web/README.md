# web/

原 `apps/` 目录，仅存放 **Next.js Web 矩阵**（主站 + 子应用）。  
RN / Electron 将迁至顶层 `mobile/`、`desktop/`（见迁移计划）；跨端 shared 在 `npm/`。

| 应用 | 路径 | dev 端口 | 说明 |
|------|------|----------|------|
| `@profile/web` | `web/web/` | 3000 | 主站（Auth、实验田） |
| `@profile/calendar` | `web/calendar/` | 3001 | 日历 Web |
| `@profile/teach-hub` | `web/teach-hub/` | 3002 | TeachHub Web |
| `@profile/showmasterpiece` | `web/showmasterpiece/` | 3003 | 画集 |
| `@profile/money-research` | `web/money-research/` | 3004 | 调研 Demo（暂留） |
| `@profile/node-notes` | `web/node-notes/` | 3005 | 节点笔记 |

迁移中仍暂存于此（阶段 1/2 外迁）：

| 应用 | 路径 | 目标 |
|------|------|------|
| `@profile/calendar-mobile` | `web/calendar-mobile/` | → `mobile/calendar-mobile` |
| `@profile/teach-hub-mobile` | `web/teach-hub-mobile/` | → `mobile/teach-hub-mobile` |
| `@profile/teach-hub-desktop` | `web/teach-hub-desktop/` | → `desktop/teach-hub-desktop` |

旁路：WordPress [`deploy/wordpress/`](../deploy/wordpress/)，Godot [`deploy/games/`](../deploy/games/)。  
计划：[`docs/monorepo-migration/APPS-SUBMODULE-PLAN.md`](../docs/monorepo-migration/APPS-SUBMODULE-PLAN.md)。

## 本地开发

```bash
pnpm dev                  # 主站 :3000
pnpm dev:calendar         # :3001
pnpm dev:teach-hub        # :3002
pnpm dev:showmasterpiece  # :3003
pnpm dev:calendar-mobile  # Expo（暂仍在 web/ 下）
```

网关：[`deploy/MIGRATION-RUNBOOK.md`](../deploy/MIGRATION-RUNBOOK.md)。
