# ST-19 清理遗留单体代码

**任务 ID**：M-19  
**状态**：pending  
**依赖**：M-18

## 目标

删除 web 中已迁出的 calendar / teachHub 残留，收紧依赖。

## 交付物

- [ ] 删除 `apps/web/src/modules/calendar`（若仍存在）
- [ ] 删除 `apps/web/src/modules/teachHub`
- [ ] 删除 `apps/web/src/app/api/calendar`、`api/teach-hub`
- [ ] 删除 `apps/web/src/app/.../calendar`、`.../teachHub` 页面
- [ ] 根目录遗留 `src/`（若 ST-07 未删净）
- [ ] `grep -r "modules/calendar\|modules/teachHub"` 零命中（除文档）

## 验收标准

1. `pnpm build:all` 三应用均绿
2. 无 unused dependencies（`pnpm why aframe` 不在 calendar 镜像依赖树中）

## 备注

`fitnessPlan` 若引用 calendar 组件 — 改为 `@profile/calendar-core` 或复制最小 UI。
