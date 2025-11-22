# MMD 模块迁移计划

## 📋 概述

将 `mikutalking` 游戏中的 MMD 核心功能（模型加载、动画播放、相机控制）迁移到独立的 `mmd` 模块，使其成为可复用的通用 MMD 展示组件库。

## 🎯 迁移目标

### 主要目标
1. 提取 `mikutalking` 中与 MMD 核心功能相关的代码
2. 重构为通用的、可复用的模块
3. 保留原有功能的同时提升可维护性
4. 创建清晰的 API 接口供其他模块调用

### 非目标
- ❌ 不迁移游戏逻辑（道具系统、情绪系统、等级系统）
- ❌ 不迁移特定 UI 组件（StatusBar、ItemBar、TutorialModal）
- ❌ 不迁移语音录制和变声功能
- ❌ 不迁移手势检测系统

## 📦 迁移范围

### ✅ 需要迁移的核心组件

#### 1. **MikuMMDViewer.tsx** → **MMDViewer.tsx**
**文件路径:**
- 源：`src/app/(pages)/gameField/mikutalking/components/MikuMMDViewer.tsx`
- 目标：`src/modules/mmd/components/MMDViewer/MMDViewer.tsx`

**核心功能:**
- ✅ Three.js 场景初始化
- ✅ PMX 模型加载（使用 MMDLoader）
- ✅ 纹理路径处理和映射
- ✅ OrbitControls 相机控制
- ✅ 材质属性清理（兼容新版 Three.js）
- ✅ 模型初始状态保存
- ✅ 调试模式和日志系统

**需要重构的部分:**
- 移除 `mikutalking` 特定的路径硬编码
- 提取纹理路径处理为独立工具函数
- 将调试日志系统提取为配置项
- 泛化相机控制接口

**代码量:** ~1076 行

---

#### 2. **MMDPlayer.tsx** → **MMDAnimationPlayer.tsx**
**文件路径:**
- 源：`src/app/(pages)/gameField/mikutalking/components/MMDPlayer.tsx`
- 目标：`src/modules/mmd/components/MMDAnimationPlayer/MMDAnimationPlayer.tsx`

**核心功能:**
- ✅ VMD 动画文件加载
- ✅ MMDAnimationHelper 集成
- ✅ 动画播放/停止控制
- ✅ 音频同步播放
- ✅ 播放进度追踪
- ✅ 物理引擎重置机制

**需要重构的部分:**
- 移除硬编码的动画路径
- 抽象音频播放为可选功能
- 提取播放控制为独立 Hook
- 添加多动画切换支持

**代码量:** ~350 行

---

#### 3. **CameraControl.tsx** → **MMDCameraControl.tsx**
**文件路径:**
- 源：`src/app/(pages)/gameField/mikutalking/components/CameraControl.tsx`
- 目标：`src/modules/mmd/components/MMDCameraControl/MMDCameraControl.tsx`

**核心功能:**
- ✅ 虚拟摇杆控制
- ✅ 缩放按钮（放大/缩小）
- ✅ 升降按钮（Z 轴移动）
- ✅ 相机重置功能
- ✅ 触摸和鼠标事件支持

**需要重构的部分:**
- 提取样式为可配置主题
- 支持自定义控制灵敏度
- 添加键盘快捷键支持（可选）

**代码量:** ~364 行

---

### 🛠️ 需要创建的新工具模块

#### 4. **纹理路径处理工具**
**文件路径:** `src/modules/mmd/utils/texturePathResolver.ts`

**功能:**
- PMX 模型中的纹理路径修正
- 支持多种路径格式（Windows 路径、相对路径）
- 子目录自动映射（tex/、spa/、toon/、tex_02/）
- 中文路径处理

**来源:** 从 `MikuMMDViewer.tsx` 的 `fixTexturePath` 函数提取

---

#### 5. **MMD 动画管理 Hook**
**文件路径:** `src/modules/mmd/hooks/useMMDAnimation.ts`

**功能:**
- 动画加载状态管理
- 播放控制逻辑
- 进度追踪
- 错误处理

**来源:** 整合 `MMDPlayer.tsx` 和 `useAnimationManager.ts` 的逻辑

---

#### 6. **MMD 相机控制 Hook**
**文件路径:** `src/modules/mmd/hooks/useMMDCamera.ts`

**功能:**
- 相机移动、缩放、升降逻辑
- 相机状态管理
- 重置功能

**来源:** 从 `MikuMMDViewer.tsx` 的相机控制逻辑提取

---

### 📄 需要整理的文档

#### 7. **MMD 组件使用文档**
**文件路径:** `src/modules/mmd/docs/USAGE.md`

**内容:**
- MMDViewer 使用示例
- MMDAnimationPlayer 使用示例
- MMDCameraControl 集成方法
- Props API 文档
- 常见问题解答

---

#### 8. **迁移记录文档**
**文件路径:** `src/modules/mmd/docs/MIGRATION_HISTORY.md`

**内容:**
- 迁移日期和版本
- 从 mikutalking 迁移的功能清单
- API 变更记录
- 破坏性更改说明

---

## 🔧 技术细节

### 依赖包（已安装）
```json
{
  "three": "^0.160.0",
  "three-stdlib": "^2.29.4",
  "mmd-parser": "^1.0.4",
  "@types/three": "^0.160.0"
}
```

### 新增依赖（需要）
```json
{
  "ammo.js": "^0.0.10"  // 用于 MMD 物理引擎
}
```

### 核心技术栈
- **Three.js** - 3D 渲染引擎
- **three-stdlib** - MMDLoader、MMDAnimationHelper
- **mmd-parser** - PMX/PMD 模型解析
- **Ammo.js** - 物理引擎（用于头发、裙子等物理效果）
- **React Hooks** - 状态管理
- **TypeScript** - 类型安全

---

## 📂 目标模块结构

```
src/modules/mmd/
├── MIGRATION_PLAN.md          # 本文档
├── DEVELOPMENT.md             # 现有开发文档
├── index.ts                   # 模块主入口
├── server.ts                  # 服务端导出
├── 
├── components/
│   ├── MMDViewer/             # ✨ 核心查看器组件
│   │   ├── index.ts
│   │   └── MMDViewer.tsx      # 从 MikuMMDViewer 迁移
│   ├── MMDAnimationPlayer/    # ✨ 动画播放器组件
│   │   ├── index.ts
│   │   └── MMDAnimationPlayer.tsx  # 从 MMDPlayer 迁移
│   ├── MMDCameraControl/      # ✨ 相机控制组件
│   │   ├── index.ts
│   │   └── MMDCameraControl.tsx    # 从 CameraControl 迁移
│   └── MMDSettingsModal.tsx   # 现有设置弹窗
│
├── hooks/
│   ├── useMMDAnimation.ts     # ✨ 动画管理 Hook
│   ├── useMMDCamera.ts        # ✨ 相机控制 Hook
│   └── useMMDLoader.ts        # ✨ 模型加载 Hook
│
├── utils/
│   ├── texturePathResolver.ts # ✨ 纹理路径处理
│   ├── mmdModelBuilder.ts     # 现有模型构建器
│   ├── sceneUtils.ts          # 现有场景工具
│   └── textureManager.ts      # 现有纹理管理器
│
├── types/
│   ├── index.ts               # 类型定义
│   ├── animation.ts           # ✨ 动画相关类型
│   └── camera.ts              # ✨ 相机相关类型
│
├── docs/
│   ├── USAGE.md               # ✨ 使用文档
│   ├── MIGRATION_HISTORY.md   # ✨ 迁移记录
│   ├── LOCAL_PARSE_GUIDE.md   # 现有文档
│   ├── SIMPLE_USAGE.md        # 现有文档
│   ├── TEXTURE_SUPPORT.md     # 现有文档
│   └── VMD_SUPPORT.md         # 现有文档
│
├── pages/
│   └── MMDViewerPage.tsx      # 现有页面（需更新）
│
├── api/                       # 现有 API
└── db/                        # 现有数据库
```

---

## 🗓️ 迁移步骤

### 第一阶段：准备工作（1-2 天）

#### Step 1.1: 创建分支
```bash
git checkout -b feature/mmd-module-migration
```

#### Step 1.2: 安装依赖
```bash
pnpm add ammo.js
pnpm add -D @types/ammo.js
```

#### Step 1.3: 创建目录结构
```bash
# 在 src/modules/mmd/ 下创建新目录
mkdir -p components/MMDViewer
mkdir -p components/MMDAnimationPlayer
mkdir -p components/MMDCameraControl
mkdir -p hooks
mkdir -p docs
```

---

### 第二阶段：核心组件迁移（3-5 天）

#### Step 2.1: 迁移 MMDViewer 组件
**任务清单:**
- [ ] 复制 `MikuMMDViewer.tsx` → `MMDViewer.tsx`
- [ ] 移除 `mikutalking` 特定逻辑
- [ ] 泛化 Props 接口
- [ ] 提取 `fixTexturePath` 为独立工具
- [ ] 更新导入路径
- [ ] 添加 JSDoc 注释
- [ ] 编写单元测试（可选）

**关键 Props 设计:**
```typescript
interface MMDViewerProps {
  // 模型配置
  modelPath: string                    // PMX/PMD 模型路径
  texturePath?: string                 // 纹理基础路径
  
  // 场景配置
  backgroundColor?: string             // 背景颜色
  enableShadows?: boolean              // 是否启用阴影
  
  // 相机配置
  cameraPosition?: [number, number, number]
  cameraTarget?: [number, number, number]
  enableCameraControls?: boolean       // 是否启用轨道控制
  
  // 调试配置
  debugMode?: boolean                  // 调试模式
  showStats?: boolean                  // 显示性能统计
  
  // 回调函数
  onLoad?: (model: any) => void
  onError?: (error: Error) => void
  onCameraReady?: (controls: CameraControls) => void
  onAnimationReady?: (controls: AnimationControls) => void
}
```

---

#### Step 2.2: 迁移 MMDAnimationPlayer 组件
**任务清单:**
- [ ] 复制 `MMDPlayer.tsx` → `MMDAnimationPlayer.tsx`
- [ ] 移除硬编码的动画路径
- [ ] 抽象音频播放逻辑
- [ ] 支持动画列表切换
- [ ] 添加播放事件回调
- [ ] 更新导入路径
- [ ] 添加 JSDoc 注释

**关键 Props 设计:**
```typescript
interface MMDAnimationPlayerProps {
  // 动画配置
  modelRef: React.RefObject<THREE.Group>  // 模型引用
  motionPath?: string                      // VMD 动作文件路径
  cameraMotionPath?: string                // VMD 镜头文件路径
  audioPath?: string                       // 音频文件路径
  
  // 播放控制
  autoPlay?: boolean                       // 自动播放
  loop?: boolean                           // 循环播放
  volume?: number                          // 音量 (0-1)
  
  // 物理引擎
  enablePhysics?: boolean                  // 启用物理效果
  
  // 回调函数
  onReady?: (controls: PlaybackControls) => void
  onPlay?: () => void
  onPause?: () => void
  onStop?: () => void
  onProgress?: (progress: number) => void
  onEnd?: () => void
}
```

---

#### Step 2.3: 迁移 MMDCameraControl 组件
**任务清单:**
- [ ] 复制 `CameraControl.tsx` → `MMDCameraControl.tsx`
- [ ] 提取样式为 Tailwind 主题
- [ ] 添加自定义灵敏度配置
- [ ] 支持隐藏特定控制按钮
- [ ] 更新导入路径
- [ ] 添加 JSDoc 注释

**关键 Props 设计:**
```typescript
interface MMDCameraControlProps {
  // 回调函数
  onCameraMove: (deltaX: number, deltaY: number) => void
  onCameraZoom: (delta: number) => void
  onCameraElevate: (delta: number) => void
  onCameraReset: () => void
  
  // UI 配置
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'small' | 'medium' | 'large'
  theme?: 'light' | 'dark'
  
  // 功能开关
  showJoystick?: boolean                   // 显示摇杆
  showZoomButtons?: boolean                // 显示缩放按钮
  showElevateButtons?: boolean             // 显示升降按钮
  showResetButton?: boolean                // 显示重置按钮
  
  // 灵敏度配置
  moveSensitivity?: number                 // 移动灵敏度
  zoomSensitivity?: number                 // 缩放灵敏度
  elevateSensitivity?: number              // 升降灵敏度
}
```

---

### 第三阶段：工具函数和 Hooks（2-3 天）

#### Step 3.1: 创建 texturePathResolver.ts
**功能实现:**
```typescript
export interface TexturePathResolverOptions {
  basePath: string                         // 基础路径
  modelPath: string                        // 模型文件路径
  subdirectories?: {
    texture?: string                       // 纹理子目录 (默认: 'tex')
    sphere?: string                        // 球面贴图子目录 (默认: 'spa')
    toon?: string                          // toon 贴图子目录 (默认: 'toon')
  }
}

export function resolveTexturePath(
  texturePath: string, 
  options: TexturePathResolverOptions
): string {
  // 实现纹理路径解析逻辑
}
```

---

#### Step 3.2: 创建 useMMDAnimation.ts
**Hook 接口:**
```typescript
interface UseMMDAnimationOptions {
  modelRef: React.RefObject<THREE.Group>
  motionPath?: string
  cameraMotionPath?: string
  audioPath?: string
  autoPlay?: boolean
  loop?: boolean
  volume?: number
  enablePhysics?: boolean
}

interface UseMMDAnimationReturn {
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
  // 实现动画管理逻辑
}
```

---

#### Step 3.3: 创建 useMMDCamera.ts
**Hook 接口:**
```typescript
interface UseMMDCameraOptions {
  cameraRef: React.RefObject<THREE.Camera>
  controlsRef: React.RefObject<OrbitControls>
  initialPosition?: [number, number, number]
  initialTarget?: [number, number, number]
}

interface UseMMDCameraReturn {
  // 控制方法
  moveCamera: (deltaX: number, deltaY: number) => void
  zoomCamera: (delta: number) => void
  elevateCamera: (delta: number) => void
  resetCamera: () => void
  
  // 状态查询
  getCameraPosition: () => THREE.Vector3
  getCameraTarget: () => THREE.Vector3
}

export function useMMDCamera(
  options: UseMMDCameraOptions
): UseMMDCameraReturn {
  // 实现相机控制逻辑
}
```

---

#### Step 3.4: 创建 useMMDLoader.ts
**Hook 接口:**
```typescript
interface UseMMDLoaderOptions {
  modelPath: string
  onLoad?: (model: THREE.Group) => void
  onProgress?: (progress: number) => void
  onError?: (error: Error) => void
}

interface UseMMDLoaderReturn {
  model: THREE.Group | null
  isLoading: boolean
  progress: number
  error: Error | null
  reload: () => Promise<void>
}

export function useMMDLoader(
  options: UseMMDLoaderOptions
): UseMMDLoaderReturn {
  // 实现模型加载逻辑
}
```

---

### 第四阶段：类型定义（1 天）

#### Step 4.1: 创建 types/animation.ts
```typescript
export interface MMDAnimation {
  id: string
  name: string
  motionPath: string
  cameraMotionPath?: string
  audioPath?: string
  duration: number
  thumbnail?: string
}

export interface AnimationControls {
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  isPlaying: boolean
  progress: number
}

export interface PlaybackState {
  isPlaying: boolean
  isPaused: boolean
  currentTime: number
  duration: number
  volume: number
  loop: boolean
}
```

---

#### Step 4.2: 创建 types/camera.ts
```typescript
export interface CameraControls {
  moveCamera: (deltaX: number, deltaY: number) => void
  zoomCamera: (delta: number) => void
  elevateCamera: (delta: number) => void
  resetCamera: () => void
}

export interface CameraConfig {
  position: [number, number, number]
  target: [number, number, number]
  fov?: number
  near?: number
  far?: number
}

export interface CameraState {
  position: THREE.Vector3
  target: THREE.Vector3
  zoom: number
}
```

---

#### Step 4.3: 更新 types/index.ts
```typescript
export * from './animation'
export * from './camera'

export interface MMDViewerProps { /* ... */ }
export interface MMDAnimationPlayerProps { /* ... */ }
export interface MMDCameraControlProps { /* ... */ }
```

---

### 第五阶段：文档编写（1-2 天）

#### Step 5.1: 编写 USAGE.md
**内容大纲:**
```markdown
# MMD 模块使用指南

## 快速开始
## MMDViewer 组件
  - 基础示例
  - Props API
  - 高级用法
## MMDAnimationPlayer 组件
  - 基础示例
  - Props API
  - 动画控制
## MMDCameraControl 组件
  - 基础示例
  - Props API
  - 自定义样式
## Hooks
  - useMMDAnimation
  - useMMDCamera
  - useMMDLoader
## 工具函数
  - resolveTexturePath
## 常见问题
## 示例项目
```

---

#### Step 5.2: 编写 MIGRATION_HISTORY.md
**内容大纲:**
```markdown
# MMD 模块迁移历史

## 版本 2.0.0 (2025-XX-XX)
### 从 mikutalking 迁移的功能
- MMDViewer 组件
- MMDAnimationPlayer 组件
- MMDCameraControl 组件
- ...

### API 变更
- 原 MikuMMDViewer → MMDViewer
- ...

### 破坏性更改
- ...

### 迁移指南
- ...
```

---

### 第六阶段：集成测试（2-3 天）

#### Step 6.1: 更新 MMDViewerPage.tsx
- [ ] 使用新的 MMDViewer 组件
- [ ] 集成 MMDAnimationPlayer
- [ ] 添加 MMDCameraControl
- [ ] 测试所有功能

---

#### Step 6.2: 创建示例页面
**文件路径:** `src/modules/mmd/pages/MMDShowcasePage.tsx`
- [ ] 展示所有组件的使用方法
- [ ] 提供实时可调参数
- [ ] 添加代码示例

---

#### Step 6.3: 在 mikutalking 中使用新模块
- [ ] 在 `mikutalking` 中导入 `mmd` 模块组件
- [ ] 替换现有的 MMD 组件
- [ ] 验证功能完整性
- [ ] 性能对比测试

---

### 第七阶段：清理和发布（1 天）

#### Step 7.1: 更新模块入口
**更新 `src/modules/mmd/index.ts`:**
```typescript
// ===== 核心组件导出 =====
export { MMDViewer } from './components/MMDViewer'
export { MMDAnimationPlayer } from './components/MMDAnimationPlayer'
export { MMDCameraControl } from './components/MMDCameraControl'
export { MMDSettingsModal } from './components/MMDSettingsModal'
export { default as MMDViewerPage } from './pages/MMDViewerPage'

// ===== Hooks 导出 =====
export { useMMDAnimation } from './hooks/useMMDAnimation'
export { useMMDCamera } from './hooks/useMMDCamera'
export { useMMDLoader } from './hooks/useMMDLoader'

// ===== 工具函数导出 =====
export { resolveTexturePath } from './utils/texturePathResolver'
export { createMMDScene, updateCameraAspect, updateRendererSize, disposeObject } from './utils/sceneUtils'
export { MMDModelBuilder } from './utils/mmdModelBuilder'

// ===== 类型导出 =====
export type * from './types'

// ===== 模块版本 =====
export const MMD_MODULE_VERSION = '2.0.0'
```

---

#### Step 7.2: 更新实验田路由
**文件路径:** `public/data/experiment/experiments.json`
```json
{
  "id": "mmd-viewer",
  "title": "MMD 查看器",
  "description": "通用 MMD 模型查看和动画播放工具",
  "path": "/mmd-viewer",
  "category": "tools",
  "tags": ["3d", "mmd", "animation", "three.js"],
  "version": "2.0.0",
  "status": "stable"
}
```

---

#### Step 7.3: 代码审查和优化
- [ ] 代码风格统一（ESLint/Prettier）
- [ ] TypeScript 类型检查
- [ ] 性能优化
- [ ] 内存泄漏检查
- [ ] 移除 console.log（保留 debug 日志）

---

#### Step 7.4: 提交和合并
```bash
git add .
git commit -m "feat(mmd): migrate core MMD functionality from mikutalking"
git push origin feature/mmd-module-migration
# 创建 PR 并合并到 main
```

---

## 📊 预期成果

### 迁移完成后的模块特性

#### ✅ 通用性
- 可在任何 Next.js 项目中使用
- 不依赖特定的业务逻辑
- 清晰的 Props 接口和 API

#### ✅ 可复用性
- 独立的组件库
- 灵活的配置选项
- 易于集成

#### ✅ 可维护性
- 清晰的代码结构
- 完善的类型定义
- 详细的文档和注释

#### ✅ 性能优化
- Three.js 资源管理
- 物理引擎优化
- 内存泄漏防护

---

## 🔄 mikutalking 模块的后续处理

### 方案 A: 完全替换（推荐）
```typescript
// 在 mikutalking 中直接使用 mmd 模块
import { 
  MMDViewer, 
  MMDAnimationPlayer, 
  MMDCameraControl 
} from '@/modules/mmd'

// 保留 mikutalking 特有的游戏逻辑组件
// - StatusBar
// - ItemBar
// - VoiceRecorder
// - TutorialModal
// - 等
```

**优点:**
- 减少代码重复
- 统一 MMD 功能实现
- 便于维护和更新

**缺点:**
- 需要较大改动
- 可能需要适配接口

---

### 方案 B: 保留现有组件（过渡期）
- 保留 `mikutalking` 中的现有组件
- 逐步迁移到 `mmd` 模块
- 两套代码并行运行一段时间

**优点:**
- 风险较低
- 可以逐步测试
- 兼容性好

**缺点:**
- 代码冗余
- 维护成本高

---

## ⚠️ 注意事项

### 1. 兼容性
- 确保 Three.js 版本一致
- 测试不同浏览器（Chrome、Safari、Firefox、Edge）
- 测试移动端（iOS Safari、Android Chrome）

### 2. 性能
- 大型 MMD 模型可能影响性能
- 物理引擎计算密集，移动端需优化
- 注意内存使用，及时释放资源

### 3. 路径处理
- 统一使用相对路径或绝对路径
- 处理 Windows 和 Unix 路径差异
- 纹理路径映射需灵活配置

### 4. 类型安全
- 为所有 Props 和返回值定义类型
- 使用 TypeScript 严格模式
- 避免使用 `any` 类型

### 5. 文档
- 及时更新文档
- 提供完整的示例代码
- 记录已知问题和解决方案

---

## 📞 联系与支持

如有问题或建议，请联系项目维护者或在 GitHub 上提交 Issue。

---

## 📅 时间线总结

| 阶段 | 内容 | 预计时间 |
|------|------|----------|
| 第一阶段 | 准备工作 | 1-2 天 |
| 第二阶段 | 核心组件迁移 | 3-5 天 |
| 第三阶段 | 工具函数和 Hooks | 2-3 天 |
| 第四阶段 | 类型定义 | 1 天 |
| 第五阶段 | 文档编写 | 1-2 天 |
| 第六阶段 | 集成测试 | 2-3 天 |
| 第七阶段 | 清理和发布 | 1 天 |
| **总计** | | **11-17 天** |

---

**最后更新:** 2025-XX-XX
**文档版本:** 1.0.0
**作者:** Profile-V1 开发团队

