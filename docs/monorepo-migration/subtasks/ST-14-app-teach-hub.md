# ST-14 apps/teach-hub 脚手架

**任务 ID**：M-14  
**状态**：done  
**依赖**：M-13, M-04

## 目标

创建 `apps/teach-hub`，承载 teachHub 全部页面路由。

## 交付物

- [x] `apps/teach-hub/package.json`
- [x] 路由树（自 `app/(pages)/testField/(utility)/teachHub/` 迁移）：
  - `/` — 仪表盘
  - `/w/[workspaceId]/**` — 工作区子路由
- [x] `TeachHubLayout` + `WorkspaceShell` 来自 teach-hub-core
- [x] `PORT=3002`，`NEXT_DIST_DIR=.next-teach-hub`
- [x] `/api/teach-hub/*` + `/api/auth/*` + `/api/ai/*`（供本地 dev 联调；ST-15 收敛 web 侧注册）

## 验收记录（2026-06-17）

1. `pnpm --filter @profile/teach-hub build` 通过
2. 根脚本 `pnpm dev:teach-hub` / `pnpm build:teach-hub` 可用
3. `NEXT_PUBLIC_TEACH_HUB_BASE_URL=''` 时站内链接为 `/w/{id}/...`

## 后续（ST-15）

从 web 移除 teachHub AI 注册；完善入口切换（ST-16）。
