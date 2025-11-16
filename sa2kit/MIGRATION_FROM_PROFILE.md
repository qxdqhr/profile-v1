# 从 Profile-V1 项目迁移 MMD 功能到 SA2Kit

## 📋 迁移概述

本文档记录如何将 `profile-v1/src/app/(pages)/gameField/mikutalking` 和 `profile-v1/src/modules/mmd` 中的 MMD 核心功能迁移到独立的开源库 **SA2Kit**。

## 🎯 迁移目标

### 主要目标
1. 创建独立的、可发布的 npm 包
2. 提供通用的 MMD 查看器和动画播放功能
3. 保持代码质量和可维护性
4. 提供完整的 TypeScript 类型定义
5. 支持 Tree-shaking 和按需导入

### 非目标
- ❌ 不包含游戏逻辑（道具系统、情绪系统等）
- ❌ 不包含特定 UI 组件（StatusBar、ItemBar 等）
- ❌ 不包含语音录制和变声功能

---

## 📦 SA2Kit 目录结构

```
sa2kit/
├── package.json                    # npm 包配置
├── tsconfig.json                   # TypeScript 配置
├── tsup.config.ts                  # 打包配置
├── README.md                       # 项目文档
├── LICENSE                         # 许可证（MIT）
├── .gitignore                      # Git 忽略文件
├── .eslintrc.js                    # ESLint 配置
├── .prettierrc                     # Prettier 配置
│
├── src/                            # 源代码目录
│   ├── index.ts                    # 主入口文件
│   │
│   ├── components/                 # React 组件
│   │   ├── MMDViewer/
│   │   │   ├── index.ts
│   │   │   ├── MMDViewer.tsx
│   │   │   └── types.ts
│   │   ├── MMDAnimationPlayer/
│   │   │   ├── index.ts
│   │   │   ├── MMDAnimationPlayer.tsx
│   │   │   └── types.ts
│   │   └── MMDCameraControl/
│   │       ├── index.ts
│   │       ├── MMDCameraControl.tsx
│   │       └── types.ts
│   │
│   ├── hooks/                      # React Hooks
│   │   ├── useMMDAnimation.ts
│   │   ├── useMMDCamera.ts
│   │   ├── useMMDLoader.ts
│   │   └── index.ts
│   │
│   ├── utils/                      # 工具函数
│   │   ├── texturePathResolver.ts
│   │   ├── sceneUtils.ts
│   │   ├── mmdModelBuilder.ts
│   │   └── index.ts
│   │
│   ├── types/                      # TypeScript 类型
│   │   ├── animation.ts
│   │   ├── camera.ts
│   │   ├── viewer.ts
│   │   └── index.ts
│   │
│   └── constants/                  # 常量定义
│       ├── defaults.ts
│       └── index.ts
│
├── examples/                       # 示例项目
│   ├── basic-viewer/
│   ├── animation-player/
│   ├── camera-control/
│   └── full-app/
│
├── docs/                           # 文档
│   ├── API.md
│   ├── GUIDE.md
│   ├── MIGRATION.md
│   └── FAQ.md
│
└── tests/                          # 测试文件
    ├── components/
    ├── hooks/
    └── utils/
```

---

## 🗺️ 文件迁移映射表

### 从 mikutalking 迁移

| 源文件 (profile-v1) | 目标文件 (sa2kit) | 代码量 | 优先级 |
|---------------------|-------------------|--------|--------|
| `mikutalking/components/MikuMMDViewer.tsx` | `src/components/MMDViewer/MMDViewer.tsx` | ~1076行 | 🔴 P0 |
| `mikutalking/components/MMDPlayer.tsx` | `src/components/MMDAnimationPlayer/MMDAnimationPlayer.tsx` | ~350行 | 🔴 P0 |
| `mikutalking/components/CameraControl.tsx` | `src/components/MMDCameraControl/MMDCameraControl.tsx` | ~364行 | 🟡 P1 |

### 从 mmd 模块迁移

| 源文件 (profile-v1) | 目标文件 (sa2kit) | 优先级 |
|---------------------|-------------------|--------|
| `modules/mmd/utils/sceneUtils.ts` | `src/utils/sceneUtils.ts` | 🟢 P2 |
| `modules/mmd/utils/mmdModelBuilder.ts` | `src/utils/mmdModelBuilder.ts` | 🟢 P2 |
| `modules/mmd/utils/textureManager.ts` | `src/utils/texturePathResolver.ts` | 🔴 P0 |

### 需要新创建的文件

| 文件路径 (sa2kit) | 功能描述 | 优先级 |
|-------------------|----------|--------|
| `src/hooks/useMMDAnimation.ts` | 动画管理 Hook | 🔴 P0 |
| `src/hooks/useMMDCamera.ts` | 相机控制 Hook | 🟡 P1 |
| `src/hooks/useMMDLoader.ts` | 模型加载 Hook | 🟡 P1 |
| `src/types/animation.ts` | 动画相关类型 | 🔴 P0 |
| `src/types/camera.ts` | 相机相关类型 | 🟡 P1 |
| `src/types/viewer.ts` | 查看器相关类型 | 🔴 P0 |
| `src/constants/defaults.ts` | 默认配置 | 🟢 P2 |

---

## 🚀 迁移步骤

### 第一阶段：项目初始化（1天）

#### Step 1.1: 创建 sa2kit 目录和基础文件

```bash
# 在 profile-v1 同级目录创建 sa2kit
cd /Users/qihongrui/Desktop
mkdir sa2kit
cd sa2kit

# 初始化 Git
git init
git branch -M main

# 创建基础文件（已完成）
# - package.json
# - tsconfig.json
# - tsup.config.ts
# - README.md

# 创建其他配置文件
touch .gitignore .eslintrc.js .prettierrc LICENSE
```

#### Step 1.2: 创建目录结构

```bash
mkdir -p src/components/MMDViewer
mkdir -p src/components/MMDAnimationPlayer
mkdir -p src/components/MMDCameraControl
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/types
mkdir -p src/constants
mkdir -p examples docs tests
```

#### Step 1.3: 安装依赖

```bash
pnpm init
pnpm add three-stdlib mmd-parser
pnpm add -D @types/node @types/react @types/react-dom @types/three
pnpm add -D typescript tsup eslint prettier vitest
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
pnpm add -D eslint-plugin-react eslint-plugin-react-hooks
```

---

### 第二阶段：核心组件迁移（3-5天）

#### Step 2.1: 迁移 MMDViewer 组件

**任务清单：**
- [ ] 复制 `MikuMMDViewer.tsx` → `src/components/MMDViewer/MMDViewer.tsx`
- [ ] 移除 mikutalking 特定代码
- [ ] 提取纹理路径处理 → `src/utils/texturePathResolver.ts`
- [ ] 创建类型定义 → `src/components/MMDViewer/types.ts`
- [ ] 泛化 Props 接口
- [ ] 添加默认配置
- [ ] 创建导出文件 → `src/components/MMDViewer/index.ts`
- [ ] 添加 JSDoc 注释

**关键修改：**

```typescript
// src/components/MMDViewer/MMDViewer.tsx

import * as THREE from 'three'
import { OrbitControls } from 'three-stdlib'
import { MMDLoader } from 'three-stdlib'
import { resolveTexturePath } from '../../utils/texturePathResolver'
import { MMDViewerProps } from './types'
import { DEFAULT_VIEWER_CONFIG } from '../../constants/defaults'

export const MMDViewer: React.FC<MMDViewerProps> = ({
  modelPath,
  texturePath,
  backgroundColor = DEFAULT_VIEWER_CONFIG.backgroundColor,
  cameraPosition = DEFAULT_VIEWER_CONFIG.cameraPosition,
  cameraTarget = DEFAULT_VIEWER_CONFIG.cameraTarget,
  enableCameraControls = true,
  debugMode = false,
  onLoad,
  onError,
  onCameraReady,
  ...props
}) => {
  // 组件实现
  // ... 从 MikuMMDViewer.tsx 迁移代码
}
```

---

#### Step 2.2: 迁移 MMDAnimationPlayer 组件

**任务清单：**
- [ ] 复制 `MMDPlayer.tsx` → `src/components/MMDAnimationPlayer/MMDAnimationPlayer.tsx`
- [ ] 移除硬编码路径
- [ ] 创建类型定义 → `src/components/MMDAnimationPlayer/types.ts`
- [ ] 提取动画控制逻辑 → `src/hooks/useMMDAnimation.ts`
- [ ] 支持多动画切换
- [ ] 创建导出文件
- [ ] 添加 JSDoc 注释

**关键修改：**

```typescript
// src/components/MMDAnimationPlayer/MMDAnimationPlayer.tsx

import { MMDAnimationHelper } from 'three-stdlib'
import { useMMDAnimation } from '../../hooks/useMMDAnimation'
import { MMDAnimationPlayerProps } from './types'

export const MMDAnimationPlayer: React.FC<MMDAnimationPlayerProps> = ({
  modelRef,
  motionPath,
  cameraMotionPath,
  audioPath,
  autoPlay = false,
  loop = false,
  volume = 0.7,
  enablePhysics = true,
  onReady,
  onProgress,
  ...props
}) => {
  const {
    play,
    pause,
    stop,
    progress,
    duration,
    isPlaying
  } = useMMDAnimation({
    modelRef,
    motionPath,
    cameraMotionPath,
    audioPath,
    autoPlay,
    loop,
    volume,
    enablePhysics
  })

  useEffect(() => {
    if (onReady) {
      onReady({ play, pause, stop, isPlaying, progress, duration })
    }
  }, [play, pause, stop, isPlaying, progress, duration, onReady])

  // 组件实现
}
```

---

#### Step 2.3: 迁移 MMDCameraControl 组件

**任务清单：**
- [ ] 复制 `CameraControl.tsx` → `src/components/MMDCameraControl/MMDCameraControl.tsx`
- [ ] 提取样式为可配置主题
- [ ] 创建类型定义
- [ ] 添加配置选项
- [ ] 创建导出文件
- [ ] 添加 JSDoc 注释

**关键修改：**

```typescript
// src/components/MMDCameraControl/MMDCameraControl.tsx

import { MMDCameraControlProps } from './types'
import { DEFAULT_CAMERA_CONTROL_CONFIG } from '../../constants/defaults'

export const MMDCameraControl: React.FC<MMDCameraControlProps> = ({
  onCameraMove,
  onCameraZoom,
  onCameraElevate,
  onCameraReset,
  position = 'bottom-right',
  size = 'medium',
  theme = 'dark',
  showJoystick = true,
  showZoomButtons = true,
  showElevateButtons = true,
  showResetButton = true,
  moveSensitivity = 0.03,
  zoomSensitivity = 0.5,
  elevateSensitivity = 0.5,
  ...props
}) => {
  // 组件实现
}
```

---

### 第三阶段：Hooks 和工具函数（2-3天）

#### Step 3.1: 创建 texturePathResolver.ts

```typescript
// src/utils/texturePathResolver.ts

export interface TexturePathResolverOptions {
  basePath: string
  modelPath: string
  subdirectories?: {
    texture?: string      // 默认: 'tex'
    sphere?: string       // 默认: 'spa'
    toon?: string         // 默认: 'toon'
  }
}

/**
 * 解析 MMD 模型的纹理路径
 * 
 * 处理以下情况：
 * - Windows 路径（反斜杠）转换
 * - 中文路径处理
 * - 子目录自动映射
 * - 特殊文件名识别
 */
export function resolveTexturePath(
  texturePath: string,
  options: TexturePathResolverOptions
): string {
  // 从 MikuMMDViewer 的 fixTexturePath 提取实现
  // ...
}
```

#### Step 3.2: 创建 useMMDAnimation.ts

```typescript
// src/hooks/useMMDAnimation.ts

import { useRef, useState, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import { MMDAnimationHelper } from 'three-stdlib'

export interface UseMMDAnimationOptions {
  modelRef: React.RefObject<THREE.Group>
  motionPath?: string
  cameraMotionPath?: string
  audioPath?: string
  autoPlay?: boolean
  loop?: boolean
  volume?: number
  enablePhysics?: boolean
}

export interface UseMMDAnimationReturn {
  // 状态
  isLoading: boolean
  isPlaying: boolean
  isPaused: boolean
  progress: number
  duration: number
  error: Error | null
  
  // 控制方法
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  
  // 配置方法
  setVolume: (volume: number) => void
  setLoop: (loop: boolean) => void
}

export function useMMDAnimation(
  options: UseMMDAnimationOptions
): UseMMDAnimationReturn {
  // 从 MMDPlayer 提取实现
  // ...
}
```

#### Step 3.3: 创建 useMMDCamera.ts

```typescript
// src/hooks/useMMDCamera.ts

import * as THREE from 'three'
import { OrbitControls } from 'three-stdlib'

export interface UseMMDCameraOptions {
  cameraRef: React.RefObject<THREE.Camera>
  controlsRef: React.RefObject<OrbitControls>
  initialPosition?: [number, number, number]
  initialTarget?: [number, number, number]
}

export interface UseMMDCameraReturn {
  moveCamera: (deltaX: number, deltaY: number) => void
  zoomCamera: (delta: number) => void
  elevateCamera: (delta: number) => void
  resetCamera: () => void
  getCameraPosition: () => THREE.Vector3
  getCameraTarget: () => THREE.Vector3
}

export function useMMDCamera(
  options: UseMMDCameraOptions
): UseMMDCameraReturn {
  // 从 MikuMMDViewer 提取实现
  // ...
}
```

---

### 第四阶段：类型定义（1天）

#### Step 4.1: 创建类型文件

```typescript
// src/types/viewer.ts
export interface MMDViewerProps {
  // ... 类型定义
}

// src/types/animation.ts
export interface MMDAnimation {
  // ... 类型定义
}

// src/types/camera.ts
export interface CameraControls {
  // ... 类型定义
}

// src/types/index.ts
export * from './viewer'
export * from './animation'
export * from './camera'
```

---

### 第五阶段：主入口和导出（1天）

#### Step 5.1: 创建主入口文件

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
export { createMMDScene } from './utils/sceneUtils'
export { MMDModelBuilder } from './utils/mmdModelBuilder'

// ===== 类型导出 =====
export type * from './types'

// ===== 常量导出 =====
export * from './constants/defaults'

// ===== 版本信息 =====
export const VERSION = '1.0.0'
```

---

### 第六阶段：文档和示例（2天）

#### Step 6.1: 编写 API 文档

```bash
# 创建文档文件
touch docs/API.md
touch docs/GUIDE.md
touch docs/FAQ.md
```

#### Step 6.2: 创建示例项目

```bash
# 创建示例目录
mkdir -p examples/basic-viewer
mkdir -p examples/animation-player
mkdir -p examples/camera-control
mkdir -p examples/full-app

# 每个示例包含
# - package.json
# - README.md
# - src/App.tsx
# - public/models/
```

---

### 第七阶段：测试和发布（2天）

#### Step 7.1: 编写测试

```bash
mkdir -p tests/components
mkdir -p tests/hooks
mkdir -p tests/utils

# 使用 vitest 编写测试
```

#### Step 7.2: 构建和发布

```bash
# 构建
pnpm build

# 本地测试
pnpm link

# 在 profile-v1 中测试
cd /Users/qihongrui/Desktop/profile-v1
pnpm link sa2kit

# 发布到 npm（可选）
npm login
npm publish --access public
```

---

## 📋 迁移清单

### 准备工作
- [ ] 创建 sa2kit 目录
- [ ] 初始化 Git 仓库
- [ ] 创建基础配置文件
- [ ] 安装依赖包

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
- [ ] 创建 viewer 类型
- [ ] 创建 animation 类型
- [ ] 创建 camera 类型

### 文档
- [ ] 编写 README.md
- [ ] 编写 API.md
- [ ] 编写 GUIDE.md
- [ ] 编写 FAQ.md

### 示例
- [ ] 创建基础查看器示例
- [ ] 创建动画播放示例
- [ ] 创建相机控制示例
- [ ] 创建完整应用示例

### 测试
- [ ] 编写组件测试
- [ ] 编写 Hooks 测试
- [ ] 编写工具函数测试

### 发布
- [ ] 本地构建测试
- [ ] 在 profile-v1 中集成测试
- [ ] 发布到 npm（可选）

---

## 🎯 预期成果

### 独立的 npm 包
```bash
npm install sa2kit three three-stdlib
```

### 使用示例
```typescript
import { MMDViewer, MMDAnimationPlayer, MMDCameraControl } from 'sa2kit'

function App() {
  return (
    <div>
      <MMDViewer
        modelPath="/models/miku.pmx"
        enableCameraControls
      />
    </div>
  )
}
```

### 包体积
- Bundle size (minified): ~150KB
- Bundle size (gzipped): ~45KB
- Tree-shakable: ✅

---

## 📅 时间线

| 阶段 | 内容 | 预计时间 |
|------|------|----------|
| 第一阶段 | 项目初始化 | 1 天 |
| 第二阶段 | 核心组件迁移 | 3-5 天 |
| 第三阶段 | Hooks 和工具函数 | 2-3 天 |
| 第四阶段 | 类型定义 | 1 天 |
| 第五阶段 | 主入口和导出 | 1 天 |
| 第六阶段 | 文档和示例 | 2 天 |
| 第七阶段 | 测试和发布 | 2 天 |
| **总计** | | **12-15 天** |

---

**最后更新:** 2025-11-14  
**文档版本:** 1.0.0  
**作者:** Profile-V1 Team

