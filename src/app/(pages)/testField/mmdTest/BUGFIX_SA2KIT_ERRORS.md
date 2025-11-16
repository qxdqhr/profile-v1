# SA2Kit 错误修复报告

## 问题描述

在使用 `sa2kit` 库时遇到以下错误:

### 1. Spread 语法错误
```
TypeError: Spread syntax requires ...iterable[Symbol.iterator] to be a function
at MMDViewer.tsx:281:21
```

### 2. 导出错误
```
export 'DEFAULT_VIEWER_PROPS' (reexported as 'DEFAULT_VIEWER_PROPS') was not found in './constants/defaults'
```

## 根本原因

1. **Spread 语法错误**: `DEFAULT_VIEWER_CONFIG` 中的 `cameraPosition` 和 `cameraTarget` 属性没有正确类型化为元组类型。
2. **导出错误**: `sa2kit/src/index.ts` 尝试导出不存在的常量名称。
3. **缺少 Props**: `MMDViewerProps` 接口缺少物理引擎相关的 props (`ammoJsPath`, `ammoWasmPath`, `enablePhysics` 等)。

## 修复方案

### 1. 修复 `sa2kit/src/types/viewer.ts`

添加缺少的物理引擎配置 props:

```typescript
// ===== 物理引擎配置 =====
/** Ammo.js JS 文件路径 */
ammoJsPath?: string
/** Ammo.js WASM 文件路径 */
ammoWasmPath?: string
/** 是否启用物理引擎（默认: true）*/
enablePhysics?: boolean
/** 是否启用 IK（反向运动学）（默认: true）*/
enableIK?: boolean
/** 是否启用 Grant（默认: true）*/
enableGrant?: boolean
/** 是否启用地面（默认: true）*/
enableGround?: boolean
```

### 2. 修复 `sa2kit/src/components/MMDViewer/MMDViewer.tsx`

在组件的 props 解构中添加物理引擎配置:

```typescript
// Physics config
ammoJsPath,
ammoWasmPath,
enablePhysics = true,
enableIK = true,
enableGrant = true,
enableGround = true,
```

### 3. 修复 `sa2kit/src/constants/defaults.ts`

为 `cameraPosition` 和 `cameraTarget` 正确指定元组类型:

```typescript
export const DEFAULT_VIEWER_CONFIG: {
  // ... 其他类型
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
  // ...
} = {
  // 相机配置
  cameraPosition: [0, 10, 25],
  cameraTarget: [0, 8, 0],
  // ...
}
```

### 4. 修复 `sa2kit/src/index.ts`

导出正确的常量:

```typescript
// ===== Constants =====
export {
  DEFAULT_VIEWER_CONFIG,
  DEFAULT_CAMERA_CONTROL_CONFIG,
  TEXTURE_SUBDIRECTORIES,
  SUPPORTED_MODEL_EXTENSIONS,
  SUPPORTED_ANIMATION_EXTENSIONS,
  SUPPORTED_AUDIO_EXTENSIONS,
  SUPPORTED_TEXTURE_EXTENSIONS,
  AMMO_CONFIG,
  VERSION,
} from './constants/defaults'
```

## 当前限制

### MMDViewer 动画支持

当前的 `MMDViewer` 组件**不支持**直接通过 `motionPath`、`cameraAnimationPath` 和 `audioPath` props 加载和播放动画。

虽然这些 props 在接口中定义,但内部实现缺少:
- `MMDAnimationHelper` 初始化
- VMD 动画文件加载
- 音频同步
- 物理引擎初始化

### 建议的使用方式

#### 方式 1: 仅加载模型（推荐用于当前版本）

```tsx
<MMDViewer
  modelPath="/path/to/model.pmx"
  ammoJsPath="/path/to/ammo.wasm.js"
  ammoWasmPath="/path/to/ammo.wasm.wasm"
  enablePhysics={true}
  onLoadComplete={() => console.log('Model loaded')}
/>
```

#### 方式 2: 使用专门的动画组件（未来）

等待 `MMDAnimationPlayer` 组件完成,或使用 `useMMDLoader` + `useMMDAnimation` hooks 手动管理。

## 验证步骤

1. ✅ TypeScript 类型检查通过
2. ✅ 导出错误已修复
3. ✅ Spread 语法错误已修复
4. ⏸️ 动画功能待实现

## 下一步计划

为了完整支持 MMD 动画,需要在 `MMDViewer` 组件中:

1. 实现 `initAmmo` 调用(when `enablePhysics` is true)
2. 创建 `MMDAnimationHelper` 实例
3. 加载 VMD 动画文件
4. 实现音频同步
5. 暴露 `AnimationControls` 接口
6. 添加动画播放/停止/暂停控制

## 修复日期

2024-11-15

## 修复人员

SA2Kit 开发团队



