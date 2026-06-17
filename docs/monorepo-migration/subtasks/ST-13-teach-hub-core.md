# ST-13 packages/teach-hub-core 搬迁

**任务 ID**：M-13  
**状态**：pending  
**依赖**：M-05, M-07

## 目标

将 `src/modules/teachHub/**` 迁入 `@profile/teach-hub-core`。

## 交付物

- [ ] `packages/teach-hub-core/` 完整目录
- [ ] exports：`client`（pages、components、hooks、store）与 `server`（api handlers、fileStore、dbService、ai）
- [ ] `TEACH_HUB_BASE` 改为读取 `process.env.NEXT_PUBLIC_TEACH_HUB_BASE_URL`（默认 `/`）
- [ ] `htmlLinkRewriter.ts` 使用可配置 base path

## 依赖处理

| 原依赖 | 处理 |
|--------|------|
| `@/lib/auth` | `@profile/auth` |
| `sa2kit` file/OSS | dependencies |
| `@/modules/aiApi` | `@profile/ai` 或 teach-hub-core/server 注册任务 |
| skill-manager 文件持久化模式 | 保留在 teach-hub-core/utils |

## 文档迁移

- 将 `src/modules/teachHub/docs/**` 复制到 `packages/teach-hub-core/docs/` 或保留链接到 monorepo 文档

## 验收标准

1. web 通过兼容层，teachHub 全流程可用
2. teach-hub-core 不依赖 calendar-core

## 参考

现有文档：`src/modules/teachHub/docs/DATA.md`、`ARCHITECTURE.md`
