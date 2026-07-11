# profile-v1

个人站点与业务子应用的 **pnpm monorepo**：主站（实验田、Auth）、日历、TeachHub、ShowMasterpiece 等可独立构建与部署的 Next.js 子应用，以及 Calendar / TeachHub 的 React Native 客户端。

## 架构概览

```
profile-v1/
├── apps/
│   ├── web/                 # 主站 @profile/web (:3000)
│   ├── calendar/            # 日历 Web @profile/calendar (:3001)
│   ├── calendar-mobile/     # 日历 RN (Expo)
│   ├── teach-hub/           # TeachHub Web (:3002)
│   ├── teach-hub-mobile/    # TeachHub RN (Expo)
│   ├── teach-hub-desktop/   # TeachHub Electron 脚手架
│   ├── showmasterpiece/     # 画集子应用 (:3003)
│   ├── money-research/      # 副业调研 Demo 测试台 (:3004)
│   └── profile-rn-mobile/   # Profile RN Mobile (Expo + React Native)
├── packages/
│   ├── config, auth, db, ui
│   ├── calendar-core, calendar-shared
│   ├── teach-hub-core, teach-hub-shared
│   └── showmasterpiece-core
├── deploy/                  # 网关 nginx + docker-compose
└── docs/monorepo-migration/ # B→C 迁移计划
```

**生产网关**（同域）：`/` → web；`/calendar` → calendar；`/teach-hub` → teach-hub；`/showmasterpiece` → showmasterpiece；`/money-research` → money-research。Auth 统一走 web 的 `/api/auth/*`。详见 [`deploy/MIGRATION-RUNBOOK.md`](deploy/MIGRATION-RUNBOOK.md)。

## 快速开始

```bash
pnpm install
cp .env.example .env   # 配置 DATABASE_URL 等

pnpm dev               # 主站 :3000
pnpm dev:calendar      # :3001
pnpm dev:teach-hub     # :3002
pnpm dev:showmasterpiece  # :3003
pnpm dev:money-research   # :3004
pnpm dev:calendar-mobile    # Expo
pnpm dev:profile-rn-mobile  # Profile RN Mobile
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm build:all` | 构建 web / calendar / teach-hub / showmasterpiece / money-research |
| `pnpm db:generate` / `pnpm db:migrate` | Drizzle 迁移（根目录 `drizzle/`） |
| `pnpm package:calendar` | Calendar Docker + 可选 RN APK |
| `pnpm package:teach-hub` | TeachHub Docker + 可选 RN APK |
| `pnpm package:showmasterpiece` | ShowMasterpiece Docker |
| `pnpm package:money-research` | Money Research Docker |
| `pnpm build:profile-rn-mobile` | Profile RN Mobile 类型检查 |
| `pnpm build:profile-rn-mobile:android` | Profile RN Mobile Android Release APK |

本地仅打 Docker 镜像、跳过 Android APK：

```bash
BUILD_ANDROID=0 pnpm package:calendar
BUILD_ANDROID=0 pnpm package:teach-hub
pnpm package:showmasterpiece
```

RN 签名 APK 与 TeachHub 共用 `config/android-signing.env`（见 `config/android-signing.env.example`）及 GitHub Secrets `ANDROID_*`。

## 子应用文档

| 应用 | README |
|------|--------|
| 应用总览 | [`apps/README.md`](apps/README.md) |
| 共享包 | [`packages/README.md`](packages/README.md) |
| Calendar Web | [`apps/calendar/README.md`](apps/calendar/README.md) |
| Calendar Mobile | [`apps/calendar-mobile/README.md`](apps/calendar-mobile/README.md) |
| TeachHub | [`apps/teach-hub/README.md`](apps/teach-hub/README.md) |
| ShowMasterpiece | [`apps/showmasterpiece/README.md`](apps/showmasterpiece/README.md) |
| Money Research | [`apps/money-research/README.md`](apps/money-research/README.md) |
| Profile RN Mobile | [`apps/profile-rn-mobile/README.md`](apps/profile-rn-mobile/README.md) |

## Agent / 协作

- 架构 SSOT：[`.cursor/KNOWLEDGE_BASE.md`](.cursor/KNOWLEDGE_BASE.md)
- Agent 入口：[`AGENTS.md`](AGENTS.md)
- Monorepo 迁移：[`docs/monorepo-migration/README.md`](docs/monorepo-migration/README.md)

## CI 与发布

推送到 `main` 后，GitHub Actions `Build and Push Docker Images` 会构建并推送五应用镜像（web / calendar / teach-hub / showmasterpiece / money-research），同步 nginx 配置并部署网关栈。

RN 客户端独立 workflow：

- `calendar-mobile-v*` → `.github/workflows/calendar-mobile-release.yml`
- TeachHub Mobile 见 teach-hub 相关 workflow
- Profile RN Mobile 见 `.github/workflows/android-release.yml`

## 技术栈

- **Web**：Next.js App Router、Tailwind、`@profile/db`（Drizzle + PostgreSQL）、better-auth
- **Mobile**：Expo 52、React Navigation、NativeWind
- **部署**：Docker、nginx 网关、阿里云容器镜像
