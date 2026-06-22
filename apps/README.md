# apps/

pnpm workspace 应用目录。

| 应用 | 路径 | dev 端口 | 说明 |
|------|------|----------|------|
| `@profile/web` | `web/` | 3000 | 主站（Auth、实验田） |
| `@profile/calendar` | `calendar/` | 3001 | 日历 Web 子应用 |
| `@profile/calendar-mobile` | `calendar-mobile/` | Expo | 日历 RN 客户端 |
| `@profile/teach-hub` | `teach-hub/` | 3002 | TeachHub Web 子应用 |
| `@profile/teach-hub-mobile` | `teach-hub-mobile/` | Expo | TeachHub RN 客户端 |
| `@profile/teach-hub-desktop` | `teach-hub-desktop/` | — | TeachHub Electron 脚手架 |
| `@profile/showmasterpiece` | `showmasterpiece/` | 3003 | ShowMasterpiece 画集子应用 |

## 本地开发

```bash
pnpm dev                  # 主站 :3000
pnpm dev:calendar         # :3001
pnpm dev:teach-hub        # :3002
pnpm dev:showmasterpiece  # :3003
pnpm dev:calendar-mobile  # Expo
```

网关模式部署见 [`deploy/MIGRATION-RUNBOOK.md`](../deploy/MIGRATION-RUNBOOK.md)。

## 打包

```bash
BUILD_ANDROID=0 pnpm package:calendar      # Docker + 可选 APK
BUILD_ANDROID=0 pnpm package:teach-hub
pnpm package:showmasterpiece
```
