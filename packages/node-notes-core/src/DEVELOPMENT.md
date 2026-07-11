# 节点笔记模块 — 开发文档

> 模块代号：`nodeNotes`  
> 领域包：`@profile/node-notes-core`  
> 子应用：`@profile/node-notes`（端口 3005，网关 basePath `/node-notes`）  
> 主站嵌入：`/testField/nodeNotes`（薄 re-export）  
> API 前缀：`/api/node-notes/*`

## 目录结构（子应用化）

```text
packages/node-notes-core/src/     # 全部业务逻辑（页面、API、DB、组件）
apps/node-notes/app/              # 子应用薄壳（page + api re-export）
apps/web/src/modules/nodeNotes/   # 主站兼容层（仅 index.ts re-export）
apps/web/src/app/.../nodeNotes/   # 实验田薄 page.tsx
apps/web/src/app/api/node-notes/  # 主站 API 薄 re-export
```

## 环境变量

| 变量 | 作用域 | 说明 |
|------|--------|------|
| `NEXT_PUBLIC_NODE_NOTES_EMBED_PATH` | 主站 web | 默认 `/testField/nodeNotes` |
| `NEXT_PUBLIC_BASE_PATH` | 子应用 | 生产网关前缀，如 `/node-notes` |
| `NEXT_PUBLIC_TEST_FIELD_PATH` | 可选 | 列表页返回实验田链接，默认 `/testField` |

## 里程碑

- [x] M1～M5 功能 MVP
- [x] 搬迁至 `@profile/node-notes-core`
- [x] 子应用壳 `@profile/node-notes`
- [ ] `pnpm devdb:push`（需本地 PG）
- [ ] 网关 Docker / CI 矩阵（下一阶段）

## 本地验证

```bash
pnpm install
pnpm devdb:push
pnpm dev:web              # 实验田 /testField/nodeNotes
pnpm dev:node-notes       # 独立子应用 :3005
```
