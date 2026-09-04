# packages/

本仓 **唯一** 的共享/领域库目录（pnpm workspace：`packages/*`）。  
可运行的宿主在 `app_*`；**不要**再建顶层 `npm/` 放包。

## 职责分层

| 层 | 包 | 作用 |
|----|-----|------|
| **基建** | `config` / `auth` / `db` / `ui` | 配置、登录、Drizzle、Tailwind preset（G6 消融） |
| **领域 core（过渡）** | `calendar-core` / `node-notes-core` | Phase G 清零中 |
| **外部 SDK** | `sa2kit` / `sa2kit-ui` | submodule；含 feishu / exam / teachHub / showmasterpiece 等 |

## 包一览

| 包名 | 路径 | 说明 |
|------|------|------|
| `@profile/config` | `config/` | YAML/SOPS |
| `@profile/auth` | `auth/` | better-auth 注入 |
| `@profile/db` | `db/` | DB 客户端 + schema 聚合 |
| `@profile/ui` | `ui/` | Tailwind preset |
| `@profile/calendar-core` | `calendar-core/` | 日历（G5） |
| `@profile/node-notes-core` | `node-notes-core/` | 节点笔记（G7） |
| `sa2kit` | `sa2kit/` | 多端 SDK |
| `@sa2kit-ui/*` | `sa2kit-ui/` | UI 设计系统 |

> **Phase G**：已删 `sa2kit-feishu` / `sa2kit-exam` / `teach-hub-core` / `showmasterpiece-core`。下一刀 `calendar-core`。

主站：`app_web/web/`（`@profile/web`）。
