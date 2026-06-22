# apps/calendar

独立日历子应用 `@profile/calendar`。

| 命令 | 说明 |
|------|------|
| `pnpm dev:calendar` | 开发服务器 `http://localhost:3001` |
| `pnpm build:calendar` | 生产构建 |
| `pnpm package:calendar` | Docker 镜像 + Calendar Mobile APK（默认 tag: local） |

API：`/api/calendar/*`、`/api/auth/*`、`/api/ai/*`（识图等）。

## 打包发布

### Web 子应用（Docker）

与 CI `docker-build-push` 对齐，本地打包：

```bash
pnpm package:calendar              # 默认 tag: local
bash scripts/calendar-docker-package.sh v1.2.3

# 仅 Docker
BUILD_ANDROID=0 pnpm package:calendar

# 仅 Android APK
BUILD_DOCKER=0 pnpm package:calendar
```

### Android APK（Calendar Mobile）

```bash
export EXPO_PUBLIC_AUTH_BASE_URL='https://your-domain.com'
export EXPO_PUBLIC_CALENDAR_API_BASE_URL='https://your-domain.com/calendar'

pnpm build:calendar-mobile:android
# 产物：apps/calendar-mobile/dist/calendar-mobile-<version>+<build>.apk
```

GitHub Actions：`.github/workflows/calendar-mobile-release.yml`（tag `calendar-mobile-v*`）

