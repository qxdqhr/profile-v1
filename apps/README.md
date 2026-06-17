# apps/

pnpm workspace 应用目录。

| 应用 | 路径 | 说明 |
|------|------|------|
| `@profile/web` | `web/` | 主站（ST-07 已从根迁入） |
| `@profile/calendar` | `calendar/` | 日历子应用（ST-10） |
| `@profile/teach-hub` | `teach-hub/` | teachHub 子应用（ST-14） |

本地开发：`pnpm dev`（根委托）或 `pnpm --filter @profile/web dev`。
