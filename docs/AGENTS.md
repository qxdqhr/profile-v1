# profile-v1 — Agent 与协作说明

## 北极星（最高优先级）

**本仓 + sa2kit + sa2kit-ui 是为后期接单多端付费项目准备的可复用弹药库。**  
通用能力（登录、OSS、UI/主题等）进库、宿主变薄；客户仓应能直接 `import` 库接入，而不是复制 profile 代码。  
执行上：北极星 > **Phase G（双库收敛）** > 各域功能优化。详见 [DOMAIN-MIGRATION-ROADMAP.md](./code-review/libraries/DOMAIN-MIGRATION-ROADMAP.md)；UI 门禁 `pnpm gate:ui`。

产品级鉴权余项见 [`architecture/AUTH-SURFACE-AUDIT.md`](./architecture/AUTH-SURFACE-AUDIT.md)；宿主身份见 [`architecture/CUSTOMER-VS-HOST.md`](./architecture/CUSTOMER-VS-HOST.md)。

## 项目知识库（自动 + 手动）

详细的路由分组、Monorepo 子应用边界、模块目录、`app/api` 与 `src/modules` 的对应关系、实验田 `experimentData.ts` 约定见：

**[`.cursor/KNOWLEDGE_BASE.md`](../.cursor/KNOWLEDGE_BASE.md)**

在本仓库打开 Agent 时，**默认已通过** `.cursor/rules/profile-v1-knowledge-ssot.mdc`（`alwaysApply: true`）用 `@.cursor/KNOWLEDGE_BASE.md` 注入该文件。若上下文被截断或需强调，可在对话中再次 `@.cursor/KNOWLEDGE_BASE.md`。

## Monorepo 应用矩阵

| 应用 | 包名 | 端口 | basePath |
|------|------|------|----------|
| 主站 | `@profile/web` | 3000 | — |
| Calendar | `@profile/calendar` | 3001 | `/calendar` |
| TeachHub | `@profile/teach-hub` | 3002 | `/teach-hub` |
| ShowMasterpiece | `@profile/showmasterpiece` | 3003 | `/showmasterpiece` |
| Calendar Mobile | `@profile/calendar-mobile` | Expo | — |
| TeachHub Mobile | `@profile/teach-hub-mobile` | Expo | — |
| WordPress（旁路） | —（非 pnpm） | 官方 PHP | `/wp/<slug>/` |
| Godot 游戏（旁路） | —（非 pnpm） | nginx 静态 | `/games/<slug>/` |

领域逻辑优先在 `sa2kit/business/*`；基建在 `host/{auth,db,config,ui}`（G6）；`node-notes` 已进 `sa2kit/business/nodeNotes`（G7）。业务 *-core **已删**。下一刀 G8。
WordPress 为同域 nginx 旁路 PHP，与 Next 子应用隔离。  
Godot 源码在 `app_games/<slug>/`，旁路见 `deploy/games/`（现网含 `miku-flick` 等；CI `export-godot-games`）。小游戏迁移为**双轨**，见 `deploy/games/GODOT-REWRITE-PLAN.md`。

## 执行命令（pnpm）

```bash
pnpm dev                    # 主站
pnpm dev:calendar
pnpm dev:teach-hub
pnpm dev:showmasterpiece
pnpm dev:calendar-mobile
pnpm build:all              # 四 Web 子应用
pnpm package:calendar       # Docker + 可选 APK
pnpm package:teach-hub
pnpm package:showmasterpiece
```

跳过 Android APK：`BUILD_ANDROID=0 pnpm package:calendar`

## Cursor 资源速查

| 资源 | 路径 |
|------|------|
| 全局简短规则 | `.cursor/rules/cursorrule.mdc` |
| 知识库自动注入 | `.cursor/rules/profile-v1-knowledge-ssot.mdc` |
| **sa2kit / sa2kit-ui / 登录样式** | `.cursor/rules/profile-v1-sa2kit-ui.mdc` |
| **sa2kit / games / WordPress submodule** | `.cursor/rules/profile-v1-submodules.mdc` |
| App Router 补充规则 | `.cursor/rules/profile-v1-routing.mdc` |
| 模块与组件补充规则 | `.cursor/rules/profile-v1-modules.mdc` |
| 工具型模块分步 Skill | `.cursor/skills/build-utility-module/SKILL.md` |
| **待定优化** | [`code-review/PENDING-OPTIMIZATION.md`](./code-review/PENDING-OPTIMIZATION.md)；用户说「优化项目」时用 `.cursor/skills/continue-optimization-backlog/SKILL.md` |
| **文档目录约定** | `.cursor/rules/profile-v1-docs.mdc`、[`docs/README.md`](./README.md) |
| Monorepo 子应用迁移（B→C，归档） | [`monorepo-migration/README.md`](./monorepo-migration/README.md) |
| 网关部署 Runbook | [`deploy/MIGRATION-RUNBOOK.md`](../deploy/MIGRATION-RUNBOOK.md) |

休闲游戏入口见主站 `/games` 与 [`deploy/games/`](../deploy/games/)。**不要**再往主站加 Phaser；新游戏走 Godot submodule，并挂 `sa2kit-godot` CJK 字体（见 `deploy/games/ADD-GAME.md`）。

## 变更文档的时机

以下变更后应同步更新 `KNOWLEDGE_BASE.md`、[`docs/README.md`](./README.md)、根 `README.md` 或 `deploy/MIGRATION-RUNBOOK.md`：

- 新增/移除 `app_web/*` 或 `packages/*`
- 网关路由、端口、CI 镜像矩阵变化
- 子应用从 `app_web/web/src/modules` 迁出或兼容层调整
