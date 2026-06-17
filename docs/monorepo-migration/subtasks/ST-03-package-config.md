# ST-03 packages/config 抽取

**任务 ID**：M-03  
**状态**：done  
**依赖**：M-01

## 目标

将 `scripts/preload-app-config.ts`、`sa2kit` 配置加载约定抽到 `@profile/config`，供各 app 在 `tsx --import` 或 Next instrumentation 中复用。

## 交付物

- [x] `packages/config/package.json`
- [x] `packages/config/src/preload.ts`（自 `scripts/preload-app-config.ts` 迁移）
- [x] `packages/config/src/apply-ai-env.ts`（自 `src/lib/config/apply-ai-env.ts` 迁入）
- [x] `packages/config/src/index.ts` 导出 `loadAppConfig` / `applyAiConfigFromYaml`
- [x] 根 `package.json` 的 `devdb:*` / `prodb:*` / `config:*` 改为 `@profile/config/preload`
- [x] `scripts/preload-app-config.ts` 保留为兼容 re-export
- [x] `src/lib/config/apply-ai-env.ts` 保留为 re-export

## 验收记录（2026-06-11）

1. `tsx --import @profile/config/preload` 可加载（需本地 `config/app.config.local.yaml` 时 `pnpm config:doctor` 才绿）
2. `packages/config` 无依赖 `apps/*`
3. 根 `package.json` 已依赖 `workspace:*` 的 `@profile/config`

## 未迁入（后续 ST）

- `src/lib/config/init.ts`、`persist-app-config.ts`、`business-config.ts` — 仍留 web，ST-04/07 再评估

## 备注

`config/app.config.*.yaml` 短期仍放仓库根 `config/`，ST-17 再讨论 per-app 配置挂载。
