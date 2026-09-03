# profile-v1 文档索引

> **单一文档根目录**：仓库级 Markdown 文档集中在 `docs/`。  
> **子项目自有文档**仍放在各 app/package 内（见下表）。  
> **旁路部署**（WordPress、`app_games/*` submodule）的文档留在 `deploy/wordpress/`、`deploy/games/`、`app_wordpress/`、`app_games/`，不在此合并。

## 快速入口

| 用途 | 路径 |
|------|------|
| 鉴权面审计 | [`architecture/AUTH-SURFACE-AUDIT.md`](./architecture/AUTH-SURFACE-AUDIT.md) |
| 客户仓 vs 验证场 | [`architecture/CUSTOMER-VS-HOST.md`](./architecture/CUSTOMER-VS-HOST.md) |
| Agent / 架构 SSOT | [`.cursor/KNOWLEDGE_BASE.md`](../.cursor/KNOWLEDGE_BASE.md)、[`AGENTS.md`](./AGENTS.md)（根目录 [`AGENTS.md`](../AGENTS.md) 为入口 stub） |
| 网关与生产部署 Runbook | [`deploy/MIGRATION-RUNBOOK.md`](../deploy/MIGRATION-RUNBOOK.md) |
| 分模块 Code Review | [`code-review/README.md`](./code-review/README.md) |
| 2026-09-02 架构审查（已落地快照） | [`code-review/2026-09-02-审查结果.md`](./code-review/2026-09-02-审查结果.md) |
| 待定优化（说「优化项目」接着做） | [`code-review/PENDING-OPTIMIZATION.md`](./code-review/PENDING-OPTIMIZATION.md) |
| 多端 sa2kit 蓝图 | [`code-review/libraries/BLUEPRINT-multiplatform-sa2kit.md`](./code-review/libraries/BLUEPRINT-multiplatform-sa2kit.md) |
| 大域新域迁移（Phase F） | [`code-review/libraries/DOMAIN-MIGRATION-ROADMAP.md`](./code-review/libraries/DOMAIN-MIGRATION-ROADMAP.md) |
| calendar / teach-hub / showmasterpiece 分域计划 | [`modules/calendar/DOMAIN-MIGRATION.md`](./modules/calendar/DOMAIN-MIGRATION.md) 等 |
| Monorepo 迁移（已完成，归档） | [`monorepo-migration/README.md`](./monorepo-migration/README.md) |
| apps→web / mobile / desktop / npm 拆分计划（已完成） | [`monorepo-migration/APPS-SUBMODULE-PLAN.md`](./monorepo-migration/APPS-SUBMODULE-PLAN.md) |
| 生产配置与部署补充 | [`infrastructure/production-deployment-guide.md`](./infrastructure/production-deployment-guide.md)、[`infrastructure/config-yaml-sops.md`](./infrastructure/config-yaml-sops.md) |
| 节点笔记 | [`node-notes/README.md`](./node-notes/README.md) |
| 测试账号（脚本为准） | `pnpm devdb:createusers` / `prodb:createusers`，见 [`scripts/create-test-user-accounts.ts`](../scripts/create-test-user-accounts.ts) |

## 目录结构

```
docs/
├── README.md                 # 本索引
├── architecture/             # 宿主边界 + 鉴权面审计
│   ├── AUTH-SURFACE-AUDIT.md
│   └── CUSTOMER-VS-HOST.md
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
| Web 主站模块内 | `app_web/web/src/modules/<module>/`（如 `DEVELOPMENT.md`、分步构建 md） |
| Calendar / TeachHub 等子应用 | `app_web/<app>/docs/`、`app_web/<app>/README.md` |
| 领域 core 包 | `packages/<core>/docs/`、`packages/<core>/README.md` |
| Money Research 调研 | `app_web/money-research/docs/` |
| WordPress 旁路 | `deploy/wordpress/`、`app_wordpress/<slug>/` |
| Godot 游戏旁路 | `deploy/games/`、`app_games/<slug>/` |

## 新增文档约定

1. **跨模块 / 架构 / CR** → `docs/code-review/` 或 `docs/` 对应子目录。  
2. **单模块实施记录** → 优先 `app_web/web/src/modules/<name>/` 或对应 `packages/*-core/docs/`。  
3. **一次性修复记录**（已合并进代码）→ 不必新建；过时即删。  
4. 变更应用矩阵、网关、CI 时同步 [`.cursor/KNOWLEDGE_BASE.md`](../.cursor/KNOWLEDGE_BASE.md)。
