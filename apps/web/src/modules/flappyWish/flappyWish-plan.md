# 予愿飞翔 (Flappy Wish) 开发计划

## 技术选型
- **渲染**：Phaser 3（Canvas/WebGL，手动物理，对齐原微信小游戏逻辑）
- **UI**：React + TailwindCSS 全屏布局
- **资源**：`public/flappyWish/`（从 `flappy-wish-angelina` 迁移）

## 游戏规则
1. 标题页选择 **简单 / 中等 / 困难**
2. 点按屏幕使角色上飞，穿过管道得分
3. 撞管/撞地/撞顶结束；各难度最高分分开记录（localStorage）

## 核心实现步骤
- [x] 创建规划文档
- [x] 复制资源到 `public/flappyWish/`
- [x] `FlappyWish.tsx`：标题 / 游玩 / 结算 + 三档难度
- [x] 路由 `/testField/flappyWish`
- [x] 注册 `experimentData.ts`
- [x] `pnpm` build 验证
- [x] commit + push

## 文件结构
```
apps/web/public/flappyWish/
apps/web/src/modules/flappyWish/FlappyWish.tsx
apps/web/src/modules/flappyWish/flappyWish-plan.md
apps/web/src/app/(pages)/testField/(sa2kit)/flappyWish/page.tsx
```
