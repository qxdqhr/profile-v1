# @profile/teach-hub-core

teachHub 业务逻辑与 UI 共享包，供 `apps/teach-hub`（`@profile/teach-hub`）消费。主站 `@profile/web` 在 ST-16 后仅通过 `/teach-hub` 重定向至子应用，不再直接依赖本包。

## 导出

| 路径 | 说明 |
|------|------|
| `@profile/teach-hub-core` | 页面组件、hooks、store、客户端 API |
| `@profile/teach-hub-core/server` | DB 服务、文件存储、AI 任务注册 |
| `@profile/teach-hub-core/api/*` | Next.js Route Handler |

数据库表定义：`packages/teach-hub-core/src/db/schema.ts`（由 `@profile/db` 聚合引用）。

AI 任务 `teach.generateLesson` 仅在 `@profile/teach-hub` 进程注册（`instrumentation.ts` → `ensureTeachHubAiTasksRegistered`）。

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `NEXT_PUBLIC_TEACH_HUB_BASE_URL` | `''`（子应用） | 子应用站内路由前缀；空字符串表示 `/w/{id}/...` |
| `NEXT_PUBLIC_TEACH_HUB_URL` | — | **web 侧**重定向目标（如 `http://localhost:3002`） |

## 构建与部署

- **子应用**：`pnpm --filter @profile/teach-hub dev`（`:3002`）/ `pnpm build:teach-hub`
- **主站入口**：访问 `https://{profile}/teach-hub` 302 至子应用 URL

## OSS

文件路径前缀 `teach-hub/{userId}/{workspaceId}/`（`TEACH_HUB_MODULE_ID`），与单体时期一致，无需迁移。
