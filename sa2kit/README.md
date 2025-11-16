# 🎭 SA2Kit - Super Anime 2D/3D Kit

一个基于 Three.js 的通用 MMD（MikuMikuDance）模型展示和动画播放库。

## 📦 功能特性

### 核心功能
- ✅ **PMX/PMD 模型加载** - 支持标准 MMD 模型格式
- ✅ **VMD 动画播放** - 完整的动画和相机运动支持
- ✅ **物理引擎** - 基于 Ammo.js 的真实物理效果
- ✅ **纹理映射** - 智能纹理路径解析和加载
- ✅ **相机控制** - 内置虚拟摇杆和按钮控制
- ✅ **音频同步** - 动画与音频完美同步

### 技术特点
- 🎨 **TypeScript** - 完整的类型定义
- 🔧 **React 支持** - 开箱即用的 React 组件
- 📦 **Tree-shakable** - 按需导入，减小包体积
- 🌐 **浏览器兼容** - 支持现代浏览器
- 📱 **移动端适配** - 响应式设计

## 📥 安装

```bash
# 使用 npm
npm install sa2kit three three-stdlib

# 使用 pnpm
pnpm add sa2kit three three-stdlib

# 使用 yarn
yarn add sa2kit three three-stdlib
```

## 🚀 快速开始

### 基础示例

```typescript
import { MMDViewer } from 'sa2kit'

function App() {
  return (
    <MMDViewer
      modelPath="/models/miku.pmx"
      enableCameraControls
      onLoad={(model) => console.log('模型加载完成', model)}
    />
  )
}
```

### 动画播放

```typescript
import { MMDViewer, MMDAnimationPlayer } from 'sa2kit'
import { useRef } from 'react'

function AnimatedApp() {
  const modelRef = useRef()
  
  return (
    <div>
      <MMDViewer
        modelPath="/models/miku.pmx"
        onLoad={(model) => {
          modelRef.current = model
        }}
      />
      <MMDAnimationPlayer
        modelRef={modelRef}
        motionPath="/animations/dance.vmd"
        audioPath="/animations/music.mp3"
        autoPlay
      />
    </div>
  )
}
```

### 相机控制

```typescript
import { MMDViewer, MMDCameraControl } from 'sa2kit'

function ControlledApp() {
  const [cameraControls, setCameraControls] = useState(null)
  
  return (
    <>
      <MMDViewer
        modelPath="/models/miku.pmx"
        onCameraReady={setCameraControls}
      />
      {cameraControls && (
        <MMDCameraControl
          onCameraMove={cameraControls.moveCamera}
          onCameraZoom={cameraControls.zoomCamera}
          onCameraElevate={cameraControls.elevateCamera}
          onCameraReset={cameraControls.resetCamera}
        />
      )}
    </>
  )
}
```

## 📚 API 文档

### MMDViewer

核心查看器组件，负责加载和渲染 MMD 模型。

```typescript
interface MMDViewerProps {
  // 模型配置
  modelPath: string                              // PMX/PMD 模型路径（必需）
  texturePath?: string                           // 纹理基础路径
  
  // 场景配置
  backgroundColor?: string | number              // 背景颜色
  enableShadows?: boolean                        // 启用阴影
  enableGrid?: boolean                           // 显示网格
  
  // 相机配置
  cameraPosition?: [number, number, number]      // 初始位置
  cameraTarget?: [number, number, number]        // 初始目标
  enableCameraControls?: boolean                 // 启用轨道控制
  
  // 调试配置
  debugMode?: boolean                            // 调试模式
  showStats?: boolean                            // 显示性能统计
  
  // 回调函数
  onLoad?: (model: THREE.Group) => void
  onProgress?: (progress: number) => void
  onError?: (error: Error) => void
  onCameraReady?: (controls: CameraControls) => void
}
```

### MMDAnimationPlayer

动画播放组件，支持 VMD 动画文件和音频同步。

```typescript
interface MMDAnimationPlayerProps {
  modelRef: React.RefObject<THREE.Group>         // 模型引用（必需）
  motionPath?: string                            // VMD 动作文件
  cameraMotionPath?: string                      // VMD 镜头文件
  audioPath?: string                             // 音频文件
  autoPlay?: boolean                             // 自动播放
  loop?: boolean                                 // 循环播放
  volume?: number                                // 音量 (0-1)
  enablePhysics?: boolean                        // 启用物理效果
  onReady?: (controls: PlaybackControls) => void
  onProgress?: (progress: number) => void
}
```

### MMDCameraControl

相机控制 UI 组件，提供虚拟摇杆和按钮。

```typescript
interface MMDCameraControlProps {
  onCameraMove: (deltaX: number, deltaY: number) => void
  onCameraZoom: (delta: number) => void
  onCameraElevate: (delta: number) => void
  onCameraReset: () => void
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme?: 'light' | 'dark' | 'auto'
  showJoystick?: boolean
  showZoomButtons?: boolean
  showElevateButtons?: boolean
}
```

## 🔧 Hooks

### useMMDAnimation

动画管理 Hook。

```typescript
const { play, pause, stop, progress, duration } = useMMDAnimation({
  modelRef,
  motionPath: '/animations/dance.vmd',
  autoPlay: false
})
```

### useMMDCamera

相机控制 Hook。

```typescript
const { moveCamera, zoomCamera, elevateCamera, resetCamera } = useMMDCamera({
  cameraRef,
  controlsRef
})
```

### useMMDLoader

模型加载 Hook。

```typescript
const { model, isLoading, progress, error } = useMMDLoader({
  modelPath: '/models/miku.pmx',
  onLoad: (model) => console.log('加载完成', model)
})
```

## 🛠️ 工具函数

### resolveTexturePath

智能解析 MMD 模型的纹理路径。

```typescript
import { resolveTexturePath } from 'sa2kit/utils'

const texturePath = resolveTexturePath(
  'tex/body.png',
  {
    basePath: '/models/miku',
    subdirectories: {
      texture: 'tex',
      sphere: 'spa',
      toon: 'toon'
    }
  }
)
```

## 📖 示例项目

查看 [examples](./examples) 目录获取更多示例：

- [基础查看器](./examples/basic-viewer)
- [动画播放](./examples/animation-player)
- [相机控制](./examples/camera-control)
- [完整应用](./examples/full-app)

## 🤝 贡献指南

欢迎贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

## 📄 许可证

MIT License © 2024 SA2Kit

## 🔗 相关链接

- [Three.js 官网](https://threejs.org/)
- [MMD 官网](https://sites.google.com/view/evpvp/)
- [GitHub 仓库](https://github.com/yourusername/sa2kit)
- [文档网站](https://sa2kit.dev)

## 🙏 致谢

- [Three.js](https://threejs.org/) - 3D 渲染引擎
- [three-stdlib](https://github.com/pmndrs/three-stdlib) - Three.js 扩展库
- [mmd-parser](https://github.com/takahirox/mmd-parser) - MMD 文件解析器
- [Ammo.js](https://github.com/kripken/ammo.js/) - 物理引擎

