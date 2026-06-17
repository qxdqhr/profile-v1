# ST-18 网关、反代与路由

**任务 ID**：M-18  
**状态**：done  
**依赖**：M-17

## 目标

对外单一入口（或按子域拆分），将流量分到三 upstream。

## 交付物

- [x] Nginx 配置 `deploy/nginx/profile-platform.conf` + `proxy-params.conf`
- [x] `deploy/docker-compose.gateway.yml` + `deploy/MIGRATION-RUNBOOK.md`
- [x] 路由表（同域路径）见 deploy 文档
- [x] calendar / teach-hub `NEXT_PUBLIC_BASE_PATH` 支持
- [x] web `getCalendarAppUrl` / `getTeachHubAppUrl` 支持相对路径 `/calendar`、`/teach-hub`
- [x] CI deploy 改为 compose 网关栈
- [x] `/api/auth` 统一转发 web（cookie 全站共享）

## 路由表

| 路径前缀 | upstream |
|----------|----------|
| `/` | web:3000 |
| `/calendar` | calendar:3001 |
| `/api/calendar` | calendar:3001 |
| `/teach-hub` | teach_hub:3002 |
| `/api/teach-hub` | teach_hub:3002 |
| `/api/auth` | web:3000 |

Legacy：`/testField/calendar`、`/testField/teachHub` → 301

## 验收记录（2026-06-17）

1. 三应用 build 通过；basePath 可按 env 启用
2. nginx + compose 配置就绪；runbook 可执行迁移
3. 同域反代无跨域；auth 走 web 单点

## 后续（ST-19）

删除 web 内废弃 modules 与 API 转发层（teachHub/calendar 已在 ST-16/ST-12 完成）。

## 子域方案（ST-20）

`calendar.qhr062.top`、`teach.qhr062.top` 文档化于 PHASE-C checklist。
