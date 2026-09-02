# CR — `@profile/db`

| 项 | 内容 |
|----|------|
| 路径 | `packages/db/` |
| 评审日期 | 2026-08-29 |
| 状态 | ✅ reviewed |

---

## 范围

- `src/client.ts` — postgres + drizzle 单例  
- `src/schema/index.ts` — 全仓 schema 聚合  
- `src/migrate.ts` — 迁移与基线补偿  
- 根目录 `drizzle/`、`drizzle.config.ts`

---

## 架构合规

| 检查项 | 结果 |
|--------|------|
| 作为 monorepo 唯一 DB 入口 | ✅ |
| `app_web/web/src/db` 为兼容 re-export | ✅（deprecated） |
| schema 聚合耦合度 | ⚠️ 过高（接受现状，见 CX-002） |

---

## 发现项

| ID | 严重度 | 标题 | 位置 | 建议 | 状态 |
|----|--------|------|------|------|------|
| DB-001 | P0/P1 | `sslMode` 读取后硬编码 `ssl: false` | `client.ts:25-49` | 按 sslMode 映射 ssl 选项 | open |
| DB-002 | P2 | import 即建连 | `client.ts` 顶层 | 懒连接 / 文档化副作用 | open |
| DB-003 | P2 | migrate 基线伪造 hash 跳过历史 | `migrate.ts` | 评估是否仍需要；新环境禁用 | open |
| DB-004 | P2 | `DATABASE_URL` vs YAML 双轨 | client vs migrate/drizzle-kit | 统一 preload | open |
| DB-005 | P3 | afterConnect 每连接 `console.log` | `client.ts:58` | 降级为 debug logger | open |
| DB-006 | P3 | `getDatabaseConnectionStatus` 信息面 | `client.ts` | 仅 admin 路由暴露（已基本如此） | watch |

---

## 优点

- 连接池参数有合理 clamp  
- 事务隔离级别显式设置  
- schema 一处挂载，迁移命令在根 `package.json` 可发现

---

## 跟进

- [ ] 修复 DB-001（优先）  
- [ ] 记录 migrate 基线 hack 的适用条件
