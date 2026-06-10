# MMD 下拉框独立选择模式文档

## 功能概述

MMDPlayerEnhanced 组件支持**下拉框独立选择模式**，允许用户通过设置弹窗中的下拉框，独立选择模型、动作、音乐和相机，实现灵活的资源组合。

## 与预设组合模式的区别

| 特性 | 预设组合模式 | 下拉框选择模式 |
|------|------------|--------------|
| 参数 | `resourcesList` | `resourceOptions` |
| UI | 列表选择 | 下拉框选择 |
| 灵活性 | 固定组合 | 自由组合 |
| 适用场景 | 预定义的完整配置 | 需要用户自定义组合 |

## 核心类型定义

### MMDResourceOption

```typescript
interface MMDResourceOption {
  /** 选项 ID */
  id: string;
  /** 选项名称 */
  name: string;
  /** 资源路径 */
  path: string;
}
```

### MMDResourceOptions

```typescript
interface MMDResourceOptions {
  /** 模型选项列表 */
  models?: MMDResourceOption[];
  /** 动作选项列表 */
  motions?: MMDResourceOption[];
  /** 音频选项列表 */
  audios?: MMDResourceOption[];
  /** 相机选项列表 */
  cameras?: MMDResourceOption[];
}
```

### Props 扩展

```typescript
interface MMDPlayerEnhancedProps {
  // ... 其他属性
  
  /** MMD资源选项列表（用于下拉框独立选择） */
  resourceOptions?: MMDResourceOptions;
  
  /** 默认选中的资源（当使用 resourceOptions 时） */
  defaultSelection?: {
    modelId?: string;
    motionId?: string;
    audioId?: string;
    cameraId?: string;
  };
  
  /** 资源选择回调（resourceOptions 模式） */
  onSelectionChange?: (selection: {
    modelId?: string;
    motionId?: string;
    audioId?: string;
    cameraId?: string;
  }) => void;
}
```

## 使用示例

### 基础用法

```typescript
import { MMDPlayerEnhanced, type MMDResourceOptions } from 'sa2kit/mmd';

const resourceOptions: MMDResourceOptions = {
  models: [
    {
      id: 'miku',
      name: '初音未来',
      path: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
    },
    {
      id: 'elsa',
      name: '艾尔莎',
      path: '/mikutalking/models/艾尔莎/艾尔莎-水手服泳装.pmx',
    },
  ],
  motions: [
    {
      id: 'catch-the-wave',
      name: 'Catch The Wave',
      path: '/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd',
    },
  ],
  audios: [
    {
      id: 'catch-the-wave-audio',
      name: 'Catch The Wave 音乐',
      path: '/mikutalking/actions/CatchTheWave/pv_268.wav',
    },
  ],
  cameras: [
    {
      id: 'catch-the-wave-camera',
      name: 'Catch The Wave 镜头',
      path: '/mikutalking/actions/CatchTheWave/camera.vmd',
    },
  ],
};

export default function MMDPage() {
  return (
    <MMDPlayerEnhanced
      resourceOptions={resourceOptions}
      defaultSelection={{
        modelId: 'miku',
        motionId: 'catch-the-wave',
        audioId: 'catch-the-wave-audio',
        cameraId: 'catch-the-wave-camera',
      }}
      stage={{
        backgroundColor: '#01030b',
        enablePhysics: true,
        ammoPath: '/mikutalking/libs/ammo.wasm.js',
        ammoWasmPath: '/mikutalking/libs/',
      }}
      autoPlay
      loop
      onSelectionChange={(selection) => {
        console.log('用户选择:', selection);
      }}
    />
  );
}
```

### 只提供部分选项

```typescript
// 只提供模型和动作，不提供音乐和相机
const resourceOptions: MMDResourceOptions = {
  models: [
    { id: 'miku', name: '初音未来', path: '/models/miku.pmx' },
    { id: 'elsa', name: '艾尔莎', path: '/models/elsa.pmx' },
  ],
  motions: [
    { id: 'dance1', name: '舞蹈1', path: '/actions/dance1.vmd' },
    { id: 'dance2', name: '舞蹈2', path: '/actions/dance2.vmd' },
  ],
};

// 只会显示模型和动作两个下拉框
```

### 监听选择变化

```typescript
export default function MMDPage() {
  const handleSelectionChange = (selection: {
    modelId?: string;
    motionId?: string;
    audioId?: string;
    cameraId?: string;
  }) => {
    console.log('模型:', selection.modelId);
    console.log('动作:', selection.motionId);
    console.log('音乐:', selection.audioId);
    console.log('相机:', selection.cameraId);
    
    // 可以在这里保存用户的选择到 localStorage
    localStorage.setItem('mmd-selection', JSON.stringify(selection));
  };

  return (
    <MMDPlayerEnhanced
      resourceOptions={resourceOptions}
      onSelectionChange={handleSelectionChange}
      autoPlay
      loop
    />
  );
}
```

## UI 界面

### 设置按钮

- 位置：播放控制栏右侧
- 图标：⚙️
- 显示条件：提供了 `resourceOptions` 参数
- 点击后打开设置弹窗

### 设置弹窗

弹窗包含以下元素：

1. **标题栏**
   - 标题："选择资源"
   - 关闭按钮（✕）

2. **下拉框区域**
   - 模型下拉框（如果提供了 `models`）
   - 动作下拉框（如果提供了 `motions`，可选择"无"）
   - 音乐下拉框（如果提供了 `audios`，可选择"无"）
   - 相机下拉框（如果提供了 `cameras`，可选择"无"）

3. **确认按钮**
   - 关闭弹窗并应用选择

### 样式特点

- 现代化渐变背景
- 毛玻璃效果
- 响应式设计
- 平滑过渡动画
- 悬停高亮效果

## 选择流程

1. 用户点击设置按钮（⚙️）
2. 打开设置弹窗，显示所有可用的下拉框
3. 用户在下拉框中选择资源
4. 每次选择后自动触发资源切换：
   - 停止当前播放
   - 更新选中的资源
   - 标记需要重新加载
   - 触发重新加载流程
   - 调用 `onSelectionChange` 回调
5. 用户点击"确认"按钮关闭弹窗

## 资源组合示例

### 示例 1：多模型 + 单动作

```typescript
const resourceOptions: MMDResourceOptions = {
  models: [
    { id: 'miku', name: '初音未来', path: '/models/miku.pmx' },
    { id: 'luka', name: '巡音流歌', path: '/models/luka.pmx' },
    { id: 'rin', name: '镜音铃', path: '/models/rin.pmx' },
  ],
  motions: [
    { id: 'wave', name: 'Catch The Wave', path: '/actions/wave.vmd' },
  ],
};

// 用户可以选择：
// - 初音未来 + Catch The Wave
// - 巡音流歌 + Catch The Wave
// - 镜音铃 + Catch The Wave
```

### 示例 2：单模型 + 多动作

```typescript
const resourceOptions: MMDResourceOptions = {
  models: [
    { id: 'miku', name: '初音未来', path: '/models/miku.pmx' },
  ],
  motions: [
    { id: 'wave', name: 'Catch The Wave', path: '/actions/wave.vmd' },
    { id: 'dance', name: '极乐净土', path: '/actions/dance.vmd' },
    { id: 'sing', name: '千本樱', path: '/actions/sing.vmd' },
  ],
  audios: [
    { id: 'wave-audio', name: 'Catch The Wave', path: '/audio/wave.wav' },
    { id: 'dance-audio', name: '极乐净土', path: '/audio/dance.wav' },
    { id: 'sing-audio', name: '千本樱', path: '/audio/sing.wav' },
  ],
};

// 用户可以选择：
// - 初音未来 + Catch The Wave + Catch The Wave 音乐
// - 初音未来 + 极乐净土 + 极乐净土音乐
// - 初音未来 + 千本樱 + 千本樱音乐
// 或任意组合（例如：初音未来 + Catch The Wave + 千本樱音乐）
```

### 示例 3：完全自由组合

```typescript
const resourceOptions: MMDResourceOptions = {
  models: [
    { id: 'miku', name: '初音未来', path: '/models/miku.pmx' },
    { id: 'elsa', name: '艾尔莎', path: '/models/elsa.pmx' },
  ],
  motions: [
    { id: 'wave', name: 'Catch The Wave', path: '/actions/wave.vmd' },
    { id: 'dance', name: '极乐净土', path: '/actions/dance.vmd' },
  ],
  audios: [
    { id: 'wave-audio', name: 'Catch The Wave', path: '/audio/wave.wav' },
    { id: 'dance-audio', name: '极乐净土', path: '/audio/dance.wav' },
    { id: 'custom', name: '自定义音乐', path: '/audio/custom.mp3' },
  ],
  cameras: [
    { id: 'wave-cam', name: 'Catch The Wave 镜头', path: '/camera/wave.vmd' },
    { id: 'dance-cam', name: '极乐净土镜头', path: '/camera/dance.vmd' },
  ],
};

// 用户可以自由组合，例如：
// - 初音未来 + Catch The Wave + 极乐净土音乐 + Catch The Wave 镜头
// - 艾尔莎 + 极乐净土 + 自定义音乐 + 无镜头
// - 任意模型 + 无动作 + 无音乐 + 无镜头（静态展示）
```

## 技术实现

### 状态管理

```typescript
const [selectedModelId, setSelectedModelId] = useState<string>(
  defaultSelection?.modelId || resourceOptions?.models?.[0]?.id || ''
);
const [selectedMotionId, setSelectedMotionId] = useState<string>(
  defaultSelection?.motionId || ''
);
const [selectedAudioId, setSelectedAudioId] = useState<string>(
  defaultSelection?.audioId || ''
);
const [selectedCameraId, setSelectedCameraId] = useState<string>(
  defaultSelection?.cameraId || ''
);
```

### 资源计算

```typescript
const currentResources = useMemo(() => {
  if (resourceOptions) {
    const model = resourceOptions.models?.find(m => m.id === selectedModelId);
    const motion = resourceOptions.motions?.find(m => m.id === selectedMotionId);
    const audio = resourceOptions.audios?.find(a => a.id === selectedAudioId);
    const camera = resourceOptions.cameras?.find(c => c.id === selectedCameraId);
    
    return {
      modelPath: model?.path || resourceOptions.models?.[0]?.path || '',
      motionPath: motion?.path,
      audioPath: audio?.path,
      cameraPath: camera?.path,
    };
  }
  // ... 其他模式
}, [resourceOptions, selectedModelId, selectedMotionId, selectedAudioId, selectedCameraId]);
```

### 选择处理

```typescript
const handleSelectionChange = (
  type: 'model' | 'motion' | 'audio' | 'camera', 
  id: string
) => {
  // 停止当前播放
  if (isPlaying) {
    stop();
  }

  // 更新选中的资源
  if (type === 'model') setSelectedModelId(id);
  if (type === 'motion') setSelectedMotionId(id);
  if (type === 'audio') setSelectedAudioId(id);
  if (type === 'camera') setSelectedCameraId(id);
  
  // 标记需要重新加载
  setNeedReset(true);
  isLoadedRef.current = false;
  setReloadTrigger(prev => prev + 1);

  // 触发回调
  if (onSelectionChange) {
    onSelectionChange({
      modelId: type === 'model' ? id : selectedModelId,
      motionId: type === 'motion' ? id : selectedMotionId,
      audioId: type === 'audio' ? id : selectedAudioId,
      cameraId: type === 'camera' ? id : selectedCameraId,
    });
  }
};
```

## 注意事项

1. **模型必选**：模型是唯一必须选择的资源，其他都可以选择"无"
2. **ID 唯一性**：每个资源选项的 `id` 必须在其类别内唯一
3. **路径正确性**：确保所有 `path` 指向的文件存在于 `public/` 目录下
4. **切换延迟**：每次选择都会触发资源重新加载，可能需要几秒时间
5. **性能考虑**：频繁切换大型模型可能影响性能
6. **默认值**：如果不提供 `defaultSelection`，会自动使用每个列表的第一项

## 与其他模式的对比

### 单资源模式

```typescript
<MMDPlayerEnhanced
  resources={{
    modelPath: '/models/miku.pmx',
    motionPath: '/actions/dance.vmd',
  }}
  stage={stage}
/>
```

- 适用场景：固定展示单个配置
- 优点：简单直接
- 缺点：无法切换

### 预设组合模式

```typescript
<MMDPlayerEnhanced
  resourcesList={[
    { id: '1', name: '配置1', resources: {...} },
    { id: '2', name: '配置2', resources: {...} },
  ]}
  stage={stage}
/>
```

- 适用场景：预定义的完整配置列表
- 优点：快速切换完整配置
- 缺点：组合固定，不够灵活

### 下拉框选择模式

```typescript
<MMDPlayerEnhanced
  resourceOptions={{
    models: [...],
    motions: [...],
    audios: [...],
    cameras: [...],
  }}
  stage={stage}
/>
```

- 适用场景：需要用户自定义组合
- 优点：最大灵活性，自由组合
- 缺点：需要更多用户操作

## 版本信息

- **首次发布**：2025-11-22
- **当前版本**：sa2kit v1.0.0
- **兼容性**：Next.js 13+, React 18+

## 相关文档

- [MMD 动态资源切换功能](./mmd-dynamic-resource-switching.md)
- [sa2kit MMD 设置指南](./sa2kit-mmd-setup.md)
- [MMD 资源配置](../sa2kit/src/mmd/types.ts)

