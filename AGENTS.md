# profile-v1 — Agent 与协作说明

## 项目知识库（自动 + 手动）

详细的路由分组、模块目录、`app/api` 与 `src/modules` 的对应关系、实验田 `experimentData.ts` 约定见：

**[`.cursor/KNOWLEDGE_BASE.md`](.cursor/KNOWLEDGE_BASE.md)**

在本仓库打开 Agent 时，**默认已通过** `.cursor/rules/profile-v1-knowledge-ssot.mdc`（`alwaysApply: true`）用 `@.cursor/KNOWLEDGE_BASE.md` 注入该文件，无需依赖「系统级 Skill」或全局用户提示词。若上下文被截断或需强调，可在对话中再次 `@.cursor/KNOWLEDGE_BASE.md`。

## Cursor 资源速查

| 资源 | 路径 |
|------|------|
| 全局简短规则 | `.cursor/rules/cursorrule.mdc` |
| 知识库自动注入（每轮对话） | `.cursor/rules/profile-v1-knowledge-ssot.mdc` |
| App Router 补充规则 | `.cursor/rules/profile-v1-routing.mdc` |
| 模块与组件补充规则 | `.cursor/rules/profile-v1-modules.mdc` |
| 工具型模块分步 Skill | `.cursor/skills/build-utility-module/SKILL.md` |
| Monorepo 子应用迁移（B→C） | [`docs/monorepo-migration/README.md`](docs/monorepo-migration/README.md) |

Phaser 小游戏流程见用户级 Skill：`profile-v1-minigame`（`~/.cursor/skills/profile-v1-minigame/SKILL.md`）。

## 执行命令

以 `package.json` 为准，使用 **pnpm**。
