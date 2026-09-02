# npm/

跨端共享包目录（供 `mobile/`、`desktop/` 与 Web 客户端消费）。

| 包 | 包名 | 说明 |
|----|------|------|
| `calendar-shared/` | `@profile/calendar-shared` | 日历 RN / 客户端类型与 API |
| `teach-hub-shared/` | `@profile/teach-hub-shared` | TeachHub 跨端类型与 API |

领域逻辑仍在 `packages/*-core`；鉴权/DB 等在 `packages/auth`、`packages/db` 等。

详见 [`docs/monorepo-migration/APPS-SUBMODULE-PLAN.md`](../docs/monorepo-migration/APPS-SUBMODULE-PLAN.md)。
