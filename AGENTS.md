# profile-v1 — Agent 与协作说明

## 项目知识库（自动 + 手动）

详细的路由分组、Monorepo 子应用边界、模块目录、`app/api` 与 `src/modules` 的对应关系、实验田 `experimentData.ts` 约定见：

**[`.cursor/KNOWLEDGE_BASE.md`](.cursor/KNOWLEDGE_BASE.md)**

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

领域逻辑在 `packages/*-core`；跨端类型与 API 客户端在 `packages/*-shared`。ShowMasterpiece 业务在 `@profile/showmasterpiece-core`。

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
| App Router 补充规则 | `.cursor/rules/profile-v1-routing.mdc` |
| 模块与组件补充规则 | `.cursor/rules/profile-v1-modules.mdc` |
| 工具型模块分步 Skill | `.cursor/skills/build-utility-module/SKILL.md` |
| Monorepo 子应用迁移（B→C） | [`docs/monorepo-migration/README.md`](docs/monorepo-migration/README.md) |
| 网关部署 Runbook | [`deploy/MIGRATION-RUNBOOK.md`](deploy/MIGRATION-RUNBOOK.md) |

Phaser 小游戏流程见用户级 Skill：`profile-v1-minigame`（`~/.agents/skills/profile-v1-minigame/SKILL.md`）。

## 变更文档的时机

以下变更后应同步更新 `KNOWLEDGE_BASE.md`、根 `README.md` 或 `deploy/MIGRATION-RUNBOOK.md`：

- 新增/移除 `apps/*` 或 `packages/*`
- 网关路由、端口、CI 镜像矩阵变化
- 子应用从 `apps/web/src/modules` 迁出或兼容层调整
