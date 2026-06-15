# ST-01 模块目录与文档脚手架

**任务 ID**：T-01  
**状态**：done  
**依赖**：无

## 目标

建立 `teachHub` 模块目录、文档体系与类型占位，为后续开发提供单一信息源。

## 交付物

- [x] `src/modules/teachHub/` 目录树
- [x] `teach-hub-plan.md`
- [x] `docs/TASKS.md`
- [x] `docs/DATA.md`
- [x] `docs/ARCHITECTURE.md`
- [x] `docs/subtasks/ST-*.md`
- [x] `types/index.ts` 类型占位
- [x] `db/schema.ts` Drizzle 表定义（待 migrate）
- [x] `index.ts` 模块导出入口
- [x] 空目录占位（services / components / pages 等）

## 目录清单

```
teachHub/
  README.md
  teach-hub-plan.md
  index.ts
  types/index.ts
  db/schema.ts
  docs/...
  services/.gitkeep
  hooks/.gitkeep
  store/.gitkeep
  components/.gitkeep
  pages/.gitkeep
  layout/.gitkeep
  utils/.gitkeep
  ai/.gitkeep
```

## 验收标准

1. 文档中 API、表名、OSS 路径三处一致
2. `types/index.ts` 与 `DATA.md` 字段对齐
3. 子任务 ST-02～ST-11 均有独立文档

## 备注

- 路由文件在 ST-04 / ST-05 创建，本任务不建 `app/` 页面
- 实验田注册见 ST-11
