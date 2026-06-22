# Calendar Mobile（RN）

`@profile/calendar-mobile` — 日历子应用的 React Native 客户端（Expo）。

与 `apps/calendar`（Web 子应用）同级，共享 `packages/calendar-shared`。

## 技术栈

- **Expo 52** + React Navigation
- **NativeWind v4**（Tailwind CSS，配色对齐 Web 端 calendar-core）
- **@react-native-cookies/cookies** — 同步 WebView HttpOnly Cookie 到 API 请求

## 目录

```
apps/calendar-mobile/
├── App.tsx
├── global.css
├── tailwind.config.js
├── metro.config.js
├── src/
│   ├── auth/
│   │   ├── AuthContext.tsx
│   │   └── cookieStore.ts
│   ├── config.ts
│   ├── screens/
│   └── components/
└── assets/
```

## 本地开发

1. 启动主站 Auth + calendar API：

   ```bash
   pnpm dev:web          # :3000（Auth API）
   pnpm dev:calendar     # :3001（Calendar API）
   ```

2. 配置环境变量：

   ```bash
   cp apps/calendar-mobile/.env.example apps/calendar-mobile/.env
   ```

   Android 模拟器请将 `localhost` 改为 `10.0.2.2`。

3. **首次运行需 Dev Client**（Cookie 原生模块在 Expo Go 中不可用）：

   ```bash
   pnpm --filter @profile/calendar-mobile android
   ```

4. 日常开发：

   ```bash
   pnpm dev:calendar-mobile
   ```

## 功能

- WebView 登录 + Cookie 会话同步（与 teach-hub-mobile 相同加固流程）
- 月视图 / 列表视图
- 事件查看、创建、编辑、删除
- 与 Web 端共用 `/api/calendar/*` 后端

## Android APK

```bash
export EXPO_PUBLIC_AUTH_BASE_URL='https://your-domain.com'
export EXPO_PUBLIC_CALENDAR_API_BASE_URL='https://your-domain.com/calendar'

pnpm build:calendar-mobile:android
# 产物：apps/calendar-mobile/dist/calendar-mobile-<version>+<build>.apk
```

### 与 Web 子应用一并打包

```bash
pnpm package:calendar              # Docker + APK
BUILD_ANDROID=0 pnpm package:calendar   # 仅 Docker
BUILD_DOCKER=0 pnpm package:calendar  # 仅 APK
```

GitHub Actions：`.github/workflows/calendar-mobile-release.yml`（tag `calendar-mobile-v*`）
