# ST-04 packages/auth 抽取

**任务 ID**：M-04  
**状态**：done  
**依赖**：M-03

## 交付物

- [x] `packages/auth/package.json`（peer: react, react-dom）
- [x] `client.ts`、`react.tsx`、`server.ts`、`session.ts`、`schema.ts`
- [x] `src/lib/auth/**` 改为 re-export `@profile/auth`
- [x] `next.config.ts` 增加 `transpilePackages: ['@profile/auth']`

## 验收记录（2026-06-11）

1. `@profile/auth` 依赖 `@profile/db` + `sa2kit`，不 import 领域包
2. 现有 `@/lib/auth` 路径保持兼容
3. `getTrustedOrigins()` 留待 ST-20

## 备注

各 app `layout.tsx` 须包裹 `AuthProvider`（ST-07 / ST-10 文档化）。
