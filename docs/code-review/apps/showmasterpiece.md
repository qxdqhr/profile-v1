# CR — ShowMasterpiece 子应用 + core

| 项 | 内容 |
|----|------|
| 应用 | `web/showmasterpiece`（:3003，basePath `/showmasterpiece`） |
| Core | `packages/showmasterpiece-core`（~24.8k 行，含 web + miniapp UI） |
| Shared | 无独立 shared 包 |
| 评审日期 | 2026-08-29 |
| 状态 | ✅ reviewed（边界重点；公开数据面需二轮） |

---

## 薄封装

- 页面 → core UI；config/history 可直接 re-export core page  
- API：子应用约 26 条 `export * from '@profile/showmasterpiece-core/api/...'`

---

## Auth 模型（有意混合）

| 面 | 行为 |
|----|------|
| GET collections / tags / categories / config | 可公开 |
| POST popup-configs/check | 公开 POST |
| 管理写 / bookings admin | `requireAdmin` |
| 用户 bookings | QQ+手机 lookup |

Helper：`packages/showmasterpiece-core/src/api/lib/auth.ts`

---

## 发现项

| ID | 严重度 | 标题 | 位置 | 建议 | 状态 |
|----|--------|------|------|------|------|
| SM-001 | **P0** | web 仍挂载全套 `/api/showmasterpiece/**` | `web/web/src/app/api/showmasterpiece/` | 生产摘除或 CI 冻结；防 drift | open |
| SM-002 | P1 | 公开 GET config 是否含敏感字段 | core `api/config` | 脱敏审计 | open |
| SM-003 | P1 | `ignoreBuildErrors: true` | next.config | CX-001 | open |
| SM-004 | P2 | web `modules/showmasterpiece` 薄 re-export 是否仍被引用 | modules/ | 无引用则删 | open |
| SM-005 | P3 | OPTIMIZATION.md 指向已不存在的 modules api | web api 目录 | 删除过时文档 | open |
| SM-006 | P3 | 实验田 + nginx 双重 302 | 可接受 | 文档说明 | open |

---

## 优点

- 业务集中在 core，子应用壳极薄  
- 公开读 + 管理写模型有 smoke 断言  
- OSS 经 yaml，无硬编码 AK（抽查）

---

## 二轮建议

- bookings 枚举与信息泄露  
- popup-configs/check 滥用（刷接口）  
- collections 缓存头与权限变更时效  
- miniapp UI 与 web 权限一致性

---

## 跟进

- [ ] SM-001（最高优先）  
- [ ] SM-002 脱敏清单  
- [ ] 二轮公开面渗透式阅读
