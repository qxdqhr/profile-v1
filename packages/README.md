# packages/

本仓 **唯一** 的共享/领域库目录（pnpm workspace：`packages/*`）。  
可运行的宿主在 `app_*`（Web / Mobile / Desktop / Games / WordPress）；**不要**再建顶层 `npm/` 放包。

## 职责分层

| 层 | 包 | 作用 | 谁依赖 |
|----|-----|------|--------|
| **基建** | `config` / `auth` / `db` / `ui` | 配置加载、登录薄封装、Drizzle 客户端与 schema 聚合、Tailwind preset | 各 `app_*`、领域 core |
| **领域 core** | `calendar-core` / `teach-hub-core` / `showmasterpiece-core` / `node-notes-core` | 业务逻辑、服务端 API、可选 Web UI；跨端 client-safe 走 `./shared` | 对应 Web / RN / Electron 壳 |
| **仓内扩展** | `sa2kit-exam` / `sa2kit-feishu` | 挂在本仓的 sa2kit 业务扩展（考试、飞书通知） | 主站或脚本 |
| **外部 SDK（submodule）** | `sa2kit` / `sa2kit-ui` | 独立仓 + npm 发布；本仓 `workspace:*` | 各 app / core |

## 包一览

| 包名 | 路径 | 说明 |
|------|------|------|
| `@profile/config` | `config/` | YAML/SOPS 配置 |
| `@profile/auth` | `auth/` | better-auth 注入 + React 壳 |
| `@profile/db` | `db/` | DB 客户端 + schema 聚合 |
| `@profile/ui` | `ui/` | Tailwind preset |
| `@profile/calendar-core` | `calendar-core/` | 日历；RN/客户端：`./shared` |
| `@profile/teach-hub-core` | `teach-hub-core/` | TeachHub；客户端：`./shared` |
| `@profile/showmasterpiece-core` | `showmasterpiece-core/` | 画集全量业务 |
| `@profile/node-notes-core` | `node-notes-core/` | 节点笔记 |
| `@sa2kit/exam` | `sa2kit-exam/` | 考试模块 |
| `@sa2kit/feishu-bot` | `sa2kit-feishu/` | 飞书通知 |
| `sa2kit` | `sa2kit/`（git submodule） | 多端 SDK；可独立 npm publish |
| `@sa2kit-ui/*` | `sa2kit-ui/`（git submodule） | UI 设计系统；可独立 npm publish |

## 跨端 client-safe（`./shared`）

原独立 `*-shared` 包已并入各 core 的 `src/shared/`，经 `exports` 暴露，例如：

- `@profile/calendar-core/shared`（及 `/shared/types`、`/shared/api`、…）
- `@profile/teach-hub-core/shared`（及 `/shared/types`、`/shared/api`、`/shared/routes`、…）

**禁止**再新建独立 `*-shared` 包。`./shared` 不得依赖 Next server-only 或 `@profile/db`。

## 边界

- **放这里**：可被多个 app 复用的库、领域逻辑、schema。
- **不放这里**：可独立部署的应用壳（→ `app_web` / `app_mobile` / …）、旁路源码（→ `app_games` / `app_wordpress`）、部署基建（→ `deploy/`）。
- **新多端通用能力**：优先进 **`packages/sa2kit` / `packages/sa2kit-ui`**（submodule，仍可 npm 发布），本目录 `*-core` 默认冻结扩面（见蓝图）。

主站 Next：`app_web/web/`（`@profile/web`）。
