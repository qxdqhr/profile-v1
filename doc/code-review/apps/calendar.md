# CR — Calendar 子应用 + core / shared

| 项 | 内容 |
|----|------|
| 应用 | `apps/calendar`（:3001，basePath `/calendar`） |
| Core | `packages/calendar-core`（~12.4k 行） |
| Shared | `packages/calendar-shared`（RN/Web client） |
| 评审日期 | 2026-08-29 |
| 状态 | ✅ reviewed（边界 + 风险；core 深挖待二轮） |

---

## 薄封装

- 页面：`app/page.tsx` → `CalendarPageCore`；`events/[id]` 薄包装  
- API：`export { GET, POST } from '@profile/calendar-core/api/...'`  
- 另挂：`/api/auth/[...all]`、`/api/ai/*`（standalone / 与网关分流见 CX-006）

---

## Auth / API

- Core API：`getApiSessionUser`，未登录 401（smoke 已覆盖）  
- 生产：`/api/calendar/*` → calendar 容器；`/api/auth`、`/api/ai` → web  
- RN：`AUTH_BASE_URL` → web，业务 API → calendar；cookie 同步

---

## 发现项

| ID | 严重度 | 标题 | 建议 | 状态 |
|----|--------|------|------|------|
| CAL-001 | P1 | `ignoreBuildErrors: true` | 见 CX-001 | open |
| CAL-002 | P1 | AI 依赖根域 `/api/ai` | 文档化；禁止误改相对路径 | open |
| CAL-003 | P3 | 用户 AI Key 存 localStorage | 产品接受则文档说明风险 | open |
| CAL-004 | P3 | web `examples/calendar-demo` 易与生产混淆 | README 标注 mock | open |

**web legacy**：无 `modules/calendar`、无 web `/api/calendar` ✅

---

## 优点

- cutover 干净  
- `calendarApiPath` 尾斜杠避免 308 丢 cookie  
- shared client 支撑 mobile

---

## 二轮建议（未做）

- events CRUD 所有权与批量删除边界  
- config 接口权限  
- OSS 集成错误处理

---

## 跟进

- [ ] CAL-001 / CAL-002  
- [ ] 二轮深挖 core API
