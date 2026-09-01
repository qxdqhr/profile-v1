# profile-v1 本地知识库（架构与约定）

本文档为 **单一事实来源（SSOT）**，描述本仓库的 **App Router 挂载方式**、**模块目录约定** 与 **实验田注册**。

**Cursor 自动加载**：项目规则 `.cursor/rules/profile-v1-knowledge-ssot.mdc` 设为 `alwaysApply: true`，并在规则正文中使用官方支持的 `@.cursor/KNOWLEDGE_BASE.md`，在本仓库的每次 Agent 对话中把本文档纳入上下文（见 [Cursor Rules 文档](https://cursor.com/docs/rules) 中 “@include files” 的说明）。仍可在对话里手动 `@.cursor/KNOWLEDGE_BASE.md` 强化引用。根目录 `AGENTS.md` 指向此处。

---

## 0. 北极星愿景（最高优先级）

> **profile-v1 + sa2kit + sa2kit-ui = 接单多端付费项目的可复用弹药库。**

- 后期接到客户 Web/RN/小程序等项目时，应能 **直接引用** `sa2kit`（登录、OSS、配置、AI…）与 `sa2kit-ui`（主题与基础 UI），而不是从本仓拷代码。
- profile-v1 是**首个完整宿主与验证场**；通用能力默认进库，宿主只做薄 page / API / 部署。
- 决策冲突时：先保证「非 profile 宿主可接」→ 再 Phase U 统一 UI → 再业务试点 / 功能优化。

完整蓝图：[`doc/code-review/libraries/BLUEPRINT-multiplatform-sa2kit.md`](../doc/code-review/libraries/BLUEPRINT-multiplatform-sa2kit.md) §0。

---

## 1. 技术栈与命令

| 项 | 约定 |
|----|------|
| 框架 | Next.js（App Router，主站在 `apps/web/src/app`） |
| Monorepo | pnpm workspace：`apps/*` + `packages/*`；详见 `docs/monorepo-migration/`、`apps/README.md` |
| 样式 | Tailwind CSS；预设 `@profile/ui/tailwind.preset`（设计令牌桥；业务组件/主题见 §1.1） |
| 数据层 | Drizzle ORM + PostgreSQL（`@profile/db`，迁移目录 `drizzle/` 在仓库根） |
| 包管理 | **pnpm**；开发 `pnpm dev` = `pnpm --filter @profile/web dev` |
| 通用 SDK | **`sa2kit`**（登录、OSS/文件、配置、AI、UI/主题门面）；源码仓 `~/project/sa2kit` |

### 1.1 与 sa2kit / sa2kit-ui 的依赖方向（目标态）

**原则（多端 SDK）**：

- **sa2kit** = 可被 Web / RN / Taro / Electron **同时引用**的 SDK：`common`（登录、OSS、配置、AI、UI 门面…）+ **`business/<域>`（多端实现同仓：`ui/web|rn|taro` + `server` + `domain`）**
- **sa2kit-ui** = **唯一** UI 实现源（含基础件、auth 壳外观、域面板、装饰件、business 可拆件）；主题由 ThemeProvider 管理；showmasterpiece **强制动森**；后期只做新主题 + 确缺新组件
- **profile-v1** = Web + API **宿主壳**；不堆任何第二套 UI

**不作废的约定**：业务代码不新增 `animal-island-ui`；不直连 `@sa2kit-ui/*`（经 `sa2kit/common/ui*` 门面；mobile 可 link `@sa2kit-ui/rn`）；临时 UI 仅特殊需求且限期回灌。Phase U 已完成，门禁：`pnpm gate:ui`。通用能力默认进 sa2kit / sa2kit-ui（服务接单外接），festivalCard 试点与功能优化按蓝图优先级。

**已迁出的 `packages/*-core`**：默认冻结；新多端能力优先进 sa2kit（见蓝图 S1/S2/S3）。

完整蓝图与阶段计划：[`doc/code-review/libraries/BLUEPRINT-multiplatform-sa2kit.md`](../doc/code-review/libraries/BLUEPRINT-multiplatform-sa2kit.md)。

---

## 2. 路由总览（URL 不包含 Route Group 段名）

物理目录使用 **Route Group** 括号文件夹组织，**浏览器路径不出现** `(pages)`、`(utility)` 等片段。

### 2.1 主布局前缀

- 多数业务页面在：`apps/web/src/app/(pages)/...`
- 顶层另有少量路由（如 `src/app/page.tsx`、`src/app/timestamp/` 等），按具体需求放置。

### 2.2 实验田 `testField`

根路径：`/testField`（入口页面对应 `src/app/(pages)/testField/page.tsx`）。

| Route Group（磁盘路径） | 典型用途 | 路由示例 |
|-------------------------|----------|----------|
| `(utility)/` | 工具、配置页、无 Phaser 的实验功能 | `/testField/qrCode`、`/testField/ideaList` |
| `(sa2kit)/` | Phaser 小游戏、MMD/音视频相关实验 | `/testField/suikaGame` |
| `(game)/` | 另一类游戏/互动实验 | `/testField/mikutap` |
| `(cyhj)/` | 业务向模块（legacy 画集入口） | `/testField/ShowMasterPieces` → 302 至 `/showmasterpiece` |

**选择建议**

- 纯工具、表单、管理后台 → `(utility)/<segment>/page.tsx`
- Phaser 3 小游戏（见全局 Skill `profile-v1-minigame`）→ `(sa2kit)/<gameName>/page.tsx`
- 其他游戏/玩法原型 → `(game)/` 或沿用同目录下已有同类模块的分组
- 强业务、与「画集」类同形态 → `(cyhj)/`

### 2.3 路由文件写法（薄封装）

`page.tsx` **只做导入与默认导出**，业务 UI 放在 `src/modules/<模块名>/`：

```tsx
import { XxxPage } from '@/modules/xxx'

export default function XxxRoute() {
  return <XxxPage />
}
```

需要模块级副作用（如初始化）时，优先在 **layout** 统一 `import '@/modules/.../init'`；薄 `page.tsx` 仅 re-export 组件。

**已独立为子应用**（业务在 `packages/*-core`，Web 壳在 `apps/*`）：calendar、teach-hub、showmasterpiece。主站 `apps/web/src/modules/<name>/` 仅保留 **薄 re-export 或重定向**，勿再新增大段业务逻辑。

### 2.4 API 路由与模块代码的对应关系

- **实现**放在模块内：`src/modules/<module>/api/**/route.ts`
- **对外 HTTP 路径**在：`src/app/api/.../route.ts` 中 **re-export** 模块内 handlers（参考 `ideaList` → `src/app/api/ideaLists/**`）

这样保持「按功能模块聚合」，同时符合 Next.js 对 `app/api` 的位置要求。

### 2.5 `examples` 与 `testField`

- `src/app/(pages)/examples/**`：演示、联调、PoC，**不一定**进实验田列表。
- `src/app/(pages)/testField/**`：实验田导航展示的主阵地；**新实验功能若需入口卡片，必须注册实验数据**（见第 4 节）。

---

## 3. 模块（`src/modules/<name>/`）约定

### 3.1 纯工具 / 无数据库模块

完整流程见项目内 Skill：`.cursor/skills/build-utility-module/SKILL.md`（DEVELOPMENT.md → 组件 → 薄 `page.tsx` → `experimentData.ts`）。

推荐目录要点：

- `index.ts`：统一导出页面、组件、类型、工具
- `components/`、`pages/`、`types/`、`utils/` 按需
- 客户端组件文件顶部：`'use client'`

### 3.2 含数据库与 API 的模块

以 **`ideaList`** 为参考模板（**注意**：历史规则中提到的 `module/auth` 在当前仓库中不存在，以 `ideaList` 为准）：

- `db/schema.ts`、`db/*DbService.ts`
- `api/**/route.ts`（由 `src/app/api/...` 转发）
- `hooks/`、`services/`、`pages/`
- 根目录 `DEVELOPMENT.md`：分步 checklist，随开发更新
- 新表需在 `src/db/index.ts` 中挂载 schema；迁移与多环境命令以 `package.json` 脚本为准

### 3.3 公共 UI 组件

跨模块复用、且适合泛型抽象的组件 → `src/components/`。

---

## 4. 实验田数据：`experimentData.ts`

- 路径：`src/modules/testField/utils/experimentData.ts`
- 导出数组：`experiments`
- 类型：`ExperimentItem`（`src/modules/testField/types/index.ts`）
- **`category` 仅允许**：`'utility' | 'leisure'`
- **`path`**：必须与真实 `page.tsx` 对应的 URL 一致（注意大小写；Linux 部署区分大小写）
- 新增条目：在数组 **末尾** 追加一项，便于合并与审计

---

## 5. Cursor 侧资产索引

| 资产 | 路径 | 作用 |
|------|------|------|
| 全局规则 | `.cursor/rules/cursorrule.mdc` | 全项目 always-on 简短约束 |
| SSOT 自动注入 | `.cursor/rules/profile-v1-knowledge-ssot.mdc` | `alwaysApply: true` + `@.cursor/KNOWLEDGE_BASE.md`，每轮对话附带知识库 |
| 本知识库 | `.cursor/KNOWLEDGE_BASE.md` | 路由 + 模块 + 实验田 SSOT（正文由上文规则引用） |
| 工具模块 Skill | `.cursor/skills/build-utility-module/SKILL.md` | 无 DB 模块分步流程 |
| 小游戏 Skill（用户级） | `~/.cursor/skills/profile-v1-minigame/SKILL.md` | Phaser + `(sa2kit)` 流程 |
| 按路径触发的规则 | `.cursor/rules/profile-v1-routing.mdc`、`profile-v1-modules.mdc` | 编辑 `src/app` / `src/modules` 时注入上下文 |

---

## 6. 变更本知识库的时机

在发生以下情况时，应同步更新本文档（及必要时更新对应 `.mdc`）：

- 新增或合并 Route Group
- 约定「API 一律从模块 re-export」的路径命名变化
- `ExperimentItem` 类型或 `category` 枚举扩展
- 新的「标准参考模块」取代 `ideaList` 作为模板
- 新增/变更 `apps/*` 子应用、网关路由、RN 客户端或 CI 打包脚本
- 变更与 sa2kit / sa2kit-ui 的依赖方向或 UI 门面约定（同步 `doc/code-review/libraries/TARGET-ARCHITECTURE.md`）

---

## 7. Monorepo 子应用（方案 B）

### 7.1 应用与端口

| 应用 | 目录 | 包名 | dev 端口 | 网关 basePath |
|------|------|------|----------|---------------|
| 主站 | `apps/web` | `@profile/web` | 3000 | `/` |
| Calendar | `apps/calendar` | `@profile/calendar` | 3001 | `/calendar` |
| TeachHub | `apps/teach-hub` | `@profile/teach-hub` | 3002 | `/teach-hub` |
| ShowMasterpiece | `apps/showmasterpiece` | `@profile/showmasterpiece` | 3003 | `/showmasterpiece` |
| Calendar Mobile | `apps/calendar-mobile` | `@profile/calendar-mobile` | Expo | — |
| TeachHub Mobile | `apps/teach-hub-mobile` | `@profile/teach-hub-mobile` | Expo | — |
| Profile RN Mobile | `apps/profile-rn-mobile` | `@profile/profile-rn-mobile` | Expo | — |
| WordPress（旁路） | `deploy/wordpress/` | —（非 pnpm） | 官方镜像 | `/wp/<slug>/` |
| Godot 游戏（旁路） | `games/<slug>/` + `deploy/games/` | —（非 pnpm） | nginx 静态 | `/games/<slug>/` |

> WordPress 是网关旁路 PHP 服务，**不是** `apps/*` Next 子应用；多站规程见 `deploy/wordpress/ADD-SITE.md`。  
> Godot/静态游戏旁路见 `deploy/games/README.md`（现网：`/games/pulse-parade/`、`/games/flappy-wish/`）。

### 7.2 共享包

| 包 | 用途 |
|----|------|
| `@profile/config` / `@profile/auth` / `@profile/db` / `@profile/ui` | 配置、鉴权、数据库、UI 预设 |
| `@profile/calendar-core` | 日历领域（Web API 实现） |
| `@profile/calendar-shared` | 日历 RN 类型与 API 客户端 |
| `@profile/teach-hub-core` / `@profile/teach-hub-shared` | TeachHub 领域与跨端 |
| `@profile/showmasterpiece-core` | ShowMasterpiece 全量业务 |

### 7.3 子应用约定

- 页面：`apps/<app>/src/app/**/page.tsx` 薄封装，UI 从 `@profile/<app>-core` 导入。
- API：`apps/<app>/src/app/api/**/route.ts` re-export core 内 handlers；对外路径仍为 `/api/<app>/...`（经 nginx 反代）。
- Auth：子应用 **不** 单独登录；session 由 web `/api/auth/*` 共享（同域 cookie）。
- 主站兼容：legacy 实验田路径可 302/301 至子应用 URL（如 ShowMasterPieces → `/showmasterpiece`）。

### 7.4 打包与 CI

根脚本：`pnpm package:calendar` / `package:teach-hub` / `package:showmasterpiece`（见 `scripts/*-docker-package.sh`）。

- Docker 镜像：`qhr-profile-{web,calendar,teach-hub,showmasterpiece}:TAG`
- CI：`.github/workflows/docker-build-push.yml`（matrix 四应用）
- RN：`calendar-mobile-v*` tag 触发 calendar-mobile release workflow
- RN：Profile RN Mobile 见 `.github/workflows/android-release.yml`

部署细节：`deploy/MIGRATION-RUNBOOK.md`、`docs/monorepo-migration/deploy.md`。

### 7.5 旁路 WordPress（`/wp/*`）

- 路径：`/wp/holt/`（Holt 音乐作品集 + `holt-portfolio` 主题）；前台为主题，后台为 `wp-admin`。
- 资产：`deploy/wordpress/` + `deploy/docker-compose.gateway.yml` 中 `wp_mariadb` / `wordpress_*`。
- 二开/部署教程（面向 H5·iOS·鸿蒙开发者）：[`deploy/wordpress/php/README.md`](../deploy/wordpress/php/README.md)。
- nginx：每站 **两条** location——`wp-admin|wp-includes|wp-content|xmlrpc|wp-*.php` 去前缀；其余 `/wp/<slug>/` 保留 URI（固定链接 / `wp-json`）。勿逐文件加路由。
- **不**创建 `apps/blog`、不复用 Next `basePath` / Drizzle / better-auth。
- 加站：[`deploy/wordpress/ADD-SITE.md`](../deploy/wordpress/ADD-SITE.md)。

### 7.6 旁路 Godot / 静态游戏（`/games/*`）

- 源码：`games/<slug>/`（Godot 4，**非** `apps/*`）。现网：`pulse-parade`、`flappy-wish`。
- 路径：`/games/<slug>/`；compose `game_<slug>` 挂载 `deploy/games/<slug>/www/`。
- CI：改 `games/**` → `export-godot-games`（扫全部 `project.godot`，单线程 Web）→ artifact → `deploy-web` scp。
- `www/` **不进 git**；加游戏见 [`deploy/games/ADD-GAME.md`](../deploy/games/ADD-GAME.md)。
- 旧 Next/Phaser 游戏迁出后删除对应 testField **游戏** page/module；Field 非游戏工具不动。实验田卡片对 `/games/` 使用整页跳转（`ExperimentNavCard`）。
