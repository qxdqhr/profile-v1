# ST-13 packages/teach-hub-core 搬迁

**任务 ID**：M-13  
**状态**：done  
**依赖**：M-05, M-07

## 目标

将 `src/modules/teachHub/**` 迁入 `@profile/teach-hub-core`。

## 交付物

- [x] `packages/teach-hub-core/` 完整目录
- [x] exports：`client`（pages、components、hooks、store）与 `server`（api handlers、fileStore、dbService、ai）
- [x] `TEACH_HUB_BASE` 改为读取 `process.env.NEXT_PUBLIC_TEACH_HUB_BASE_URL`（默认 `/testField/teachHub`）
- [x] `htmlLinkRewriter.ts` 使用可配置 base path

## 依赖处理

| 原依赖 | 处理 |
|--------|------|
| `@/lib/auth` | `@profile/auth/react`（客户端）/ `@profile/auth/session`（API） |
| `sa2kit` file/OSS | `integrations/ossFile.ts` + sa2kit |
| `@/modules/aiApi` | `ai/generateLessonTask.ts` 直接注册 sa2kit 任务 |
| skill-manager 文件持久化模式 | 保留在 teach-hub-core/utils |

## 文档迁移

- 模块文档位于 `packages/teach-hub-core/docs/` 与 `src/docs/`

## 验收记录（2026-06-17）

1. `@/modules/teachHub` 兼容层 re-export `@profile/teach-hub-core`，web 全流程可用
2. `pnpm --filter @profile/web build` 通过
3. teach-hub-core 不依赖 calendar-core
4. `@profile/db` schema 改引 `teach-hub-core/src/db/schema`

## 后续（ST-14）

创建 `apps/teach-hub` 独立 Next 应用。
