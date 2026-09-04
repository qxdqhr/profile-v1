# host/

Profile 仓库宿主基建（原 `packages/{auth,db,config,ui}`，Phase G6 迁出）。

| 包名 | 路径 | 职责 |
|------|------|------|
| `@profile/config` | `config/` | monorepo 根路径 / YAML 加载 / AI env 同步 |
| `@profile/auth` | `auth/` | better-auth 注入、AuthProvider 壳、session |
| `@profile/db` | `db/` | Drizzle 客户端 + schema 聚合 |
| `@profile/ui` | `ui/` | Tailwind preset |

通用能力在 `sa2kit/common/{auth,config}`；本目录只保留 profile 路径约定与 schema 聚合。  
`packages/` 共享库：**仅** `sa2kit` + `sa2kit-ui`（G8 门禁已锁）。
