# TeachHub Mobile（RN）

`@profile/teach-hub-mobile` — TeachHub 的 React Native 客户端（Expo）。

与 `apps/teach-hub`（Web 子应用）同级，共享 `packages/teach-hub-shared`。

## 技术栈

- **Expo 52** + React Navigation
- **NativeWind v4**（Tailwind CSS，`className` 与 Web 端 twcss 对齐）
- **@react-native-cookies/cookies** — 同步 WebView HttpOnly Cookie 到 API 请求

## 目录

```
apps/teach-hub-mobile/
├── App.tsx
├── global.css                  # Tailwind 入口
├── tailwind.config.js
├── metro.config.js             # withNativeWind
├── src/
│   ├── auth/
│   │   ├── AuthContext.tsx     # 会话 + TeachHubApiClient
│   │   └── cookieStore.ts      # Cookie 同步 / 清理
│   ├── config.ts
│   ├── screens/
│   └── components/
└── assets/
```

## 本地开发

1. 启动主站 Auth + teach-hub API：

   ```bash
   pnpm dev:web          # :3000（Auth API）
   pnpm dev:teach-hub    # :3002（TeachHub API）
   ```

2. 配置环境变量：

   ```bash
   cp apps/teach-hub-mobile/.env.example apps/teach-hub-mobile/.env
   ```

   Android 模拟器请将 `localhost` 改为 `10.0.2.2`。

3. **首次运行需 Dev Client**（Cookie 原生模块在 Expo Go 中不可用）：

   ```bash
   pnpm --filter @profile/teach-hub-mobile ios
   # 或
   pnpm --filter @profile/teach-hub-mobile android
   ```

4. 日常开发：

   ```bash
   pnpm dev:teach-hub-mobile
   ```

## 鉴权流程（加固）

1. `LoginScreen` 用 WebView 打开主站（`EXPO_PUBLIC_AUTH_BASE_URL`），`sharedCookiesEnabled` 共享 Cookie
2. 导航变化 + 每 1.5 秒轮询 `completeLoginIfReady()`：
   - 通过 `CookieManager` 从原生 Cookie 容器读取（**含 HttpOnly**）
   - 合并 Auth / TeachHub 两个域的 Cookie，持久化到 AsyncStorage
   - 调用 `GET /api/auth/get-session` 校验会话
3. App 回到前台（`AppState.active`）时自动刷新会话
4. API 返回 **401** 时自动 `clearAuthCookies()` 并回到登录栈
5. 启动时若本地 Cookie 无效会自动清除

> 无 Dev Client 时会降级为 AsyncStorage 中的 Cookie 头，Android 上 HttpOnly 同步可能失效。

## 样式（NativeWind）

组件统一使用 Tailwind `className`，与 Web 端 slate/sky/emerald 配色一致。配置见 `tailwind.config.js`，类型见 `nativewind-env.d.ts`。

## 课时阅读

`LessonScreen` 通过 `TeachHubApiClient.fetchWorkspaceFileText` 拉取 HTML，再用 WebView `source={{ html }}` 渲染（与 Web 端 `srcDoc` 模式对齐）。

## 工作区能力

- **概览**：课时列表、进度徽章、Mimo 生成、速查参考
- **Mission**：编辑并保存 `MISSION.md`
- **记录**：学习记录列表、详情、可编辑保存
- **资源**：编辑 `RESOURCES.md`（Knowledge / Wisdom）

## 跨端

桌面端脚手架：`apps/teach-hub-desktop`（Electron + Vite，复用 `teach-hub-shared`）

## 打包发布

### Web 子应用（Docker）

与 CI `docker-build-push` 对齐，本地打包：

```bash
pnpm package:teach-hub              # 默认 tag: local
bash scripts/teach-hub-docker-package.sh v1.2.3
```

### Android APK（签名 release）

流程参考 `talkingTool` RN 构建：`expo prebuild` → 写入 keystore → `assembleRelease`。

**首次生成签名证书：**

```bash
bash apps/teach-hub-mobile/scripts/gen-android-keystore.sh
# 按提示把 ANDROID_KEYSTORE_* 四个值填入 GitHub Secrets
```

**本地 release 构建：**

```bash
cp config/android-signing.env.example config/android-signing.env
# 填入 ANDROID_*（与 GitHub Secrets 相同；Calendar Mobile 共用此文件）

export EXPO_PUBLIC_AUTH_BASE_URL='https://your-domain.com'
export EXPO_PUBLIC_TEACH_HUB_API_BASE_URL='https://your-domain.com/teach-hub'

pnpm build:teach-hub-mobile:android
# 产物：apps/teach-hub-mobile/dist/teach-hub-mobile-<version>+<build>.apk
```

### GitHub Actions

Workflow：`.github/workflows/teach-hub-mobile-release.yml`

| 触发方式 | 说明 |
|---------|------|
| `workflow_dispatch` | 手动打包，可填版本与 API 地址 |
| 推送 tag `teach-hub-mobile-v*` | 自动构建并创建 GitHub Release |

**Repository Variables（生产 API）：**

- `TEACH_HUB_MOBILE_AUTH_BASE_URL` — 主站 Auth 根地址
- `TEACH_HUB_MOBILE_API_BASE_URL` — TeachHub API 根地址（网关子路径）

**Secrets（Android 签名，Calendar Mobile 共用）：**

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

本地打包统一使用 `config/android-signing.env`（见 `config/android-signing.env.example`）。
