# ST-08 根脚本与 CI（web 阶段）

**任务 ID**：M-08  
**状态**：done  
**依赖**：M-07

## 交付物

- [x] 根 `package.json` 聚合脚本委托 `@profile/web`
- [x] `dockerfile`：monorepo 安装 + `pnpm --filter @profile/web build` + standalone 路径 `apps/web/server.js`
- [x] `components.json` 路径指向 `apps/web`
- [x] 根脚本中 `src/` 引用已更新为 `@profile/*` 或 `apps/web/src`

## 验收记录（2026-06-11）

1. Docker 构建上下文仍为仓库根（`.github/workflows` 未改 build 命令）
2. `devdb:*` / `prodb:*` 仍在根执行

## 待办（ST-17）

- `.github/workflows/docker-build-push.yml` 注释补充 monorepo 说明（可选）
- `KNOWLEDGE_BASE.md` monorepo 一节（本 ST 简要更新）
