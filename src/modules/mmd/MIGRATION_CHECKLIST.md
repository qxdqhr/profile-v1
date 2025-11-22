# MMD 模块迁移检查清单

## 📋 文件迁移清单

### ✅ 需要迁移的组件

| 源文件 | 目标文件 | 状态 | 优先级 | 代码量 |
|--------|----------|------|--------|--------|
| `mikutalking/components/MikuMMDViewer.tsx` | `mmd/components/MMDViewer/MMDViewer.tsx` | ⬜ 待处理 | 🔴 P0 | ~1076行 |
| `mikutalking/components/MMDPlayer.tsx` | `mmd/components/MMDAnimationPlayer/MMDAnimationPlayer.tsx` | ⬜ 待处理 | 🔴 P0 | ~350行 |
| `mikutalking/components/CameraControl.tsx` | `mmd/components/MMDCameraControl/MMDCameraControl.tsx` | ⬜ 待处理 | 🟡 P1 | ~364行 |

### ✅ 需要创建的工具模块

| 文件路径 | 功能描述 | 来源 | 状态 | 优先级 |
|----------|----------|------|------|--------|
| `mmd/utils/texturePathResolver.ts` | 纹理路径解析 | MikuMMDViewer 提取 | ⬜ 待创建 | 🔴 P0 |
| `mmd/hooks/useMMDAnimation.ts` | 动画管理 Hook | MMDPlayer 提取 | ⬜ 待创建 | 🔴 P0 |
| `mmd/hooks/useMMDCamera.ts` | 相机控制 Hook | MikuMMDViewer 提取 | ⬜ 待创建 | 🟡 P1 |
| `mmd/hooks/useMMDLoader.ts` | 模型加载 Hook | MikuMMDViewer 提取 | ⬜ 待创建 | 🟡 P1 |

### ✅ 需要创建的类型定义

| 文件路径 | 功能描述 | 状态 | 优先级 |
|----------|----------|------|--------|
| `mmd/types/animation.ts` | 动画相关类型 | ⬜ 待创建 | 🔴 P0 |
| `mmd/types/camera.ts` | 相机相关类型 | ⬜ 待创建 | 🟡 P1 |

### ✅ 需要创建的文档

| 文件路径 | 功能描述 | 状态 | 优先级 |
|----------|----------|------|--------|
| `mmd/docs/USAGE.md` | 使用文档 | ⬜ 待创建 | 🟡 P1 |
| `mmd/docs/MIGRATION_HISTORY.md` | 迁移记录 | ⬜ 待创建 | 🟢 P2 |

---

## 🔍 组件依赖关系

```
MMDViewer (核心组件)
├── Three.js Scene 初始化
├── MMDLoader (from three-stdlib)
├── OrbitControls (from three-stdlib)
├── texturePathResolver (需提取)
└── useMMDCamera (需创建)

MMDAnimationPlayer (动画播放器)
├── MMDAnimationHelper (from three-stdlib)
├── Ammo.js (物理引擎)
├── useMMDAnimation (需创建)
└── Audio API

MMDCameraControl (相机控制)
├── useMMDCamera (需创建)
└── React Hooks (useState, useRef, useCallback, useEffect)
```

---

## 🎯 核心功能清单

### MMDViewer 组件

#### ✅ 核心功能
- [ ] Three.js 场景初始化（Scene、Camera、Renderer、Lighting）
- [ ] PMX/PMD 模型加载（使用 MMDLoader）
- [ ] 纹理加载和路径修正
- [ ] OrbitControls 相机控制
- [ ] 材质属性清理（兼容新版 Three.js）
- [ ] 模型初始状态保存和恢复
- [ ] 响应式画布大小调整

#### ✅ 需要移除的部分
- [ ] mikutalking 特定的模型路径（硬编码）
- [ ] 游戏相关的回调接口
- [ ] 特定的调试日志格式

#### ✅ 需要泛化的部分
- [ ] Props 接口（支持自定义路径）
- [ ] 纹理路径处理（提取为工具函数）
- [ ] 相机配置（支持自定义初始位置）
- [ ] 调试模式（可配置开关）

---

### MMDAnimationPlayer 组件

#### ✅ 核心功能
- [ ] VMD 动作文件加载
- [ ] VMD 相机文件加载
- [ ] 音频文件加载和同步
- [ ] MMDAnimationHelper 初始化
- [ ] Ammo.js 物理引擎集成
- [ ] 播放控制（播放/停止）
- [ ] 播放进度追踪
- [ ] 物理引擎重置机制

#### ✅ 需要移除的部分
- [ ] 硬编码的动画路径
- [ ] mikutalking 特定的回调

#### ✅ 需要增强的部分
- [ ] 支持多动画切换
- [ ] 暂停功能（可选）
- [ ] 播放速度控制
- [ ] 循环播放选项

---

### MMDCameraControl 组件

#### ✅ 核心功能
- [ ] 虚拟摇杆控制（拖拽旋转视角）
- [ ] 缩放按钮（放大/缩小）
- [ ] 升降按钮（Z 轴移动）
- [ ] 重置按钮（恢复初始状态）
- [ ] 触摸和鼠标事件支持
- [ ] 流畅的动画过渡

#### ✅ 需要泛化的部分
- [ ] 样式主题（支持自定义颜色）
- [ ] 控制位置（支持四个角落）
- [ ] 控制大小（支持多种尺寸）
- [ ] 灵敏度配置
- [ ] 按钮显示开关

---

## 📦 依赖包检查

### 已安装的依赖
- [x] `three@^0.160.0`
- [x] `three-stdlib@^2.29.4`
- [x] `mmd-parser@^1.0.4`
- [x] `@types/three@^0.160.0`

### 需要安装的依赖
- [ ] `ammo.js@^0.0.10` (物理引擎)
- [ ] `@types/ammo.js` (类型定义，如果有)

### 安装命令
```bash
pnpm add ammo.js
pnpm add -D @types/ammo.js
```

---

## 🚀 快速开始步骤

### Step 1: 创建迁移分支
```bash
git checkout -b feature/mmd-module-migration
```

### Step 2: 创建目录结构
```bash
cd src/modules/mmd

# 创建组件目录
mkdir -p components/MMDViewer
mkdir -p components/MMDAnimationPlayer
mkdir -p components/MMDCameraControl

# 创建 Hooks 目录
mkdir -p hooks

# 创建文档目录
mkdir -p docs

# 创建索引文件
touch components/MMDViewer/index.ts
touch components/MMDAnimationPlayer/index.ts
touch components/MMDCameraControl/index.ts
```

### Step 3: 安装依赖
```bash
pnpm add ammo.js
```

### Step 4: 开始迁移
按照优先级顺序：
1. 先迁移 MMDViewer (P0)
2. 再迁移 MMDAnimationPlayer (P0)
3. 最后迁移 MMDCameraControl (P1)

---

## 📝 迁移进度追踪

### 第一周 (第1-5天)
- [ ] Day 1: 环境准备 + 依赖安装
- [ ] Day 2-3: 迁移 MMDViewer 组件
- [ ] Day 4-5: 迁移 MMDAnimationPlayer 组件

### 第二周 (第6-10天)
- [ ] Day 6: 迁移 MMDCameraControl 组件
- [ ] Day 7-8: 创建 Hooks 和工具函数
- [ ] Day 9: 创建类型定义
- [ ] Day 10: 更新模块入口和导出

### 第三周 (第11-15天)
- [ ] Day 11-12: 编写文档
- [ ] Day 13-14: 集成测试
- [ ] Day 15: 代码审查和优化

---

## ✅ 完成标准

### 代码质量
- [ ] 所有 TypeScript 类型检查通过
- [ ] 没有 ESLint 错误
- [ ] 代码格式化（Prettier）
- [ ] 移除所有 console.log（保留 debug 工具）

### 功能完整性
- [ ] 所有核心功能正常工作
- [ ] 性能测试通过
- [ ] 内存泄漏检查通过
- [ ] 浏览器兼容性测试通过

### 文档完整性
- [ ] 所有 Props 都有 JSDoc 注释
- [ ] USAGE.md 文档完成
- [ ] 示例代码可运行
- [ ] README.md 更新

### 测试
- [ ] 在 MMDViewerPage 中测试通过
- [ ] 在 mikutalking 中使用新模块测试通过
- [ ] 桌面端测试通过
- [ ] 移动端测试通过

---

## 🔄 后续优化

### 性能优化
- [ ] 模型 LOD (Level of Detail)
- [ ] 纹理压缩
- [ ] 动画缓存
- [ ] WebWorker 卸载计算

### 功能增强
- [ ] 支持多模型同时显示
- [ ] 场景保存和加载
- [ ] 背景和环境设置
- [ ] 截图和录制功能

### 开发体验
- [ ] Storybook 组件文档
- [ ] 单元测试
- [ ] E2E 测试
- [ ] 性能监控

---

## 📊 代码统计

| 类别 | 文件数 | 代码行数 | 备注 |
|------|--------|----------|------|
| 组件 | 3 | ~1790行 | MikuMMDViewer + MMDPlayer + CameraControl |
| Hooks | 4 | ~800行 (预估) | useMMDAnimation + useMMDCamera + useMMDLoader |
| 工具函数 | 1 | ~150行 (预估) | texturePathResolver |
| 类型定义 | 2 | ~200行 (预估) | animation + camera types |
| 文档 | 2 | N/A | USAGE + MIGRATION_HISTORY |
| **总计** | **12** | **~2940行** | |

---

**进度更新日期:** 2025-XX-XX  
**完成度:** 0% (待开始)

---

## 📞 问题反馈

如遇到问题，请记录以下信息：
1. 问题描述
2. 复现步骤
3. 错误信息
4. 浏览器版本
5. 系统版本


