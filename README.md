# profile-v1

个人站点与业务子应用的 **pnpm monorepo**：主站（实验田、Auth）、日历、TeachHub、ShowMasterpiece 等可独立构建与部署的 Next.js 子应用，以及 Calendar / TeachHub 的 React Native 客户端。

## 架构概览

```
profile-v1/
├── web/                     # Next.js Web 矩阵
│   ├── web/                 # 主站 @profile/web (:3000)
│   ├── calendar/            # :3001
│   ├── teach-hub/           # :3002
│   ├── showmasterpiece/     # :3003
│   ├── money-research/      # :3004
│   └── node-notes/          # :3005
├── mobile/                  # RN submodule
│   ├── calendar-mobile/
│   └── teach-hub-mobile/
├── desktop/                 # Electron submodule
│   └── teach-hub-desktop/
├── npm/                     # calendar-shared / teach-hub-shared
├── packages/                # auth, db, ui, *-core
├── deploy/                  # 网关 nginx + docker-compose
└── docs/                    # 仓库级文档（索引 docs/README.md）
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
| 应用总览 | [`web/README.md`](web/README.md) |
| 共享包 | [`packages/README.md`](packages/README.md) |
| Calendar Web | [`web/calendar/README.md`](web/calendar/README.md) |
| Calendar Mobile | [`web/calendar-mobile/README.md`](web/calendar-mobile/README.md) |
| TeachHub | [`web/teach-hub/README.md`](web/teach-hub/README.md) |
| ShowMasterpiece | [`web/showmasterpiece/README.md`](web/showmasterpiece/README.md) |
| Money Research | [`web/money-research/README.md`](web/money-research/README.md) |

## Agent / 协作

- 架构 SSOT：[`.cursor/KNOWLEDGE_BASE.md`](.cursor/KNOWLEDGE_BASE.md)
- Agent 入口：[`AGENTS.md`](AGENTS.md)（正文 [`docs/AGENTS.md`](docs/AGENTS.md)）
- 文档索引：[`docs/README.md`](docs/README.md)
- Monorepo 迁移（归档）：[`docs/monorepo-migration/README.md`](docs/monorepo-migration/README.md)

## CI 与发布

推送到 `main` 后，GitHub Actions `Build and Push Docker Images` 会构建并推送五应用镜像（web / calendar / teach-hub / showmasterpiece / money-research），同步 nginx 配置并部署网关栈。

RN 客户端独立 workflow：

- `calendar-mobile-v*` → `.github/workflows/calendar-mobile-release.yml`
- TeachHub Mobile 见 teach-hub 相关 workflow

## 技术栈

- **Web**：Next.js App Router、Tailwind、`@profile/db`（Drizzle + PostgreSQL）、better-auth
- **Mobile**：Expo 52、React Navigation、NativeWind
- **部署**：Docker、nginx 网关、阿里云容器镜像
