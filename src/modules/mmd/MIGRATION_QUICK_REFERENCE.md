# MMD 模块迁移快速参考

## 🗺️ 文件映射表

```
mikutalking/                                    mmd/
├── components/                                 ├── components/
│   ├── MikuMMDViewer.tsx         →            │   └── MMDViewer/
│   │   (1076 行，核心3D渲染)                   │       └── MMDViewer.tsx
│   │                                           │
│   ├── MMDPlayer.tsx             →            │   └── MMDAnimationPlayer/
│   │   (350 行，动画播放)                      │       └── MMDAnimationPlayer.tsx
│   │                                           │
│   └── CameraControl.tsx         →            │   └── MMDCameraControl/
│       (364 行，相机控制UI)                    │       └── MMDCameraControl.tsx
│                                               │
├── hooks/                                      ├── hooks/
│   └── useAnimationManager.ts    →            │   ├── useMMDAnimation.ts  (新)
│       (部分逻辑)                              │   ├── useMMDCamera.ts     (新)
│                                               │   └── useMMDLoader.ts     (新)
│                                               │
└── (纹理路径处理逻辑)            →            └── utils/
    (内嵌在 MikuMMDViewer 中)                       └── texturePathResolver.ts (新)
```

---

## 🎯 核心迁移任务 (Top 3)

### 1️⃣ MMDViewer 组件 (最高优先级)
```typescript
// 源文件
src/app/(pages)/gameField/mikutalking/components/MikuMMDViewer.tsx

// 目标文件
src/modules/mmd/components/MMDViewer/MMDViewer.tsx

// 主要工作
✅ 复制基础代码
✅ 移除 mikutalking 特定逻辑
✅ 泛化 Props 接口
✅ 提取纹理路径处理 → texturePathResolver.ts
✅ 添加完整的 JSDoc 注释
```

### 2️⃣ MMDAnimationPlayer 组件
```typescript
// 源文件
src/app/(pages)/gameField/mikutalking/components/MMDPlayer.tsx

// 目标文件
src/modules/mmd/components/MMDAnimationPlayer/MMDAnimationPlayer.tsx

// 主要工作
✅ 复制基础代码
✅ 移除硬编码路径
✅ 抽象音频播放逻辑
✅ 提取动画控制 → useMMDAnimation.ts
✅ 支持动画列表切换
```

### 3️⃣ MMDCameraControl 组件
```typescript
// 源文件
src/app/(pages)/gameField/mikutalking/components/CameraControl.tsx

// 目标文件
src/modules/mmd/components/MMDCameraControl/MMDCameraControl.tsx

// 主要工作
✅ 复制基础代码
✅ 提取样式配置
✅ 添加自定义主题支持
✅ 提取相机控制逻辑 → useMMDCamera.ts
```

---

## 📊 依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│                     MMD 模块架构                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│   MMDViewerPage     │  ← 页面层（使用者）
│   (使用组件)         │
└──────────┬──────────┘
           │
           ↓
┌──────────────────────────────────────────────────────────┐
│                      组件层                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │  MMDViewer   │  │MMDAnimationPlayer│  │MMDCamera   ││
│  │  (核心组件)   │←─│  (动画播放)      │  │Control     ││
│  │              │  │                  │  │(相机控制)   ││
│  └──────┬───────┘  └────────┬─────────┘  └─────┬──────┘│
│         │                   │                   │       │
└─────────┼───────────────────┼───────────────────┼───────┘
          │                   │                   │
          ↓                   ↓                   ↓
┌──────────────────────────────────────────────────────────┐
│                      Hooks 层                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │useMMDLoader  │  │useMMDAnimation│ │useMMDCamera  │  │
│  │(模型加载)     │  │(动画管理)     │  │(相机控制)     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
└─────────┼──────────────────┼──────────────────┼──────────┘
          │                  │                  │
          ↓                  ↓                  ↓
┌──────────────────────────────────────────────────────────┐
│                      工具层                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │texturePathResolver │  │ sceneUtils   │  │ others  │ │
│  │(纹理路径解析)       │  │ (场景工具)    │  │         │ │
│  └────────────────────┘  └──────────────┘  └─────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
          │                  │                  │
          ↓                  ↓                  ↓
┌──────────────────────────────────────────────────────────┐
│                    外部依赖层                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Three.js  │  three-stdlib  │  mmd-parser  │  Ammo.js  │
│  (渲染)    │  (MMD支持)     │  (解析)      │  (物理)    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🔑 关键代码片段

### 1. 纹理路径处理 (从 MikuMMDViewer 提取)

```typescript
// 源代码位置: MikuMMDViewer.tsx (约第 299-342 行)
const fixTexturePath = (url: string): string => {
  // 1. 修正中文路径和目录名
  let fixedUrl = url
    .replace(/YYB_Z6[^/]*2\.0/g, 'YYB_Z6SakuraMiku')
    .replace(/%E6%B0%B4%E6%89%8B%E6%A8%B1%E6%9C%AA%E6%9D%A5/g, 'YYB_Z6SakuraMiku')
    .replace(/YYB_Z6水手樱未来2\.0/g, 'YYB_Z6SakuraMiku')
    .replace(/\\/g, '/')
  
  // 2. 检查路径是否已经包含正确的子目录结构
  const hasSubdir = fixedUrl.match(/\/(spa|toon|tex|tex_02)\/[^/]+$/i)
  if (hasSubdir) {
    return fixedUrl
  }
  
  // 3. 根据文件名判断应该在哪个子目录
  const fileName = fixedUrl.split('/').pop() || ''
  const lowerFileName = fileName.toLowerCase()
  
  let subdir = ''
  if (lowerFileName.startsWith('spa-') || lowerFileName === 'km.png') {
    subdir = 'spa'
  } else if (lowerFileName.startsWith('toon-') || /^s\d+\.bmp$/.test(lowerFileName)) {
    subdir = 'toon'
  } else if (lowerFileName.includes('sakura') || lowerFileName.includes('体-') || 
             lowerFileName === 'tex.png' || lowerFileName === 'tex2.png' || 
             lowerFileName.includes('体b')) {
    subdir = 'tex_02'
  } else if (lowerFileName.endsWith('.png') || lowerFileName.endsWith('.bmp') || 
             lowerFileName.endsWith('.psd') || lowerFileName.endsWith('.jpg')) {
    subdir = 'tex'
  }
  
  // 4. 插入子目录
  if (subdir) {
    fixedUrl = fixedUrl.replace(
      new RegExp(`(${modelBasePath.replace(/\//g, '\\/')}/)([^/]+)$`),
      `$1${subdir}/$2`
    )
  }
  return fixedUrl
}

// 目标: 提取为 texturePathResolver.ts
```

---

### 2. 物理引擎重置 (从 MMDPlayer 提取)

```typescript
// 源代码位置: MikuMMDViewer.tsx (约第 535-563 行)
// 清理旧的 helper（避免物理效果累积）
if (helperRef.current) {
  debugLog('🧹 清理旧的 MMDAnimationHelper')
  if (modelRef.current) {
    modelRef.current.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh) {
        try { helperRef.current?.remove(child) } catch (e) { /* 忽略 */ }
      }
    })
  }
  if (cameraRef.current) {
    try { helperRef.current.remove(cameraRef.current) } catch (e) { /* 忽略 */ }
  }
  helperRef.current = null
}

// Recreate MMDAnimationHelper
helperRef.current = new MMDAnimationHelper()
debugLog('🎬 MMDAnimationHelper已重新初始化（物理世界已重置）')

// 目标: 集成到 useMMDAnimation.ts
```

---

### 3. 相机控制接口 (从 MikuMMDViewer 提取)

```typescript
// 源代码位置: MikuMMDViewer.tsx (约第 390-441 行)
onCameraReady({
  moveCamera: (deltaX: number, deltaY: number) => {
    if (controlsRef.current && cameraRef.current) {
      const camera = cameraRef.current
      const target = controlsRef.current.target
      const offset = new THREE.Vector3().subVectors(camera.position, target)
      const spherical = new THREE.Spherical().setFromVector3(offset)
      
      spherical.theta -= deltaX
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - deltaY))
      
      offset.setFromSpherical(spherical)
      camera.position.copy(target).add(offset)
      controlsRef.current.update()
    }
  },
  zoomCamera: (delta: number) => { /* ... */ },
  elevateCamera: (delta: number) => { /* ... */ },
  resetCamera: () => { /* ... */ }
})

// 目标: 提取为 useMMDCamera.ts
```

---

## 🎨 Props 接口设计

### MMDViewer Props (新设计)
```typescript
interface MMDViewerProps {
  // ===== 模型配置 =====
  modelPath: string                              // PMX/PMD 模型路径
  texturePath?: string                           // 纹理基础路径（可选）
  
  // ===== 场景配置 =====
  backgroundColor?: string | number              // 背景颜色 (默认: #1a1a2e)
  enableShadows?: boolean                        // 启用阴影 (默认: false)
  enableGrid?: boolean                           // 显示网格 (默认: false)
  
  // ===== 相机配置 =====
  cameraPosition?: [number, number, number]      // 初始位置 (默认: [0, 25, 25])
  cameraTarget?: [number, number, number]        // 初始目标 (默认: [0, 8, 0])
  cameraFov?: number                             // 视野角度 (默认: 45)
  enableCameraControls?: boolean                 // 启用轨道控制 (默认: true)
  
  // ===== 调试配置 =====
  debugMode?: boolean                            // 调试模式 (默认: false)
  showStats?: boolean                            // 显示性能统计 (默认: false)
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug'  // 日志级别
  
  // ===== 回调函数 =====
  onLoad?: (model: THREE.Group) => void          // 模型加载成功
  onProgress?: (progress: number) => void        // 加载进度 (0-100)
  onError?: (error: Error) => void               // 加载错误
  onCameraReady?: (controls: CameraControls) => void  // 相机控制就绪
  onAnimationReady?: (controls: AnimationControls) => void  // 动画控制就绪
  
  // ===== 样式配置 =====
  className?: string                             // 容器类名
  style?: React.CSSProperties                    // 容器样式
}
```

---

### MMDAnimationPlayer Props (新设计)
```typescript
interface MMDAnimationPlayerProps {
  // ===== 必需配置 =====
  modelRef: React.RefObject<THREE.Group>         // 模型引用（必须）
  
  // ===== 动画配置 =====
  motionPath?: string                            // VMD 动作文件路径
  cameraMotionPath?: string                      // VMD 镜头文件路径
  audioPath?: string                             // 音频文件路径
  
  // ===== 播放控制 =====
  autoPlay?: boolean                             // 自动播放 (默认: false)
  loop?: boolean                                 // 循环播放 (默认: false)
  volume?: number                                // 音量 (0-1, 默认: 0.7)
  playbackRate?: number                          // 播放速度 (0.5-2.0, 默认: 1.0)
  
  // ===== 物理引擎 =====
  enablePhysics?: boolean                        // 启用物理效果 (默认: true)
  physicsGravity?: number                        // 重力大小 (默认: -9.8)
  
  // ===== 回调函数 =====
  onReady?: (controls: PlaybackControls) => void // 播放器就绪
  onPlay?: () => void                            // 开始播放
  onPause?: () => void                           // 暂停播放
  onStop?: () => void                            // 停止播放
  onProgress?: (progress: number) => void        // 播放进度 (0-1)
  onEnd?: () => void                             // 播放结束
  onError?: (error: Error) => void               // 播放错误
  
  // ===== 调试配置 =====
  debugMode?: boolean                            // 调试模式
}
```

---

### MMDCameraControl Props (新设计)
```typescript
interface MMDCameraControlProps {
  // ===== 回调函数（必需） =====
  onCameraMove: (deltaX: number, deltaY: number) => void
  onCameraZoom: (delta: number) => void
  onCameraElevate: (delta: number) => void
  onCameraReset: () => void
  
  // ===== UI 配置 =====
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'  // 位置 (默认: bottom-right)
  size?: 'small' | 'medium' | 'large'            // 大小 (默认: medium)
  theme?: 'light' | 'dark' | 'auto'              // 主题 (默认: dark)
  
  // ===== 功能开关 =====
  showJoystick?: boolean                         // 显示摇杆 (默认: true)
  showZoomButtons?: boolean                      // 显示缩放按钮 (默认: true)
  showElevateButtons?: boolean                   // 显示升降按钮 (默认: true)
  showResetButton?: boolean                      // 显示重置按钮 (默认: true)
  
  // ===== 灵敏度配置 =====
  moveSensitivity?: number                       // 移动灵敏度 (默认: 0.03)
  zoomSensitivity?: number                       // 缩放灵敏度 (默认: 0.5)
  elevateSensitivity?: number                    // 升降灵敏度 (默认: 0.5)
  
  // ===== 样式配置 =====
  className?: string                             // 容器类名
  style?: React.CSSProperties                    // 容器样式
}
```

---

## ⚡ 快速命令

### 创建目录结构
```bash
cd src/modules/mmd
mkdir -p components/MMDViewer components/MMDAnimationPlayer components/MMDCameraControl
mkdir -p hooks utils docs
touch components/MMDViewer/index.ts components/MMDViewer/MMDViewer.tsx
touch components/MMDAnimationPlayer/index.ts components/MMDAnimationPlayer/MMDAnimationPlayer.tsx
touch components/MMDCameraControl/index.ts components/MMDCameraControl/MMDCameraControl.tsx
touch hooks/useMMDAnimation.ts hooks/useMMDCamera.ts hooks/useMMDLoader.ts
touch utils/texturePathResolver.ts
touch docs/USAGE.md docs/MIGRATION_HISTORY.md
```

### 安装依赖
```bash
pnpm add ammo.js
```

### 复制源文件
```bash
# 复制核心组件到新位置（手动编辑后使用）
cp src/app/\(pages\)/gameField/mikutalking/components/MikuMMDViewer.tsx \
   src/modules/mmd/components/MMDViewer/MMDViewer.tsx

cp src/app/\(pages\)/gameField/mikutalking/components/MMDPlayer.tsx \
   src/modules/mmd/components/MMDAnimationPlayer/MMDAnimationPlayer.tsx

cp src/app/\(pages\)/gameField/mikutalking/components/CameraControl.tsx \
   src/modules/mmd/components/MMDCameraControl/MMDCameraControl.tsx
```

---

## 📝 验证清单

### 迁移完成后的测试步骤

#### 1. 基础功能测试
```bash
# 启动开发服务器
pnpm dev

# 访问 MMD 查看器页面
open http://localhost:3000/mmd-viewer
```

#### 2. 检查清单
- [ ] 模型能正常加载显示
- [ ] 纹理正确映射
- [ ] 相机控制响应流畅
- [ ] 动画播放正常
- [ ] 物理效果正确
- [ ] 音频同步播放
- [ ] 移动端适配正常
- [ ] 没有内存泄漏
- [ ] 没有控制台错误

#### 3. 在 mikutalking 中测试
```typescript
// 在 mikutalking/components/MikuTalkingGame.tsx 中
import { MMDViewer, MMDAnimationPlayer, MMDCameraControl } from '@/modules/mmd'

// 替换原有组件并测试
```

---

## 🎯 预期成果

### 迁移前（mikutalking）
```
❌ 代码分散在 mikutalking 游戏中
❌ 与游戏逻辑强耦合
❌ 难以在其他项目中复用
❌ 路径硬编码
```

### 迁移后（mmd 模块）
```
✅ 独立的 MMD 组件库
✅ 清晰的 API 接口
✅ 可在任何项目中使用
✅ 完善的文档和示例
✅ 类型安全
✅ 易于维护和扩展
```

---

## 📞 需要帮助？

遇到问题时，请检查：
1. Three.js 版本是否一致
2. 依赖是否正确安装
3. 路径是否正确配置
4. 浏览器控制台错误信息
5. 网络请求是否成功

---

**文档版本:** 1.0.0  
**最后更新:** 2025-11-14  
**维护者:** Profile-V1 Team

