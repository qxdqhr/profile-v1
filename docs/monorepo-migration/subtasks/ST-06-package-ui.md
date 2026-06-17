# ST-06 packages/ui 与 Tailwind 共享

**任务 ID**：M-06  
**状态**：done  
**依赖**：M-01

## 交付物

- [x] `packages/ui/package.json`
- [x] `packages/ui/tailwind.preset.ts`（theme、colors、animate）
- [x] `packages/ui/postcss.config.js`
- [x] 根 `tailwind.config.ts`：`presets: [@profile/ui/tailwind.preset]`，content 留根应用

## 验收记录（2026-06-11）

1. 主题 token 与迁移前一致（从根 config 抽出）
2. `components/ui/*` 未搬迁（非本 ST 必须）

## 备注

子应用 ST-10 / ST-14 创建时复用同一 preset。
