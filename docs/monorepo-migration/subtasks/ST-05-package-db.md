# ST-05 packages/db 抽取

**任务 ID**：M-05  
**状态**：done  
**依赖**：M-03

## 交付物

- [x] `packages/db/package.json`
- [x] `packages/db/src/schema/index.ts` — 聚合各模块 schema（相对路径指向 `src/modules/*`）
- [x] `packages/db/src/client.ts` ← `src/db/index.ts`
- [x] `packages/db/src/migrate.ts` ← `src/db/migrate.ts`
- [x] `drizzle.config.ts` 指向 `packages/db/src/schema/index.ts`
- [x] 根 `src/db/**` 改为 re-export `@profile/db`

## 验收记录（2026-06-11）

1. schema 仍单点维护；模块表定义暂留 `src/modules/*/db/schema`
2. `devdb:migrate` / `prodb:migrate` 指向 `packages/db/src/migrate.ts`
3. `drizzle/` 迁移目录仍在仓库根

## 后续

- ST-09 / ST-13 将 calendar / teachHub schema 文件迁入 `packages/db/src/schema/`
- 完全去除对 `src/modules` 相对路径依赖在 ST-19
