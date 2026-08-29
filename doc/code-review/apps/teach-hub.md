# CR — Teach Hub 子应用 + core / shared

| 项 | 内容 |
|----|------|
| 应用 | `apps/teach-hub`（:3002，basePath `/teach-hub`） |
| Core | `packages/teach-hub-core`（~6.5k 行） |
| Shared | `packages/teach-hub-shared` |
| 评审日期 | 2026-08-29 |
| 状态 | ✅ reviewed（边界 + 风险；core 深挖待二轮） |

---

## 薄封装

- 多路由 page → core 页面；`TeachHubLayout` 含 Auth + Guest Landing  
- API：`/api/teach-hub/workspaces/**` 全部 re-export core  
- helpers：`requireUser` / `requireWorkspace`（`api/_helpers.ts`）

---

## Auth / API

- 整站 API 需 session；UI 未登录仅 Guest  
- AI 备课：`generateLessonService` **服务端** `runAiTask`（不依赖浏览器 `/api/ai`）  
- web legacy：模块与 API 已移除 ✅；nginx 301 `/testField/teachHub`

---

## 发现项

| ID | 严重度 | 标题 | 建议 | 状态 |
|----|--------|------|------|------|
| TH-001 | P1 | `ignoreBuildErrors: true` | CX-001 | open |
| TH-002 | P1 | ZIP 导入 / OSS 文件面 | 复核 path traversal、ACL、配额 | open（二轮） |
| TH-003 | P3 | `new/page.tsx` redirect 到 `/` | 产品确认书签行为 | open |
| TH-004 | P3 | core 内 subtask 文档可能过时 | 与实现对照或归档 | open |

---

## 优点

- API helper 统一，工作区级 403 清晰  
- shared 包支撑 mobile  
- Guest / 登录分流产品完整

---

## 二轮建议

- files `[...path]` 路径安全  
- generate job 状态机与取消  
- progress 写入并发

---

## 跟进

- [ ] TH-001  
- [ ] 二轮 TH-002
