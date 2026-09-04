# 节点笔记模块 — 开发文档

> 模块代号：`nodeNotes`  
> 领域：`sa2kit/business/nodeNotes`（G7）  
> 子应用：`@profile/node-notes`（端口 3005，网关 basePath `/node-notes`）  
> 主站嵌入：`/testField/nodeNotes`（薄 re-export）  
> API 前缀：`/api/node-notes/*`

## 目录结构（子应用化）

```text
packages/sa2kit/src/business/nodeNotes/   # domain / server / routes / ui/web
app_web/node-notes/app/                   # 薄 page + API handlers
app_web/node-notes/lib/                   # Auth 壳 + hostRouteConfig
app_web/web/src/app/.../nodeNotes/        # 实验田薄 page.tsx
```

## 环境变量

| 变量 | 作用域 | 说明 |
|------|--------|------|
| `NEXT_PUBLIC_NODE_NOTES_EMBED_PATH` | 主站 web | 默认 `/testField/nodeNotes` |
| `NEXT_PUBLIC_BASE_PATH` | 子应用 | 生产网关前缀，如 `/node-notes` |
| `NEXT_PUBLIC_TEST_FIELD_PATH` | 可选 | 列表页返回实验田链接，默认 `/testField` |

## 里程碑

- [x] M1～M5 功能 MVP
- [x] 搬迁至 `@profile/node-notes-core`（历史）
- [x] G7：迁入 `sa2kit/business/nodeNotes`；删 core 包
- [x] 子应用壳 `@profile/node-notes`
- [ ] `pnpm devdb:push`（需本地 PG）
- [ ] 网关 Docker / CI 矩阵（下一阶段）

## 本地验证

```bash
pnpm install
pnpm --filter sa2kit build:business
pnpm --filter @profile/node-notes exec tsc --noEmit
pnpm dev:node-notes
```
