# ST-10 apps/calendar 脚手架

**任务 ID**：M-10  
**状态**：done  
**依赖**：M-09, M-04

## 交付物

- [x] `apps/calendar/package.json`（`PORT=3001`，`NEXT_DIST_DIR=.next-calendar`）
- [x] `next.config.ts`、`tailwind` / `postcss`、`globals.css`
- [x] `app/page.tsx` — `CalendarPageCore`
- [x] `app/events/[id]/page.tsx` — `EventDetailPage`
- [x] 根脚本 `pnpm dev:calendar` / `pnpm build:calendar`

## 验收记录（2026-06-11）

1. `pnpm --filter @profile/calendar build`（见构建日志）
2. 无 testField / examples 路由

## 备注

`examples/calendar-demo` 留 web，ST-12 切换时处理。
