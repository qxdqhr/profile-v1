# 🚀 SA2Kit 快速开始指南

## 📚 项目概述

**SA2Kit** (Super Anime 2D/3D Kit) 是一个基于 Three.js 的通用 MMD 模型展示和动画播放库，从 profile-v1 项目的 mikutalking 模块中提取核心功能，打造成独立的、可复用的 npm 包。

---

## 🎯 核心目标

### ✅ 主要功能
- PMX/PMD 模型加载和渲染
- VMD 动画播放和控制
- 物理引擎支持（Ammo.js）
- 相机控制（虚拟摇杆 + 按钮）
- 纹理智能映射
- 音频同步播放

### ✅ 技术特点
- TypeScript 完整类型定义
- React 组件封装
- Tree-shakable（按需导入）
- 零业务逻辑耦合
- 完整文档和示例

---

## 📦 项目结构

```
sa2kit/
├── package.json              # npm 包配置
├── tsconfig.json             # TypeScript 配置
├── tsup.config.ts            # 构建配置（使用 tsup）
├── README.md                 # 项目说明
├── LICENSE                   # MIT 许可证
├── CONTRIBUTING.md           # 贡献指南
├── MIGRATION_FROM_PROFILE.md # 迁移计划
├── QUICK_START.md            # 快速开始（本文档）
│
├── src/                      # 源代码
│   ├── index.ts              # 主入口
│   ├── components/           # React 组件
│   │   ├── MMDViewer/
│   │   ├── MMDAnimationPlayer/
│   │   └── MMDCameraControl/
│   ├── hooks/                # React Hooks
│   ├── utils/                # 工具函数
│   ├── types/                # TypeScript 类型
│   └── constants/            # 常量配置
│
├── examples/                 # 示例项目
├── docs/                     # 文档
└── tests/                    # 测试
```

---

## 🗺️ 迁移映射

### 从 Profile-V1 迁移的核心文件

| 源文件 (profile-v1) | 目标文件 (sa2kit) | 功能 | 优先级 |
|---------------------|-------------------|------|--------|
| `mikutalking/components/MikuMMDViewer.tsx` | `src/components/MMDViewer/MMDViewer.tsx` | 核心 3D 渲染组件 | 🔴 P0 |
| `mikutalking/components/MMDPlayer.tsx` | `src/components/MMDAnimationPlayer/MMDAnimationPlayer.tsx` | 动画播放组件 | 🔴 P0 |
| `mikutalking/components/CameraControl.tsx` | `src/components/MMDCameraControl/MMDCameraControl.tsx` | 相机控制 UI | 🟡 P1 |
| `modules/mmd/utils/*` | `src/utils/*` | 工具函数 | 🟢 P2 |

---

## 🚀 开始迁移（3 步走）

### Step 1: 初始化项目（30 分钟）

```bash
# 1. 进入项目目录（sa2kit 已在 profile-v1 目录下）
cd /Users/qihongrui/Desktop/profile-v1/sa2kit

# 2. 初始化 Git（如果需要）
git init
git add .
git commit -m "chore: initialize sa2kit project"

# 3. 安装依赖
pnpm install

# 4. 创建源代码目录结构
mkdir -p src/components/MMDViewer
mkdir -p src/components/MMDAnimationPlayer
mkdir -p src/components/MMDCameraControl
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/types
mkdir -p src/constants

# 5. 创建其他目录
mkdir -p examples docs tests
```

---

### Step 2: 迁移核心组件（按优先级）

#### 2.1 迁移 MMDViewer（最高优先级）

```bash
# 复制源文件
cp ../src/app/\(pages\)/gameField/mikutalking/components/MikuMMDViewer.tsx \
   src/components/MMDViewer/MMDViewer.tsx

# 创建类型文件
touch src/components/MMDViewer/types.ts
touch src/components/MMDViewer/index.ts
```

**需要修改的部分：**
1. 移除 mikutalking 特定的硬编码路径
2. 提取 `fixTexturePath` 函数 → `src/utils/texturePathResolver.ts`
3. 泛化 Props 接口（接受动态路径）
4. 添加默认配置
5. 添加完整的 JSDoc 注释

---

#### 2.2 迁移 MMDAnimationPlayer

```bash
# 复制源文件
cp ../src/app/\(pages\)/gameField/mikutalking/components/MMDPlayer.tsx \
   src/components/MMDAnimationPlayer/MMDAnimationPlayer.tsx

# 创建相关文件
touch src/components/MMDAnimationPlayer/types.ts
touch src/components/MMDAnimationPlayer/index.ts
touch src/hooks/useMMDAnimation.ts
```

**需要修改的部分：**
1. 移除硬编码的动画路径
2. 提取动画控制逻辑 → `src/hooks/useMMDAnimation.ts`
3. 支持动画列表切换
4. 抽象音频播放为可选功能

---

#### 2.3 迁移 MMDCameraControl

```bash
# 复制源文件
cp ../src/app/\(pages\)/gameField/mikutalking/components/CameraControl.tsx \
   src/components/MMDCameraControl/MMDCameraControl.tsx

# 创建相关文件
touch src/components/MMDCameraControl/types.ts
touch src/components/MMDCameraControl/index.ts
touch src/hooks/useMMDCamera.ts
```

**需要修改的部分：**
1. 提取样式为可配置主题
2. 添加位置、大小、主题配置
3. 提取相机控制逻辑 → `src/hooks/useMMDCamera.ts`

---

### Step 3: 创建主入口和构建

#### 3.1 创建主入口文件

```typescript
// src/index.ts

// ===== 组件导出 =====
export { MMDViewer } from './components/MMDViewer'
export { MMDAnimationPlayer } from './components/MMDAnimationPlayer'
export { MMDCameraControl } from './components/MMDCameraControl'

// ===== Hooks 导出 =====
export { useMMDAnimation } from './hooks/useMMDAnimation'
export { useMMDCamera } from './hooks/useMMDCamera'
export { useMMDLoader } from './hooks/useMMDLoader'

// ===== 工具函数导出 =====
export { resolveTexturePath } from './utils/texturePathResolver'

// ===== 类型导出 =====
export type * from './types'

// ===== 版本信息 =====
export const VERSION = '1.0.0'
```

#### 3.2 构建项目

```bash
# 开发模式（监听文件变化）
pnpm dev

# 生产构建
pnpm build

# 构建后会生成 dist/ 目录：
# - dist/index.js       (CommonJS)
# - dist/index.esm.js   (ES Module)
# - dist/index.d.ts     (TypeScript 类型)
```

---

## 📋 完整迁移清单

### 准备阶段 ✅
- [x] 创建 sa2kit 项目结构
- [x] 配置 package.json
- [x] 配置 TypeScript
- [x] 配置构建工具（tsup）
- [x] 配置 ESLint 和 Prettier
- [x] 创建 README.md
- [x] 创建 LICENSE
- [x] 创建 .gitignore

### 组件迁移
- [ ] 迁移 MMDViewer 组件
- [ ] 迁移 MMDAnimationPlayer 组件
- [ ] 迁移 MMDCameraControl 组件

### Hooks 创建
- [ ] 创建 useMMDAnimation
- [ ] 创建 useMMDCamera
- [ ] 创建 useMMDLoader

### 工具函数
- [ ] 创建 texturePathResolver
- [ ] 迁移 sceneUtils
- [ ] 迁移 mmdModelBuilder

### 类型定义
- [ ] 创建 types/viewer.ts
- [ ] 创建 types/animation.ts
- [ ] 创建 types/camera.ts
- [ ] 创建 types/index.ts

### 常量配置
- [ ] 创建 constants/defaults.ts

### 文档
- [ ] 编写 API.md
- [ ] 编写 GUIDE.md
- [ ] 编写 FAQ.md

### 示例
- [ ] 创建 basic-viewer 示例
- [ ] 创建 animation-player 示例
- [ ] 创建 camera-control 示例
- [ ] 创建 full-app 示例

### 测试
- [ ] 编写组件测试
- [ ] 编写 Hooks 测试
- [ ] 编写工具函数测试

---

## 🎯 核心 API 设计

### MMDViewer 组件

```typescript
<MMDViewer
  // 必需
  modelPath="/models/miku.pmx"
  
  // 可选 - 场景配置
  backgroundColor="#1a1a2e"
  enableShadows={false}
  
  // 可选 - 相机配置
  cameraPosition={[0, 25, 25]}
  cameraTarget={[0, 8, 0]}
  enableCameraControls={true}
  
  // 可选 - 调试
  debugMode={false}
  
  // 回调
  onLoad={(model) => console.log('模型加载完成', model)}
  onError={(error) => console.error('加载失败', error)}
  onCameraReady={(controls) => {
    // 获取相机控制方法
  }}
/>
```

### MMDAnimationPlayer 组件

```typescript
<MMDAnimationPlayer
  // 必需
  modelRef={modelRef}
  
  // 可选 - 动画配置
  motionPath="/animations/dance.vmd"
  cameraMotionPath="/animations/camera.vmd"
  audioPath="/animations/music.mp3"
  
  // 可选 - 播放配置
  autoPlay={false}
  loop={false}
  volume={0.7}
  enablePhysics={true}
  
  // 回调
  onReady={(controls) => {
    // 获取播放控制方法
  }}
  onProgress={(progress) => {
    // 播放进度 (0-1)
  }}
/>
```

### MMDCameraControl 组件

```typescript
<MMDCameraControl
  // 必需 - 回调函数
  onCameraMove={(dx, dy) => camera.move(dx, dy)}
  onCameraZoom={(delta) => camera.zoom(delta)}
  onCameraElevate={(delta) => camera.elevate(delta)}
  onCameraReset={() => camera.reset()}
  
  // 可选 - UI 配置
  position="bottom-right"
  size="medium"
  theme="dark"
  
  // 可选 - 功能开关
  showJoystick={true}
  showZoomButtons={true}
  showElevateButtons={true}
  showResetButton={true}
/>
```

---

## 🧪 测试

### 本地测试

```bash
# 1. 构建 sa2kit
cd /Users/qihongrui/Desktop/profile-v1/sa2kit
pnpm build

# 2. 创建软链接
pnpm link

# 3. 在 profile-v1 中测试
cd /Users/qihongrui/Desktop/profile-v1
pnpm link sa2kit

# 4. 在 mikutalking 中使用
# 修改 mikutalking/components/MikuTalkingGame.tsx
import { MMDViewer, MMDAnimationPlayer, MMDCameraControl } from 'sa2kit'
```

---

## 📦 发布流程

### 发布到 npm（可选）

```bash
# 1. 登录 npm
npm login

# 2. 发布包
npm publish --access public

# 3. 验证发布
npm view sa2kit
```

### 使用已发布的包

```bash
npm install sa2kit three three-stdlib
# 或
pnpm add sa2kit three three-stdlib
```

---

## 📅 预计时间线

| 阶段 | 内容 | 预计时间 |
|------|------|----------|
| 第一阶段 | 项目初始化 | ✅ 已完成 |
| 第二阶段 | 核心组件迁移 | 3-5 天 |
| 第三阶段 | Hooks 和工具函数 | 2-3 天 |
| 第四阶段 | 类型定义 | 1 天 |
| 第五阶段 | 主入口和导出 | 1 天 |
| 第六阶段 | 文档和示例 | 2 天 |
| 第七阶段 | 测试和发布 | 2 天 |
| **总计** | | **11-14 天** |

---

## 🔗 相关文档

- [README.md](./README.md) - 项目说明
- [MIGRATION_FROM_PROFILE.md](./MIGRATION_FROM_PROFILE.md) - 详细迁移计划
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 贡献指南

---

## 📞 需要帮助？

如有问题，请查阅：
1. [详细迁移计划](./MIGRATION_FROM_PROFILE.md)
2. Profile-V1 项目的 MMD 模块文档
3. Three.js 官方文档

---

**准备好了吗？开始迁移吧！** 🚀

**最后更新:** 2025-11-14  
**文档版本:** 1.0.0

