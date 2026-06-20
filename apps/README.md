# apps/

pnpm workspace 应用目录。

| 应用 | 路径 | 说明 |
|------|------|------|
| `@profile/web` | `web/` | 主站（ST-07 已从根迁入） |
| `@profile/calendar` | `calendar/` | 日历子应用（ST-10） |
| `@profile/teach-hub` | `teach-hub/` | teachHub Web 子应用（ST-14） |
| `@profile/teach-hub-mobile` | `teach-hub-mobile/` | teachHub RN 客户端（Expo 脚手架） |
| `@profile/teach-hub-desktop` | `teach-hub-desktop/` | teachHub 桌面端（Electron 脚手架） |

本地开发：`pnpm dev`（根委托）或 `pnpm --filter @profile/web dev`。
