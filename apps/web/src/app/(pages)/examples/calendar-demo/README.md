# Calendar Demo API Notes

> 生产日历已迁至 `apps/calendar`（`/api/calendar/*` 由网关反代）。本目录仅为 **web 内 examples 演示**，使用 mock 或 sa2kit factory，与 `@profile/calendar-core` 生产 API 无关。

This demo now supports two modes for calendar APIs:

1. Factory mode (recommended)
- Uses `sa2kit/business/calendar/routes` handlers
- Requires `DATABASE_URL` so `examples/lib/db.ts` can provide a real db

2. Mock mode (fallback)
- Uses `examples/lib/calendar-mock-db.ts`
- Enabled automatically when `DATABASE_URL` is missing

Covered endpoints:
- `GET/POST /api/calendar/events`
- `GET/PUT/DELETE /api/calendar/events/[id]`
- `DELETE /api/calendar/events/batchDelete`
- `GET/PUT /api/calendar/config`
