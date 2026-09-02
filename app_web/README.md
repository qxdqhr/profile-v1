# app_web/

原 `apps/` 目录，仅存放 **Next.js Web 矩阵**（主站 + 子应用）。

| 应用 | 路径 | dev 端口 | 说明 |
|------|------|----------|------|
| `@profile/web` | `app_web/web/` | 3000 | 主站（Auth、实验田） |
| `@profile/calendar` | `app_web/calendar/` | 3001 | 日历 Web |
| `@profile/teach-hub` | `app_web/teach-hub/` | 3002 | TeachHub Web |
| `@profile/showmasterpiece` | `app_web/showmasterpiece/` | 3003 | 画集 |
| `@profile/money-research` | `app_web/money-research/` | 3004 | 调研 Demo（暂留） |
| `@profile/node-notes` | `app_web/node-notes/` | 3005 | 节点笔记 |

RN：[`app_mobile/`](../app_mobile/README.md)。桌面：[`app_desktop/`](../app_desktop/README.md)。跨端 shared：[`npm/`](../npm/README.md)。

旁路：WordPress [`deploy/wordpress/`](../deploy/wordpress/)，Godot [`deploy/games/`](../deploy/games/)。

## 本地开发

```bash
pnpm dev                  # 主站 :3000
pnpm dev:calendar         # :3001
pnpm dev:teach-hub        # :3002
pnpm dev:showmasterpiece  # :3003
pnpm dev:calendar-mobile  # Expo（app_mobile/）
pnpm dev:teach-hub-desktop  # Electron（app_desktop/）
```

网关：[`deploy/MIGRATION-RUNBOOK.md`](../deploy/MIGRATION-RUNBOOK.md)。
