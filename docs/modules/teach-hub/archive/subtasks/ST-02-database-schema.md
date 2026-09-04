# ST-02 数据库 Schema 与迁移

**任务 ID**：T-02  
**状态**：done  
**依赖**：ST-01

## 目标

在 Drizzle schema 中定义 `teach_workspaces`、`teach_lesson_progress`、`teach_generate_jobs`，并完成 dev 库迁移。

## 交付物

- [x] `src/modules/teachHub/db/schema.ts` 表定义（完整）
- [x] `src/db/schema/index.ts` 导出 teachHub 表
- [x] `pnpm devdb:push` 应用到 dev 库
- [x] `drizzle/0059_teach_hub.sql` 迁移文件
- [x] `services/teachHubDbService.ts` — 工作区与进度 CRUD

## 表清单

见 [DATA.md](../DATA.md) §3。

## 实现要点

1. `user_id` 与现有 `users` 表类型一致（text/uuid，对齐 auth schema）
2. `teach_lesson_progress (workspace_id, lesson_slug)` UNIQUE
3. `teach_workspaces (user_id, slug)` UNIQUE
4. `teach_generate_jobs` Phase 2 可先建表，API 后接

## 服务层

- [x] `services/teachHubDbService.ts` — 工作区与进度 CRUD

## 验收标准

1. Drizzle Studio 可见三张表
2. 插入测试 workspace 行成功
3. 外键 / 唯一约束符合 DATA.md

## 子步骤

1. 对照 `fitnessPlan/db/schema.ts` 写法
2. 编写 schema + relations（如需要）
3. 导出到根 schema index
4. 运行 generate + push
5. 写最小 repository 单测或脚本验证
