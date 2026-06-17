# 合成大西瓜 (Suika Game) 开发计划

## 技术选型
- **渲染/物理**：Phaser 3 + Matter.js（内置物理引擎）
- **UI**：React + TailwindCSS（全屏布局）
- **图形**：纯 Canvas 绘制（RenderTexture 生成球体贴图，无外部图片）

## 游戏规则
1. 从顶部投放小球，拖动鼠标/手指控制落点
2. 相同大小的球碰撞后合并为更大一级的球
3. 球堆超过危险线保持静止 2 秒 → 游戏结束
4. 合并越大分数越高，挑战最高分

## 球体等级（11 级，颜色+大小区分）
| 等级 | 基础半径 | 颜色 | 合并得分 |
|-----|---------|------|---------|
| 1   | 18px    | 红   | 1       |
| 2   | 25px    | 橙   | 3       |
| 3   | 34px    | 黄   | 6       |
| 4   | 44px    | 浅绿 | 10      |
| 5   | 56px    | 青   | 15      |
| 6   | 70px    | 蓝   | 21      |
| 7   | 85px    | 紫   | 28      |
| 8   | 100px   | 粉   | 36      |
| 9   | 118px   | 橙红 | 45      |
| 10  | 138px   | 深红 | 55      |
| 11  | 160px   | 绿(★)| 100     |

（所有尺寸根据容器大小等比缩放）

## 响应式策略
- 容器 ref 量取 `clientWidth/clientHeight`
- `scale = min(containerW/360, containerH/640, 1.8)`
- 物理尺寸/球半径统一乘以 scale
- `ResizeObserver` 监听，防抖 150ms 重建 Phaser 实例

## 核心实现步骤
- [x] 创建规划文档
- [x] SuikaGame.tsx：
  - [x] preload：RenderTexture 生成 11 级球体贴图
  - [x] create：背景/容器/物理墙/投放器/HUD
  - [x] 碰撞事件：同级合并 → 生成上一级球 + 动画 + 加分
  - [x] update：危险线检测、投放线绘制
  - [x] 游戏结束/重开逻辑
- [x] page.tsx：全屏布局 + 等级色卡图例
- [x] experimentData.ts：注册路由

## 文件结构
```
src/
  modules/suikaGame/
    suika-plan.md        ← 本文件
    SuikaGame.tsx        ← 游戏主组件
  app/(pages)/testField/(sa2kit)/
    suikaGame/
      page.tsx           ← 页面路由
```
