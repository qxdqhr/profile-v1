# @profile/calendar-shared

Calendar 子应用跨端共享层（Web / RN / Desktop）。

- **类型**：`CalendarEvent`、`EventPriority` 等
- **API**：`CalendarApiClient`（Cookie 鉴权，对齐 `@profile/calendar` 的 `/api/calendar/*`）
- **工具**：日期格式化、`getMonthViewDates` 等（无 React / Next 依赖）

RN 客户端：`apps/calendar-mobile`
