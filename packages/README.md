# packages/

本目录为 pnpm workspace 成员包。

## 已有包（迁移前即存在）

| 包名 | 路径 | 说明 |
|------|------|------|
| `@sa2kit/exam` | `sa2kit-exam/` | 考试模块 |
| `@sa2kit/feishu-bot` | `sa2kit-feishu/` | 飞书通知 |

## Monorepo 迁移将新增（见 `docs/monorepo-migration/`）

| 包名 | 路径 |
|------|------|
| `@profile/config` | `config/` | ST-03 已创建 |
| `@profile/auth` | `auth/` | ST-04 已创建 |
| `@profile/db` | `db/` | ST-05 已创建 |
| `@profile/ui` | `ui/` | ST-06 已创建 |
| `@profile/calendar-core` | `calendar-core/` | ST-09 已创建 |
| `@profile/teach-hub-core` | `teach-hub-core/` |
| `@profile/teach-hub-shared` | `teach-hub-shared/` | 跨端类型与 API 客户端 |

当前主站 Next 应用在 `apps/web/`（`@profile/web`），见 `docs/monorepo-migration/`。
