# ST-14 apps/teach-hub 脚手架

**任务 ID**：M-14  
**状态**：pending  
**依赖**：M-13, M-04

## 目标

创建 `apps/teach-hub`，承载 teachHub 全部页面路由。

## 交付物

- [ ] `apps/teach-hub/package.json`
- [ ] 路由树（自 `app/(pages)/testField/(utility)/teachHub/` 迁移）：
  - `/` — 仪表盘
  - `/w/[workspaceId]/**` — 工作区子路由
- [ ] `TeachHubLayout` + `WorkspaceShell` 来自 teach-hub-core
- [ ] `PORT=3002`

## 验收标准

1. `pnpm --filter @profile/teach-hub dev` 可浏览工作区列表
2. `pnpm --filter @profile/teach-hub build` 成功
3. 课时 iframe / reference HTML 链接正确（依赖 base URL 配置）

## 备注

路由深度大，建议整目录复制后批量改 import。
