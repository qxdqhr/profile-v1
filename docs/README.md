# profile-v1 文档索引

> **单一文档根目录**：仓库级 Markdown 文档集中在 `docs/`。  
> **子项目自有文档**仍放在各 app/package 内（见下表）。  
> **旁路部署**（WordPress、`games/*` submodule）的文档留在 `deploy/wordpress/`、`deploy/games/`、`wordpress/`、`games/`，不在此合并。

## 快速入口

| 用途 | 路径 |
|------|------|
| Agent / 架构 SSOT | [`.cursor/KNOWLEDGE_BASE.md`](../.cursor/KNOWLEDGE_BASE.md)、[`AGENTS.md`](./AGENTS.md)（根目录 [`AGENTS.md`](../AGENTS.md) 为入口 stub） |
| 网关与生产部署 Runbook | [`deploy/MIGRATION-RUNBOOK.md`](../deploy/MIGRATION-RUNBOOK.md) |
| 分模块 Code Review | [`code-review/README.md`](./code-review/README.md) |
| 多端 sa2kit 蓝图 | [`code-review/libraries/BLUEPRINT-multiplatform-sa2kit.md`](./code-review/libraries/BLUEPRINT-multiplatform-sa2kit.md) |
| UI 统一计划（Phase U） | [`code-review/libraries/UI-UNIFICATION-PLAN.md`](./code-review/libraries/UI-UNIFICATION-PLAN.md) |
| Monorepo 迁移（已完成，归档） | [`monorepo-migration/README.md`](./monorepo-migration/README.md) |
| apps→web / mobile / desktop / npm 拆分计划（已确认） | [`monorepo-migration/APPS-SUBMODULE-PLAN.md`](./monorepo-migration/APPS-SUBMODULE-PLAN.md) |
| 生产配置与部署补充 | [`infrastructure/production-deployment-guide.md`](./infrastructure/production-deployment-guide.md)、[`infrastructure/config-yaml-sops.md`](./infrastructure/config-yaml-sops.md) |
| 节点笔记 | [`node-notes/README.md`](./node-notes/README.md) |
| 测试账号（脚本为准） | `pnpm devdb:createusers` / `prodb:createusers`，见 [`scripts/create-test-user-accounts.ts`](../scripts/create-test-user-accounts.ts) |

## 目录结构

```
docs/
├── README.md                 # 本索引
├── code-review/              # 全仓 CR 报告、模板、库蓝图
├── node-notes/               # 节点笔记：需求、开发、设计系统
│   ├── README.md
│   ├── 01-node-notes-需求文档.md
│   ├── DEVELOPMENT.md
│   └── design-system-MASTER.md
├── monorepo-migration/       # B→C 迁移计划（已完成，作归档）
├── infrastructure/           # OSS / CDN / HTTPS / 生产部署
├── modules/                  # 主站模块运维与需求（按模块分子目录）
│   ├── mmd/
│   ├── showmasterpiece/
│   ├── skill-manager/
│   └── ticket-monitor/
└── ticket-booking/           # 票务 MVP 规划与设计稿
```

## 子项目文档（不迁入 docs/）

| 范围 | 路径 |
|------|------|
| Web 主站模块内 | `apps/web/src/modules/<module>/`（如 `DEVELOPMENT.md`、分步构建 md） |
| Calendar / TeachHub 等子应用 | `apps/<app>/docs/`、`apps/<app>/README.md` |
| 领域 core 包 | `packages/<core>/docs/`、`packages/<core>/README.md` |
| Money Research 调研 | `apps/money-research/docs/` |
| WordPress 旁路 | `deploy/wordpress/`、`wordpress/<slug>/` |
| Godot 游戏旁路 | `deploy/games/`、`games/<slug>/` |

## 新增文档约定

1. **跨模块 / 架构 / CR** → `docs/code-review/` 或 `docs/` 对应子目录。  
2. **单模块实施记录** → 优先 `apps/web/src/modules/<name>/` 或对应 `packages/*-core/docs/`。  
3. **一次性修复记录**（已合并进代码）→ 不必新建；过时即删。  
4. 变更应用矩阵、网关、CI 时同步 [`.cursor/KNOWLEDGE_BASE.md`](../.cursor/KNOWLEDGE_BASE.md)。
