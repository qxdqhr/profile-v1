# @profile/calendar-core

日历业务逻辑与 UI 共享包，供 `apps/calendar`（`@profile/calendar`）消费。主站 `@profile/web` 在 ST-12 后不再直接依赖本包，通过 `/calendar` 重定向至子应用。

## 包结构

| 导出 | 说明 |
|------|------|
| `@profile/calendar-core` | 页面组件、`CalendarPageCore`、类型与工具 |
| `@profile/calendar-core/server` | 服务端查询与业务逻辑 |
| `@profile/calendar-core/api/*` | Next.js Route Handler（由 `apps/calendar` 的 `app/api/calendar` 转发） |

数据库表定义：`packages/calendar-core/src/db/schema.ts`（由 `@profile/db` 聚合引用）。

## 本地开发

```bash
# 根目录
pnpm dev:calendar    # http://localhost:3001
pnpm dev             # 主站 http://localhost:3000，/calendar 会重定向到子应用
```

主站环境变量（`apps/web`）：

| 变量 | 默认 | 说明 |
|------|------|------|
| `NEXT_PUBLIC_CALENDAR_URL` | `http://localhost:3001` | 实验田 `/calendar` 及旧路径重定向目标 |

子应用（`apps/calendar`）需配置与主站相同的 `DATABASE_URL`、认证相关密钥及根目录 `config/*.yaml`（通过 `@profile/config` 加载）。

## 部署

- **独立构建**：`pnpm --filter @profile/calendar build`
- **B 阶段**：web 对 `/calendar`、`/testField/calendar` 做重定向；API 仅由 calendar 应用提供（`/api/calendar/*`）
- **C 阶段（ST-18）**：网关反代同域 `/calendar` 与 `/api/calendar`，可不再使用跨域重定向

详细迁移步骤见 `docs/monorepo-migration/subtasks/ST-09`～`ST-12`。

更完整的功能说明见 [`src/README.md`](./src/README.md)。
