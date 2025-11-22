# SA2Kit MMD 模块集成说明

## 概述

本文档说明如何通过本地依赖的方式在项目中使用 `@sa2kit/mmd` 模块。

## 配置步骤

### 1. 添加本地依赖

在 `package.json` 中添加：

```json
{
  "dependencies": {
    "sa2kit": "file:../sa2kit"
  }
}
```

### 2. 安装依赖

```bash
pnpm install
```

## 使用方式

### 基本使用

```tsx
import { MMDPlayer, defaultMMDPreset } from 'sa2kit/mmd';

export default function MyPage() {
  return (
    <MMDPlayer
      resources={defaultMMDPreset.resources}
      stage={defaultMMDPreset.stage}
      autoPlay
      loop
      className="h-[600px] w-full"
    />
  );
}
```

### 使用预设

sa2kit/mmd 提供了以下预设：

1. **catchTheWavePreset** - 完整的MMD表演（模型+动作+相机+音频）
2. **defaultMMDPreset** - 默认模型（仅模型，无动作）
3. **simpleModelPreset** - 简单模型（轻量级测试模型）

```tsx
import { 
  MMDPlayer, 
  availableMMDPresets,
  catchTheWavePreset 
} from 'sa2kit/mmd';

export default function MyPage() {
  return (
    <MMDPlayer
      resources={catchTheWavePreset.resources}
      stage={catchTheWavePreset.stage}
      autoPlay
      loop
    />
  );
}
```

### 自定义配置

```tsx
import { MMDPlayer } from 'sa2kit/mmd';

export default function MyPage() {
  return (
    <MMDPlayer
      resources={{
        modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
        motionPath: '/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd',
        cameraPath: '/mikutalking/actions/CatchTheWave/camera.vmd',
        audioPath: '/mikutalking/actions/CatchTheWave/pv_268.wav',
      }}
      stage={{
        backgroundColor: '#01030b',
        cameraPosition: { x: 0, y: 10, z: 30 },
        cameraTarget: { x: 0, y: 10, z: 0 },
        enablePhysics: true,
        showGrid: false,
        // 自定义 Ammo.js 路径（可选，默认为下面的值）
        ammoPath: '/mikutalking/libs/ammo.wasm.js',
        ammoWasmPath: '/mikutalking/libs/',
      }}
      autoPlay
      loop
    />
  );
}
```

## API 文档

### MMDPlayer Props

```typescript
interface MMDPlayerEnhancedProps {
  /** MMD资源配置 */
  resources: MMDResources;
  /** 舞台配置 */
  stage?: MMDStage;
  /** 自动播放 */
  autoPlay?: boolean;
  /** 循环播放 */
  loop?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 加载完成回调 */
  onLoad?: () => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
}
```

### MMDResources

```typescript
interface MMDResources {
  /** 模型路径 */
  modelPath: string;
  /** 动作路径 */
  motionPath?: string;
  /** 相机路径 */
  cameraPath?: string;
  /** 音频路径 */
  audioPath?: string;
}
```

### MMDStage

```typescript
interface MMDStage {
  /** 背景色 */
  backgroundColor?: string;
  /** 相机初始位置 */
  cameraPosition?: { x: number; y: number; z: number };
  /** 相机目标位置 */
  cameraTarget?: { x: number; y: number; z: number };
  /** 启用物理引擎 */
  enablePhysics?: boolean;
  /** 启用网格 */
  showGrid?: boolean;
  /** Ammo.js 脚本路径（默认：'/mikutalking/libs/ammo.wasm.js'） */
  ammoPath?: string;
  /** Ammo WASM 文件的基础路径（默认：'/mikutalking/libs/'） */
  ammoWasmPath?: string;
}
```

### MMDPreset

```typescript
interface MMDPreset {
  /** 预设ID */
  id: string;
  /** 预设名称 */
  name: string;
  /** 预设简介 */
  summary: string;
  /** 预设标签 */
  badges?: string[];
  /** 资源配置 */
  resources: MMDResources;
  /** 舞台配置 */
  stage?: MMDStage;
}
```

## 资源放置

所有MMD资源文件应放置在 `public/mikutalking/` 目录下：

```
public/mikutalking/
├── models/              # 模型文件 (.pmx, .pmd)
│   ├── YYB_Z6SakuraMiku/
│   │   └── miku.pmx
│   └── test/
│       └── v4c5.0.pmx
├── actions/             # 动作文件 (.vmd)
│   └── CatchTheWave/
│       ├── mmd_CatchTheWave_motion.vmd
│       ├── camera.vmd
│       └── pv_268.wav
└── libs/               # 物理引擎库（可选）
    ├── ammo.wasm.js
    └── ammo.wasm.wasm
```

## 测试页面

项目中提供了一个完整的测试页面：

- 路径：`/testField/mmdTest`
- 页面位置：`src/app/(pages)/testField/(utility)/mmdTest/page.tsx`

访问该页面可以：
- 查看所有预设配置
- 测试不同的MMD资源组合
- 学习如何使用组件

## 特性

✅ **零配置使用** - 通过预设快速开始  
✅ **完全封装** - 无需了解Three.js或MMD细节  
✅ **资源本地化** - 所有资源从public目录加载  
✅ **物理引擎** - 自动加载Ammo.js实现物理效果  
✅ **响应式设计** - 自适应容器大小  
✅ **类型安全** - 完整的TypeScript类型定义  
✅ **播放控制** - 内置播放、暂停、停止控制  

## 注意事项

1. **物理引擎路径配置**：Ammo.js 路径通过 `stage.ammoPath` 和 `stage.ammoWasmPath` 配置，默认为 `/mikutalking/libs/`。如需自定义，请确保路径正确。
2. **模型文件**：PMX/PMD模型文件通常较大，建议优化加载体验
3. **浏览器兼容性**：需要支持WebGL的现代浏览器
4. **路径正确性**：确保资源路径相对于 `public` 目录

## 更新 SA2Kit

如果修改了 SA2Kit 源码：

```bash
# 1. 进入 sa2kit 目录
cd /Users/qihongrui/Desktop/sa2kit

# 2. 进行修改后重新构建
pnpm run build

# 3. 刷新浏览器即可（不需要重新 pnpm install，因为是本地依赖）
```

如果修改了 SA2Kit 的 package.json（添加/删除依赖）：

```bash
# 1. 进入 sa2kit 目录并安装新依赖
cd /Users/qihongrui/Desktop/sa2kit
pnpm install

# 2. 重新构建
pnpm run build

# 3. 返回项目目录并重新安装
cd /Users/qihongrui/Desktop/profile-v1
pnpm install
```

## 故障排除

### 模型加载失败

1. 检查模型文件路径是否正确
2. 确认文件存在于 `public` 目录
3. 查看浏览器控制台错误信息

### 物理效果不工作

1. 确认 `stage.enablePhysics` 设置为 `true`
2. 检查 Ammo.js 文件是否存在于配置的路径（默认：`public/mikutalking/libs/ammo.wasm.js`）
3. 确认 `stage.ammoPath` 和 `stage.ammoWasmPath` 配置正确
4. 查看控制台是否有Ammo.js加载错误

### 性能问题

1. 减少同时显示的模型数量
2. 使用较小的模型文件
3. 禁用不必要的物理效果

## 参考链接

- [SA2Kit 文档](https://github.com/sa2kit/sa2kit)
- [Three.js 文档](https://threejs.org/)
- [MMD格式说明](https://en.wikipedia.org/wiki/MikuMikuDance)

