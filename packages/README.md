# packages/

本仓 **共享/领域库**目录（pnpm workspace：`packages/*` + `host/*`）。  
可运行的宿主在 `app_*`；profile 基建在 `../host/`。

## 职责分层

| 层 | 位置 | 作用 |
|----|------|------|
| **宿主基建** | `../host/{config,auth,db,ui}` | 配置、登录、Drizzle、Tailwind preset（G6 已迁出 packages） |
| **外部 SDK** | `sa2kit` / `sa2kit-ui` | submodule（领域在 `sa2kit/business/*`） |

## 包一览

| 包名 | 路径 | 说明 |
|------|------|------|
| `sa2kit` | `sa2kit/` | 多端 SDK（含 `business/nodeNotes` 等） |
| `@sa2kit-ui/*` | `sa2kit-ui/` | UI 设计系统 |

> **Phase G**：业务 core 与基建四包已迁出/删除；`packages/` 目标只剩 `sa2kit` + `sa2kit-ui`。下一刀 G8 仓库门禁。

主站：`app_web/web/`（`@profile/web`）。
