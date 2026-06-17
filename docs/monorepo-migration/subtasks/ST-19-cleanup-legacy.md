# ST-19 清理遗留单体代码

**任务 ID**：M-19  
**状态**：done  
**依赖**：M-18

## 目标

删除 web 中已迁出的 calendar / teachHub 残留，收紧依赖。

## 交付物

- [x] 删除 `apps/web/src/modules/calendar`（若仍存在）— ST-12 已删
- [x] 删除 `apps/web/src/modules/teachHub` — ST-16 已删
- [x] 删除 `apps/web/src/app/api/calendar`、`api/teach-hub` — ST-12/ST-16 已删
- [x] 删除 `apps/web/src/app/.../calendar`、`.../teachHub` 重定向页面（路由改由 nginx 网关承担）
- [x] 根目录遗留 `src/` — 已删除空目录
- [x] `apps/web` 内 `grep modules/calendar|modules/teachHub` 零命中
- [x] 移除 `apps/web/tsconfig.json` 未使用的 `@profile/calendar-core` paths

## 验收标准

1. `pnpm build:all` 三应用均绿
2. 无 unused dependencies（calendar 镜像不依赖 aframe 等 web 专属包）

## 备注

- `fitnessPlan` 使用自复制精简日历 UI，不依赖 `@profile/calendar-core`。
- `apps/web/src/app/api/examples/calendar/*` 为 **演示 mock API**，非生产 calendar，保留。
- 生产入口：`/calendar`、`/teach-hub` 及 legacy 路径由 `deploy/nginx/profile-platform.conf` 反代。
