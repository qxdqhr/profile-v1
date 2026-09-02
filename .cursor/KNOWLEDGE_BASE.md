# profile-v1 本地知识库（架构与约定）

本文档为 **单一事实来源（SSOT）**，描述本仓库的 **App Router 挂载方式**、**模块目录约定** 与 **实验田注册**。

**Cursor 自动加载**：项目规则 `.cursor/rules/profile-v1-knowledge-ssot.mdc` 设为 `alwaysApply: true`，并在规则正文中使用官方支持的 `@.cursor/KNOWLEDGE_BASE.md`，在本仓库的每次 Agent 对话中把本文档纳入上下文（见 [Cursor Rules 文档](https://cursor.com/docs/rules) 中 “@include files” 的说明）。仍可在对话里手动 `@.cursor/KNOWLEDGE_BASE.md` 强化引用。Agent 协作说明见 [`docs/AGENTS.md`](../docs/AGENTS.md)（根目录 `AGENTS.md` 为入口 stub）。

---

## 0. 北极星愿景（最高优先级）

> **profile-v1 + sa2kit + sa2kit-ui = 接单多端付费项目的可复用弹药库。**

- 后期接到客户 Web/RN/小程序等项目时，应能 **直接引用** `sa2kit`（登录、OSS、配置、AI…）与 `sa2kit-ui`（主题与基础 UI），而不是从本仓拷代码。
- profile-v1 是**首个完整宿主与验证场**；通用能力默认进库，宿主只做薄 page / API / 部署。
- 决策冲突时：先保证「非 profile 宿主可接」→ 再 Phase U 统一 UI → 再业务试点 / 功能优化。

完整蓝图：[`docs/code-review/libraries/BLUEPRINT-multiplatform-sa2kit.md`](../docs/code-review/libraries/BLUEPRINT-multiplatform-sa2kit.md) §0。

---

## 1. 技术栈与命令

| 项 | 约定 |
|----|------|
| 框架 | Next.js（App Router，主站在 `app_web/web/src/app`） |
| Monorepo | pnpm workspace：`app_web/*` + `packages/*` + `npm/*`（现空）+ `app_mobile/*` + `app_desktop/*`；详见 `docs/monorepo-migration/`、`docs/README.md`、`app_web/README.md` |
| 样式 | Tailwind CSS；预设 `@profile/ui/tailwind.preset`（设计令牌桥；业务组件/主题见 §1.1） |
| 数据层 | Drizzle ORM + PostgreSQL（`@profile/db`，迁移目录 `drizzle/` 在仓库根） |
| 包管理 | **pnpm**；开发 `pnpm dev` = `pnpm --filter @profile/web dev` |
| 通用 SDK | **`sa2kit`**（登录、OSS/文件、配置、AI、UI/主题门面）；源码仓 `~/project/sa2kit` |

### 1.1 与 sa2kit / sa2kit-ui 的依赖方向（目标态）

**原则（多端 SDK）**：

- **sa2kit-ui** = **唯一** UI 实现源（含基础件、auth 壳外观、域面板、装饰件、business 可拆件）；主题由 ThemeProvider 管理；showmasterpiece **强制动森**；后期只做新主题 + 确缺新组件
- **sa2kit** = 可被 Web / RN / Taro / Electron **同时引用**的 SDK：`common`（登录、OSS、配置、AI、**UI 门面**…）+ **`business/<域>`**；**通用能力内部**依赖 sa2kit-ui，对外只暴露 `common/ui*` 门面与 `common/auth` 组装件
- **profile-v1** = Web + API **宿主壳**；不堆任何第二套 UI；**登录只引用 sa2kit**（经 `@profile/auth` / `@/lib/auth`）

**依赖链（Web 登录示例）**：

```
app_web/web 模块
  → @/lib/auth（薄 re-export）
  → @profile/auth（注入 authClient + sa2kit-ui-bootstrap 样式）
  → sa2kit/common/auth（session / AuthGuard / LoginModal 组装）
  → sa2kit/common/ui/auth + admin（壳 UI，门面）
  → @sa2kit-ui/react（实现，仅 sa2kit 内部直连）
```

**不作废的约定**：

- 业务代码 **不新增** `animal-island-ui`
- 宿主/业务 **不直连** `@sa2kit-ui/*`（经 `sa2kit/common/ui*` 门面；RN 宿主可 link `@sa2kit-ui/rn`）
- **禁止** 在 `app_web/web/src/app/layout.tsx` 为修单个页面而全局注入全量 sa2kit-ui CSS
- Auth 相关样式由 `@profile/auth` 的 `sa2kit-ui-bootstrap` 引导；其他 sa2kit UI 路由段在 **该段 layout** 或模块 layout 引入 `import 'sa2kit/common/ui/style'`
- 临时 UI 仅特殊需求且限期回灌；门禁：`pnpm gate:ui`

详细规则：`.cursor/rules/profile-v1-sa2kit-ui.mdc`；Phase U 计划：`docs/code-review/libraries/UI-UNIFICATION-PLAN.md`。

**已迁出的 `packages/*-core`**：默认冻结；新多端能力优先进 sa2kit（见蓝图 S1/S2/S3）。

完整蓝图与阶段计划：[`docs/code-review/libraries/BLUEPRINT-multiplatform-sa2kit.md`](../docs/code-review/libraries/BLUEPRINT-multiplatform-sa2kit.md)。

---

## 2. 路由总览（URL 不包含 Route Group 段名）

物理目录使用 **Route Group** 括号文件夹组织，**浏览器路径不出现** `(pages)`、`(utility)` 等片段。

### 2.1 主布局前缀

- 多数业务页面在：`app_web/web/src/app/(pages)/...`
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
- 其他游戏/玩法原型（非 Phaser 或非 sa2kit 实验）→ `(game)/`
- 强业务、与「画集」类同形态 → `(cyhj)/`（优先考虑独立子应用，勿在主站堆第二套实现）
- **Godot / 静态旁路游戏** → 不进 testField leisure；入口走主站 `/games` + `deploy/games/`

### 2.3 路由文件写法（薄封装）

`page.tsx` **只做导入与默认导出**，业务 UI 放在 `src/modules/<模块名>/`：

```tsx
import { XxxPage } from '@/modules/xxx'

export default function XxxRoute() {
  return <XxxPage />
}
```

需要模块级副作用（如初始化）时，优先在 **layout** 统一 `import '@/modules/.../init'`；薄 `page.tsx` 仅 re-export 组件。

**已独立为子应用**（业务在 `packages/*-core`，Web 壳在 `app_web/*`）：calendar、teach-hub、showmasterpiece。主站 `app_web/web/src/modules/<name>/` 仅保留 **薄 re-export 或重定向**，勿再新增大段业务逻辑。

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
| 按路径触发的规则 | `.cursor/rules/profile-v1-routing.mdc`、`profile-v1-modules.mdc`、**`profile-v1-sa2kit-ui.mdc`**、**`profile-v1-submodules.mdc`** | 编辑 `src/app` / `src/modules` / sa2kit UI / **games·wordpress submodule** 时注入上下文 |

---

## 6. 变更本知识库的时机

在发生以下情况时，应同步更新本文档（及必要时更新对应 `.mdc`）：

- 新增或合并 Route Group
- 约定「API 一律从模块 re-export」的路径命名变化
- `ExperimentItem` 类型或 `category` 枚举扩展
- 新的「标准参考模块」取代 `ideaList` 作为模板
- 新增/变更 `app_web/*` 子应用、网关路由、RN 客户端或 CI 打包脚本
- 新增/变更 **git submodule**（`app_games/*`、`app_wordpress/*`）或 `.gitmodules`
- 变更与 sa2kit / sa2kit-ui 的依赖方向或 UI 门面约定（同步 `docs/code-review/libraries/BLUEPRINT-multiplatform-sa2kit.md`）
- 新增/迁移仓库级 Markdown 文档（同步 `docs/README.md` 索引）

---

## 7. Monorepo 子应用（方案 B）与旁路 Submodule

### 7.0 Git Submodule 旁路约定（games / WordPress）

**原则**：Godot 游戏源码、WordPress 主题等 **非 pnpm、非 Next** 的重资产，各用 **独立公开 Git 仓**，以 **git submodule** 挂入父仓；父仓只保留网关 compose/nginx、deploy 脚本、导航清单与 CI。

#### 7.0.1 双轨目录（勿混淆）

| 类型 | Submodule 源码 | 父仓旁路/基建 | 公网路径 | 清单索引 |
|------|----------------|---------------|----------|----------|
| **Godot 游戏** | `app_games/<slug>/` | `deploy/games/<slug>/`（`nginx.conf` + CI 生成的 `www/`） | `/games/<slug>/` | [`deploy/games/README.md`](../deploy/games/README.md)、[`app_games/`](../games/)（各 submodule） |
| **WordPress 主题站** | `app_wordpress/<slug>/` | `deploy/wordpress/`（compose 模板、ADD-SITE、php 教程；**全站共享，非 submodule**） | `/wp/<slug>/` | [`app_wordpress/README.md`](../app_wordpress/README.md)、[`deploy/wordpress/ADD-SITE.md`](../deploy/wordpress/ADD-SITE.md) |

- **Submodule 内**：游戏 `project.godot` / 导出工程；WP 主题 PHP/CSS/JS + 可选 `data/` 种子 JSON。
- **父仓内**：`deploy/docker-compose.gateway.yml`、`deploy/nginx/*`、冒烟脚本；主站 [`app_web/web/src/modules/games/`](../app_web/web/src/modules/games/) 小游戏大厅导航（**不是** Godot 源码）。
- **禁止**：在父仓直接长期修改 submodule 目录内容却不提交子仓；把 `deploy/wordpress/` 或 `deploy/games/<slug>/www/` 当成 submodule。

#### 7.0.2 克隆与本地开发

```bash
git clone --recurse-submodules git@github.com:qxdqhr/profile-v1.git
# 或克隆后：
git submodule update --init --recursive
```

- 更新单个子模块：`git submodule update --remote app_wordpress/holt`（或进入子目录在子仓分支开发）。
- CI（`.github/workflows/docker-build-push.yml`）checkout 使用 **`submodules: recursive`**。

#### 7.0.3 新增 Submodule 流程

| 类型 | 步骤文档 | 典型命令 |
|------|----------|----------|
| 游戏 | [`deploy/games/ADD-GAME.md`](../deploy/games/ADD-GAME.md) | `git submodule add https://github.com/qxdqhr/profile-v1-game-<slug>.git app_games/<slug>` |
| WordPress | [`deploy/wordpress/ADD-SITE.md`](../deploy/wordpress/ADD-SITE.md) | `git submodule add https://github.com/qxdqhr/profile-v1-wordpress-<slug>.git app_wordpress/<slug>` |

登记：更新 `.gitmodules`、compose/nginx、`smoke-test-gateway.sh`、主站导航（games 大厅或实验田）；子仓独立 commit/tag，父仓只 bump submodule 指针。

#### 7.0.4 CI 与生产同步

| 标志 | 路径 filter | deploy-web 行为 |
|------|-------------|-----------------|
| `GAMES_CHANGED` | `app_games/**`、export 脚本 | `export-godot-games` 生成 `www/` → scp 到服务器 `app_games/<slug>/www/`；未变更则 **保留服务器已有包** |
| `WORDPRESS_CHANGED` | `app_wordpress/**`、`.gitmodules` | scp `app_wordpress/<slug>/*` → 服务器 `/root/profile-v1/wordpress/<slug>/`；未变更则 **不覆盖** 服务器主题目录 |
| 每次 deploy | `deploy/**` | 同步 compose/nginx/脚本；含 **`deploy/wordpress/`** 文档（非主题源码） |

**首次上线 / 换机**：若服务器上 `app_wordpress/holt/` 或某游戏 `www/` 为空，需至少一次触发对应 path 变更 deploy，或手动 scp / 在服务器 `git submodule update`。

#### 7.0.5 与主站、实验田的关系

- 休闲 Godot 游戏入口：主站 **`/games`**（[`app_web/web/src/modules/games`](../app_web/web/src/modules/games/)）；实验田 **`category: utility`**，不再堆 `leisure` 游戏卡片。
- 旁路 URL（`/games/*`、`/wp/*`）在实验田卡片上须 **整页跳转**（见 `ExperimentNavCard` / `isSidecarPath`），不可走 Next `<Link>` 到不存在的 App Router 路径。
- 从 Next/Phaser **迁出**到 Godot 后：删 `app_web/web` 内旧模块与 API，**保留** `@profile/db` 中仍需要的表定义（如 `purchase-game` → `packages/db/src/schema/purchaseGame.ts`）。

### 7.1 应用与端口

| 应用 | 目录 | 包名 | dev 端口 | 网关 basePath |
|------|------|------|----------|---------------|
| 主站 | `app_web/web` | `@profile/web` | 3000 | `/` |
| Calendar | `app_web/calendar` | `@profile/calendar` | 3001 | `/calendar` |
| TeachHub | `app_web/teach-hub` | `@profile/teach-hub` | 3002 | `/teach-hub` |
| ShowMasterpiece | `app_web/showmasterpiece` | `@profile/showmasterpiece` | 3003 | `/showmasterpiece` |
| Calendar Mobile | `app_mobile/calendar-mobile`（submodule） | `@profile/calendar-mobile` | Expo | — |
| TeachHub Mobile | `app_mobile/teach-hub-mobile`（submodule） | `@profile/teach-hub-mobile` | Expo | — |
| TeachHub Desktop | `app_desktop/teach-hub-desktop`（submodule） | `@profile/teach-hub-desktop` | Vite | — |
| WordPress（旁路） | `app_wordpress/<slug>/` submodule + `deploy/wordpress/` | —（非 pnpm） | 官方镜像 | `/wp/<slug>/` |
| Godot 游戏（旁路） | `app_games/<slug>/` submodule + `deploy/games/` | —（非 pnpm） | nginx 静态 | `/games/<slug>/` |

> WordPress / Godot / Mobile **源码在 submodule**（§7.0）；旁路基建在 `deploy/`。跨端 client-safe 代码在各 `*-core` 的 `./shared` 导出。

### 7.2 共享包

| 包 | 用途 |
|----|------|
| `@profile/config` / `@profile/auth` / `@profile/db` / `@profile/ui` | 配置、鉴权、数据库、UI 预设 |
| `@profile/calendar-core` | 日历领域；RN/客户端：`@profile/calendar-core/shared` |
| `@profile/teach-hub-core` | TeachHub 领域；RN/客户端：`@profile/teach-hub-core/shared` |
| `@profile/showmasterpiece-core` | ShowMasterpiece 全量业务 |

### 7.3 子应用约定

- 页面：`app_web/<app>/src/app/**/page.tsx` 薄封装，UI 从 `@profile/<app>-core` 导入。
- API：`app_web/<app>/src/app/api/**/route.ts` re-export core 内 handlers；对外路径仍为 `/api/<app>/...`（经 nginx 反代）。
- Auth：子应用 **不** 单独登录；session 由 web `/api/auth/*` 共享（同域 cookie）。
- **AI**：浏览器 `/api/ai/*` **唯一**落点为 **web**（nginx 显式反代）；calendar / teach-hub **不**挂载 AI 路由副本。课时生成等服务端逻辑可在子应用进程内直接 `runAiTask`。
- 主站兼容：legacy 实验田路径可 302/301 至子应用 URL（如 ShowMasterPieces → `/showmasterpiece`）。
- **禁止**已迁出域在主站再挂 API 实现（例：`/api/showmasterpiece` 只存在于 showmasterpiece 子应用）。

### 7.4 打包与 CI

根脚本：`pnpm package:calendar` / `package:teach-hub` / `package:showmasterpiece`（见 `scripts/*-docker-package.sh`）。

- Docker 镜像：`qhr-profile-{web,calendar,teach-hub,showmasterpiece}:TAG`
- CI：`.github/workflows/docker-build-push.yml`（matrix 四应用）
- RN：`calendar-mobile-v*` tag 触发 calendar-mobile release workflow

部署细节：`deploy/MIGRATION-RUNBOOK.md`、`docs/monorepo-migration/deploy.md`。

### 7.5 旁路 WordPress（`/wp/*`）

- 路径：`/wp/holt/`（Holt 音乐作品集 + `holt-portfolio` 主题）；前台为主题，后台为 `wp-admin`。
- **主题源码**：git submodule [`app_wordpress/holt/`](../app_wordpress/holt/) → compose 挂载 `wp-content/themes/holt-portfolio`（§7.0）。
- **旁路基建**：[`deploy/wordpress/`](../deploy/wordpress/)（dev compose、ADD-SITE、php 教程；**非 submodule**）+ `deploy/docker-compose.gateway.yml` 中 `wp_mariadb` / `wordpress_*`。
- 二开/部署教程：[`deploy/wordpress/php/README.md`](../deploy/wordpress/php/README.md)。
- nginx：每站 **两条** location——`wp-admin|wp-includes|wp-content|xmlrpc|wp-*.php` 去前缀；其余 `/wp/<slug>/` 保留 URI（固定链接 / `wp-json`）。勿逐文件加路由。
- **不**创建 `app_web/blog`、不复用 Next `basePath` / Drizzle / better-auth。
- 加站：[`deploy/wordpress/ADD-SITE.md`](../deploy/wordpress/ADD-SITE.md)。

### 7.6 旁路 Godot / 静态游戏（`/games/*`）

- **源码**：`app_games/<slug>/`（Godot 4，**git submodule**，**非** `app_web/*`）。清单见 [`deploy/games/README.md`](../deploy/games/README.md)。
- **运行时静态包**：`deploy/games/<slug>/www/`（CI 导出，**不进 git**）；路径 `/games/<slug>/`；compose `game_<slug>` 挂载 `www/`。
- CI：改 `app_games/**` → `export-godot-games` → artifact → `deploy-web` scp（§7.0.4）。
- 加游戏：[`deploy/games/ADD-GAME.md`](../deploy/games/ADD-GAME.md)。
- **双轨迁移**（[`GODOT-REWRITE-PLAN.md`](../deploy/games/GODOT-REWRITE-PLAN.md)）：阶段 B 上线 Godot 最简时**保留** testField 原版；全部最简迁完后再逐个精修并删旧。主站 `/games` 与旁路卡片用整页跳转（`ExperimentNavCard`）。
