# web/

原 `apps/` 目录，仅存放 **Next.js Web 矩阵**（主站 + 子应用）。

| 应用 | 路径 | dev 端口 | 说明 |
|------|------|----------|------|
| `@profile/web` | `web/web/` | 3000 | 主站（Auth、实验田） |
| `@profile/calendar` | `web/calendar/` | 3001 | 日历 Web |
| `@profile/teach-hub` | `web/teach-hub/` | 3002 | TeachHub Web |
| `@profile/showmasterpiece` | `web/showmasterpiece/` | 3003 | 画集 |
| `@profile/money-research` | `web/money-research/` | 3004 | 调研 Demo（暂留） |
| `@profile/node-notes` | `web/node-notes/` | 3005 | 节点笔记 |

RN 客户端已迁至 [`mobile/`](../mobile/README.md)；桌面端仍暂存 `web/teach-hub-desktop/`（阶段 2 → `desktop/`）。  
跨端 shared：[`npm/`](../npm/README.md)。

旁路：WordPress [`deploy/wordpress/`](../deploy/wordpress/)，Godot [`deploy/games/`](../deploy/games/)。

## 本地开发

```bash
pnpm dev                  # 主站 :3000
pnpm dev:calendar         # :3001
pnpm dev:teach-hub        # :3002
pnpm dev:showmasterpiece  # :3003
pnpm dev:calendar-mobile  # Expo（mobile/）
```

网关：[`deploy/MIGRATION-RUNBOOK.md`](../deploy/MIGRATION-RUNBOOK.md)。
