# MMD 模块迁移总结

## 📚 文档索引

我已经为您准备了完整的迁移文档，包括：

### 1. **MIGRATION_PLAN.md** - 详细迁移计划
- 📋 完整的迁移目标和范围
- 🗓️ 分阶段的实施步骤（7个阶段）
- 📦 目标模块结构设计
- 🔧 技术细节和配置
- ⚠️ 注意事项和最佳实践
- 📊 预计工期：11-17天

**适合:** 项目管理、整体规划

---

### 2. **MIGRATION_CHECKLIST.md** - 任务检查清单
- ✅ 文件迁移清单（优先级标记）
- 🔍 组件依赖关系图
- 🎯 核心功能清单
- 📦 依赖包检查
- 📝 进度追踪表格
- 🚀 快速开始步骤

**适合:** 日常开发、进度跟踪

---

### 3. **MIGRATION_QUICK_REFERENCE.md** - 快速参考指南
- 🗺️ 文件映射表
- 🎯 核心迁移任务（Top 3）
- 📊 可视化依赖关系图
- 🔑 关键代码片段
- 🎨 Props 接口设计
- ⚡ 快速命令集合

**适合:** 快速查阅、代码参考

---

## 🎯 核心要点总结

### 需要迁移的核心组件（3个）

| 组件 | 源文件 | 目标文件 | 代码量 | 优先级 |
|------|--------|----------|--------|--------|
| **MMDViewer** | `mikutalking/components/MikuMMDViewer.tsx` | `mmd/components/MMDViewer/MMDViewer.tsx` | ~1076行 | 🔴 P0 |
| **MMDAnimationPlayer** | `mikutalking/components/MMDPlayer.tsx` | `mmd/components/MMDAnimationPlayer/MMDAnimationPlayer.tsx` | ~350行 | 🔴 P0 |
| **MMDCameraControl** | `mikutalking/components/CameraControl.tsx` | `mmd/components/MMDCameraControl/MMDCameraControl.tsx` | ~364行 | 🟡 P1 |

### 需要创建的新模块（4个）

| 模块 | 类型 | 来源 | 优先级 |
|------|------|------|--------|
| **texturePathResolver.ts** | 工具函数 | 从 MikuMMDViewer 提取 | 🔴 P0 |
| **useMMDAnimation.ts** | Hook | 从 MMDPlayer 提取 | 🔴 P0 |
| **useMMDCamera.ts** | Hook | 从 MikuMMDViewer 提取 | 🟡 P1 |
| **useMMDLoader.ts** | Hook | 从 MikuMMDViewer 提取 | 🟡 P1 |

---

## 🚀 快速开始（3 步走）

### Step 1: 环境准备（10 分钟）

```bash
# 1. 创建开发分支
git checkout -b feature/mmd-module-migration

# 2. 进入 mmd 模块目录
cd src/modules/mmd

# 3. 创建目录结构
mkdir -p components/MMDViewer components/MMDAnimationPlayer components/MMDCameraControl
mkdir -p hooks utils docs

# 4. 安装依赖
pnpm add ammo.js
```

---

### Step 2: 文件迁移（按优先级）

#### 2.1 迁移 MMDViewer (P0 - 最高优先级)
```bash
# 复制源文件
cp src/app/\(pages\)/gameField/mikutalking/components/MikuMMDViewer.tsx \
   src/modules/mmd/components/MMDViewer/MMDViewer.tsx

# 然后进行以下修改：
# ✅ 移除 mikutalking 特定路径（硬编码）
# ✅ 泛化 Props 接口
# ✅ 提取 fixTexturePath → utils/texturePathResolver.ts
# ✅ 添加 JSDoc 注释
# ✅ 创建 index.ts 导出
```

#### 2.2 迁移 MMDAnimationPlayer (P0)
```bash
# 复制源文件
cp src/app/\(pages\)/gameField/mikutalking/components/MMDPlayer.tsx \
   src/modules/mmd/components/MMDAnimationPlayer/MMDAnimationPlayer.tsx

# 然后进行以下修改：
# ✅ 移除硬编码动画路径
# ✅ 抽象音频播放逻辑
# ✅ 提取动画控制 → hooks/useMMDAnimation.ts
# ✅ 添加 JSDoc 注释
# ✅ 创建 index.ts 导出
```

#### 2.3 迁移 MMDCameraControl (P1)
```bash
# 复制源文件
cp src/app/\(pages\)/gameField/mikutalking/components/CameraControl.tsx \
   src/modules/mmd/components/MMDCameraControl/MMDCameraControl.tsx

# 然后进行以下修改：
# ✅ 提取样式配置为主题
# ✅ 添加自定义配置选项
# ✅ 提取相机控制逻辑 → hooks/useMMDCamera.ts
# ✅ 添加 JSDoc 注释
# ✅ 创建 index.ts 导出
```

---

### Step 3: 测试验证

```bash
# 启动开发服务器
pnpm dev

# 访问 MMD 查看器页面测试
open http://localhost:3000/mmd-viewer

# 检查清单：
# ✅ 模型能正常加载
# ✅ 纹理正确显示
# ✅ 相机控制流畅
# ✅ 动画播放正常
# ✅ 没有控制台错误
```

---

## 📋 详细迁移步骤（7 阶段）

### 🟢 第一阶段: 准备工作 (1-2 天)
- 创建分支
- 安装依赖
- 创建目录结构

### 🔵 第二阶段: 核心组件迁移 (3-5 天)
- 迁移 MMDViewer
- 迁移 MMDAnimationPlayer
- 迁移 MMDCameraControl

### 🟡 第三阶段: 工具函数和 Hooks (2-3 天)
- 创建 texturePathResolver.ts
- 创建 useMMDAnimation.ts
- 创建 useMMDCamera.ts
- 创建 useMMDLoader.ts

### 🟠 第四阶段: 类型定义 (1 天)
- 创建 types/animation.ts
- 创建 types/camera.ts
- 更新 types/index.ts

### 🔴 第五阶段: 文档编写 (1-2 天)
- 编写 USAGE.md
- 编写 MIGRATION_HISTORY.md

### 🟣 第六阶段: 集成测试 (2-3 天)
- 更新 MMDViewerPage.tsx
- 创建示例页面
- 在 mikutalking 中测试

### ⚫ 第七阶段: 清理和发布 (1 天)
- 更新模块入口
- 代码审查
- 提交合并

**总计工期:** 11-17 天

---

## 🎨 关键接口设计

### MMDViewer 组件接口
```typescript
interface MMDViewerProps {
  // 模型配置
  modelPath: string
  texturePath?: string
  
  // 场景配置
  backgroundColor?: string | number
  enableShadows?: boolean
  
  // 相机配置
  cameraPosition?: [number, number, number]
  cameraTarget?: [number, number, number]
  enableCameraControls?: boolean
  
  // 调试配置
  debugMode?: boolean
  showStats?: boolean
  
  // 回调函数
  onLoad?: (model: THREE.Group) => void
  onError?: (error: Error) => void
  onCameraReady?: (controls: CameraControls) => void
  onAnimationReady?: (controls: AnimationControls) => void
}
```

### MMDAnimationPlayer 组件接口
```typescript
interface MMDAnimationPlayerProps {
  modelRef: React.RefObject<THREE.Group>
  motionPath?: string
  cameraMotionPath?: string
  audioPath?: string
  autoPlay?: boolean
  loop?: boolean
  volume?: number
  enablePhysics?: boolean
  onReady?: (controls: PlaybackControls) => void
  onProgress?: (progress: number) => void
}
```

### MMDCameraControl 组件接口
```typescript
interface MMDCameraControlProps {
  onCameraMove: (deltaX: number, deltaY: number) => void
  onCameraZoom: (delta: number) => void
  onCameraElevate: (delta: number) => void
  onCameraReset: () => void
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'small' | 'medium' | 'large'
  theme?: 'light' | 'dark' | 'auto'
  showJoystick?: boolean
  showZoomButtons?: boolean
  showElevateButtons?: boolean
  showResetButton?: boolean
}
```

---

## 📊 迁移架构图

```
现状 (mikutalking)              目标 (mmd 模块)
    
┌──────────────┐                ┌──────────────────┐
│MikuTalkingGame│              │  MMDViewerPage   │
│  (游戏主体)   │──────────────▶│  (通用展示页)     │
└───────┬──────┘                └────────┬─────────┘
        │                                │
        ├─ MikuMMDViewer    ──────────▶ ├─ MMDViewer
        │  (1076行)                      │  (泛化后)
        │                                │
        ├─ MMDPlayer       ──────────▶ ├─ MMDAnimationPlayer
        │  (350行)                       │  (泛化后)
        │                                │
        ├─ CameraControl   ──────────▶ ├─ MMDCameraControl
        │  (364行)                       │  (泛化后)
        │                                │
        ├─ StatusBar                     │
        ├─ ItemBar          (保留在       │
        ├─ VoiceRecorder    mikutalking) │
        └─ ...                           └─ + 新增 Hooks 和工具
                                            + 完善文档
```

---

## ✅ 预期成果

### 迁移完成后你将获得：

#### 1. 独立的 MMD 组件库
```typescript
// 可在任何项目中使用
import { MMDViewer, MMDAnimationPlayer, MMDCameraControl } from '@/modules/mmd'

function MyApp() {
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

#### 2. 清晰的 API 设计
- 所有 Props 都有类型定义
- 完整的 JSDoc 注释
- 易于理解和使用

#### 3. 完善的文档
- 使用指南 (USAGE.md)
- 迁移历史 (MIGRATION_HISTORY.md)
- 快速参考 (MIGRATION_QUICK_REFERENCE.md)
- API 文档

#### 4. 可复用的 Hooks
```typescript
import { useMMDAnimation, useMMDCamera, useMMDLoader } from '@/modules/mmd'

// 在任何组件中使用
const { play, pause, stop, progress } = useMMDAnimation({
  modelRef,
  motionPath: '/actions/dance.vmd'
})
```

---

## 🔄 mikutalking 后续处理

### 推荐方案：完全替换

```typescript
// mikutalking/components/MikuTalkingGame.tsx

// 之前：使用本地组件
import MikuMMDViewer from './MikuMMDViewer'
import MMDPlayer from './MMDPlayer'
import CameraControl from './CameraControl'

// 之后：使用 mmd 模块
import { 
  MMDViewer, 
  MMDAnimationPlayer, 
  MMDCameraControl 
} from '@/modules/mmd'

// 只保留游戏特有的组件
import StatusBar from './StatusBar'
import ItemBar from './ItemBar'
import VoiceRecorder from './VoiceRecorder'
```

**优点:**
- 统一 MMD 功能实现
- 减少代码冗余
- 便于维护和更新
- 其他项目也可使用

---

## ⚡ 快捷命令速查

```bash
# 创建开发分支
git checkout -b feature/mmd-module-migration

# 创建目录
cd src/modules/mmd && \
mkdir -p components/MMDViewer components/MMDAnimationPlayer components/MMDCameraControl hooks utils docs

# 安装依赖
pnpm add ammo.js

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 运行类型检查
pnpm tsc --noEmit

# 运行 Linter
pnpm lint
```

---

## 📞 获取帮助

### 文档资源
1. **MIGRATION_PLAN.md** - 查看详细计划
2. **MIGRATION_CHECKLIST.md** - 跟踪进度
3. **MIGRATION_QUICK_REFERENCE.md** - 快速查阅

### 常见问题
- ❓ Three.js 版本不兼容 → 检查 package.json
- ❓ 纹理加载失败 → 检查路径配置
- ❓ 物理效果异常 → 确认 Ammo.js 已安装
- ❓ 性能问题 → 查看 DEVELOPMENT.md 优化建议

---

## 🎯 开始行动

### 下一步建议：

1. **阅读文档** (15 分钟)
   - 先读 MIGRATION_QUICK_REFERENCE.md 了解概览
   - 再读 MIGRATION_CHECKLIST.md 了解任务

2. **环境准备** (10 分钟)
   - 创建分支
   - 安装依赖
   - 创建目录

3. **开始迁移** (按优先级)
   - 先迁移 MMDViewer (P0)
   - 再迁移 MMDAnimationPlayer (P0)
   - 最后迁移 MMDCameraControl (P1)

4. **测试验证** (持续进行)
   - 每完成一个组件就测试
   - 确保功能正常
   - 及时修复问题

---

## 📊 项目信息

- **模块名称:** mmd
- **当前版本:** 1.0.0 (基础版)
- **目标版本:** 2.0.0 (迁移后)
- **预计工期:** 11-17 天
- **优先级:** P0 (高优先级)
- **状态:** 📋 规划完成，等待开始

---

**祝迁移顺利！** 🚀

如有任何问题，请参考详细文档或联系项目维护者。

---

**文档创建日期:** 2025-11-14  
**最后更新:** 2025-11-14  
**文档版本:** 1.0.0  
**作者:** Profile-V1 AI Assistant

