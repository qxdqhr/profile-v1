# CR — ideaList（主站参考模块）

| 项 | 内容 |
|----|------|
| 路径 | `web/web/src/modules/ideaList/` |
| API | `web/web/src/app/api/ideaLists/**` → re-export |
| 页面 | `/testField/ideaList`（`(utility)`） |
| 评审日期 | 2026-08-29 |
| 状态 | ✅ reviewed |
| 对照 | KNOWLEDGE_BASE §2.4 / §3.2 / §4 |

---

## 1. 范围与入口

- DB：`db/schema.ts`、`ideaListDbService.ts`（已挂 `@profile/db/schema`）  
- API：lists / items / toggle / convert-to-list  
- UI：`pages/IdeaListPage.tsx` + components / hooks / services  
- 实验田：`experimentData.ts` id=`idea-list`，path=`/testField/ideaList` ✅

---

## 2. 架构合规

| 检查项 | 结果 |
|--------|------|
| 薄 page.tsx | ✅ |
| API 仅转发 | ✅ 6 条 |
| 含 DB 目录结构 | ✅ |
| DEVELOPMENT.md | ⚠️ 过时（缺 convert-to-list 等） |
| 作为模板可复制性 | ✅（修复 P0 后） |

---

## 3. 安全与数据面

| 检查项 | 结果 |
|--------|------|
| 写接口 session | ✅ 全 handler `getApiSessionUser` |
| 所有权校验 | ✅ 主 CRUD；convert 有校验但状态码不统一 |
| Drizzle 参数化 | ✅ |
| 输入校验 | ⚠️ 主 CRUD 较好；color/tags/convert name 偏弱 |

---

## 4. 发现项

| ID | 严重度 | 标题 | 位置 | 建议 | 状态 |
|----|--------|------|------|------|------|
| IL-001 | **P0** | `params` 为 Promise 却未 `await` | `api/lists/[id]/route.ts:24,113` | `const { id } = await params` | open |
| IL-002 | **P0** | toggle 同样未 await params | `api/items/[id]/toggle/route.ts:23` | 同上 | open |
| IL-003 | **P0** | DbService `userId: number` vs schema `text` / session `string` | `ideaListDbService.ts` / `schema.ts` | 统一 `string` | open |
| IL-004 | P1 | convert-to-list 无事务，先删后建可丢数据 | `convert-to-list/route.ts` | `db.transaction` | open |
| IL-005 | P1 | convert 忽略 URL `[id]`，只信 body `itemId` | 同上 | 校验路径 id == body | open |
| IL-006 | P1 | convert 越权用 401、响应格式不一致 | 同上 | 403 + `{ success }` | open |
| IL-007 | P1 | 生产路径大量 debug `console.log` | service / hooks / page | 移除或 logger | open |
| IL-008 | P2 | 排序 hook 乐观更新但无 API | hooks | 接 DbService order API 或删假逻辑 | open |
| IL-009 | P2 | `getUserIdeaLists` N+1 | DbService | join / 批量查 items | open |
| IL-010 | P2 | `Promise<any>` / `as any` | service / modals | 收紧类型 | open |
| IL-011 | P3 | ColorPicker 色集与 `ColorTheme` 不一致 | components | 单一来源 | open |
| IL-012 | P3 | 未使用的 `AuthProvider` import；batch* 死代码 | page / DbService | 清理 | open |

**对照正确写法**（同模块 items/[id] 已 await）：

```ts
const { id } = await params;
const itemId = parseInt(id);
```

---

## 5. 优点

- 模块分层清晰，适合当「含 DB 模块」范本  
- 主 CRUD 鉴权与校验完整  
- API 转发零业务逻辑  
- AuthGuard + API 双层防护  
- InferSelectModel 与 schema 绑定

---

## 6. 跟进

- [ ] IL-001 / IL-002 / IL-003（P0）  
- [ ] IL-004～IL-007（P1）  
- [ ] 刷新 DEVELOPMENT.md
