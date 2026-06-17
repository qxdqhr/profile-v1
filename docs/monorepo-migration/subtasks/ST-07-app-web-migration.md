# ST-07 apps/web 搬迁

**任务 ID**：M-07  
**状态**：done  
**依赖**：M-02, M-03, M-04, M-05, M-06

## 交付物

- [x] `apps/web/package.json`（`name: @profile/web`）
- [x] `src/`、`public/`、`next.config.ts`、`postcss.config.js`、`tailwind.config.ts` 迁入 `apps/web/`
- [x] 根 `package.json` scripts 委托 `pnpm --filter @profile/web`
- [x] `apps/web/tsconfig.json` + 根 `tsconfig.json` 路径更新
- [x] `packages/db` schema 路径 → `apps/web/src/modules/*`
- [x] `next.config` 读 `../../config/app.config.*.yaml`

## 验收记录（2026-06-11）

1. `pnpm --filter @profile/web build`（见 CI/本地构建日志）
2. `@/lib/auth`、`@/db` 仍在 `apps/web/src` 作 re-export，业务 import 不变
3. calendar / teachHub 模块暂留 `apps/web/src/modules/`（ST-09 / ST-13 再拆）

## 备注

根目录不再有 `src/`；脚本与 drizzle 仍从仓库根执行。
