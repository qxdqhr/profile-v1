# CR — `@profile/auth`

| 项 | 内容 |
|----|------|
| 路径 | `packages/auth/` |
| 评审日期 | 2026-08-29 |
| 状态 | ✅ reviewed |

---

## 范围

- `server.ts` / `client.ts` / `session.ts` / `react.tsx` / `schema.ts`  
- 各 app `app/api/auth/[...all]/route.ts` 挂载

---

## 架构合规

| 检查项 | 结果 |
|--------|------|
| 子应用不独立登录，共享 session | ✅（网关 `/api/auth` → web） |
| API 用 `getApiSessionUser` | ✅ 约定存在；模块覆盖不齐需分模块查 |
| package exports 完整 | ⚠️ 缺 `./react` |

---

## 发现项

| ID | 严重度 | 标题 | 位置 | 建议 | 状态 |
|----|--------|------|------|------|------|
| AUTH-001 | P2 | `exports` 未声明 `./react` | `package.json` | 补 exports | open |
| AUTH-002 | P2 | `export const auth = getAuth()` 副作用 | `server.ts` | 文档化；评估懒导出 | open |
| AUTH-003 | P2 | `update-admin-password.ts` 错误 import `userSessions` | `scripts/update-admin-password.ts` | 改为 `session` | open |
| AUTH-004 | P3 | `isAdminRole` 可能在业务包重复 | showmasterpiece `lib/auth.ts` 等 | 统一用包内 helper | open |
| AUTH-005 | P3 | 个别路径直调 `sa2kit/.../auth/server` | 如 phone-signup-intent | 收敛到 `@profile/auth` | open |

---

## 优点

- 薄封装，领域逻辑在 sa2kit  
- `getApiSessionUser` + `isAdminRole` 提供统一 API 面  
- React Guard / Modals 可复用

---

## 跟进

- [ ] AUTH-001 / AUTH-003  
- [ ] 子应用 `trustedOrigins` / `publicUrl` 配置 checklist（部署侧）
