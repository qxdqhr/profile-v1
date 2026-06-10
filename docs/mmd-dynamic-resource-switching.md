# MMD 动态资源切换功能文档

## 功能概述

本文档介绍 MMDPlayerEnhanced 组件的动态资源切换功能，允许用户在运行时通过设置弹窗切换不同的 MMD 模型、动作、相机和音频资源，无需刷新页面。

## 功能特性

- ✅ **动态资源切换**：支持在运行时切换模型、动作、相机、音频
- ✅ **设置弹窗 UI**：精美的设置界面，显示所有可用资源
- ✅ **无刷新切换**：切换资源时无需刷新页面，自动停止当前播放并重新加载
- ✅ **资源标签**：自动显示每个资源配置包含的内容（模型/动作/相机/音频）
- ✅ **单/多资源模式**：支持单资源和多资源两种使用模式，向后兼容
- ✅ **回调支持**：提供 `onResourceChange` 回调，监听资源切换事件

## 核心类型定义

### MMDResourceItem

```typescript
interface MMDResourceItem {
  /** 配置项 ID */
  id: string;
  /** 配置项名称 */
  name: string;
  /** 资源配置 */
  resources: MMDResources;
}
```

### MMDPlayerEnhancedProps（更新）

```typescript
interface MMDPlayerEnhancedProps {
  /** MMD资源配置（单个），用于单资源模式 */
  resources?: MMDResources;
  
  /** MMD资源配置列表（用于动态切换），如果提供则显示设置按钮 */
  resourcesList?: MMDResourceItem[];
  
  /** 默认选中的资源ID（当使用 resourcesList 时） */
  defaultResourceId?: string;
  
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
  
  /** 资源切换回调 */
  onResourceChange?: (resourceId: string) => void;
}
```

## 使用方式

### 方式一：多资源模式（推荐）

适用于需要展示多个模型或多个舞蹈动作的场景。

```typescript
import { MMDPlayerEnhanced, type MMDResourceItem } from 'sa2kit/business/mmd';

const resourcesList: MMDResourceItem[] = [
  {
    id: 'catch-the-wave-miku',
    name: 'Catch The Wave - 初音未来',
    resources: {
      modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
      motionPath: '/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd',
      cameraPath: '/mikutalking/actions/CatchTheWave/camera.vmd',
      audioPath: '/mikutalking/actions/CatchTheWave/pv_268.wav',
    },
  },
  {
    id: 'static-miku',
    name: '静态模型 - 初音未来',
    resources: {
      modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
    },
  },
];

const stage = {
  backgroundColor: '#01030b',
  cameraPosition: { x: 0, y: 10, z: 30 },
  cameraTarget: { x: 0, y: 10, z: 0 },
  enablePhysics: true,
  showGrid: false,
  ammoPath: '/mikutalking/libs/ammo.wasm.js',
  ammoWasmPath: '/mikutalking/libs/',
};

export default function MMDPage() {
  return (
    <MMDPlayerEnhanced
      resourcesList={resourcesList}
      defaultResourceId="catch-the-wave-miku"
      stage={stage}
      autoPlay
      loop
      onResourceChange={(id) => console.log('资源已切换:', id)}
    />
  );
}
```

### 方式二：单资源模式（向后兼容）

适用于只需要显示一个固定模型的场景。

```typescript
import { MMDPlayerEnhanced } from 'sa2kit/business/mmd';

const resources = {
  modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
  motionPath: '/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd',
  cameraPath: '/mikutalking/actions/CatchTheWave/camera.vmd',
  audioPath: '/mikutalking/actions/CatchTheWave/pv_268.wav',
};

const stage = {
  backgroundColor: '#01030b',
  enablePhysics: true,
  ammoPath: '/mikutalking/libs/ammo.wasm.js',
  ammoWasmPath: '/mikutalking/libs/',
};

export default function MMDPage() {
  return (
    <MMDPlayerEnhanced
      resources={resources}
      stage={stage}
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
- 显示条件：仅在 `resourcesList` 存在且包含多个资源时显示
- 点击后打开设置弹窗

### 设置弹窗

- **标题栏**：显示"选择资源"标题和关闭按钮
- **资源列表**：滚动列表显示所有可用资源
  - 资源名称
  - 资源标签（模型/动作/相机/音频）
  - 当前选中状态（✓）
- **样式**：渐变背景、毛玻璃效果、现代化设计
- **响应式**：自动适配移动端和桌面端

## 切换流程

1. 用户点击设置按钮打开弹窗
2. 用户在弹窗中选择新资源
3. 组件自动执行以下操作：
   - 停止当前播放（如果正在播放）
   - 更新选中的资源 ID
   - 标记需要重新加载
   - 清空已加载状态
   - 触发重新加载流程
   - 调用 `onResourceChange` 回调
   - 关闭设置弹窗
4. 新资源加载完成后，根据 `autoPlay` 决定是否自动播放

## 技术实现

### 状态管理

```typescript
const [selectedResourceId, setSelectedResourceId] = useState<string>(
  defaultResourceId || resourcesList?.[0]?.id || ''
);
const [showSettings, setShowSettings] = useState(false);
```

### 资源计算

```typescript
const currentResources = useMemo(() => {
  if (resourcesList && resourcesList.length > 0) {
    const selected = resourcesList.find(r => r.id === selectedResourceId);
    return (selected || resourcesList[0]).resources;
  }
  if (!resources) {
    throw new Error('必须提供 resources 或 resourcesList');
  }
  return resources;
}, [resources, resourcesList, selectedResourceId]);
```

### 切换处理

```typescript
const handleResourceChange = (resourceId: string) => {
  console.log('🔄 [MMDPlayerEnhanced] 切换资源:', resourceId);
  
  // 停止当前播放
  if (isPlaying) {
    stop();
  }

  // 更新选中的资源ID
  setSelectedResourceId(resourceId);
  
  // 标记需要重新加载
  setNeedReset(true);
  isLoadedRef.current = false;
  
  // 触发重新加载
  setReloadTrigger(prev => prev + 1);

  // 触发回调
  if (onResourceChange) {
    onResourceChange(resourceId);
  }

  // 关闭设置弹窗
  setShowSettings(false);
};
```

## 示例场景

### 1. 多模型展示

```typescript
const resourcesList: MMDResourceItem[] = [
  {
    id: 'miku',
    name: '初音未来',
    resources: { modelPath: '/models/miku.pmx' },
  },
  {
    id: 'elsa',
    name: '艾尔莎',
    resources: { modelPath: '/models/elsa.pmx' },
  },
];
```

### 2. 多舞蹈展示

```typescript
const resourcesList: MMDResourceItem[] = [
  {
    id: 'dance-1',
    name: 'Catch The Wave',
    resources: {
      modelPath: '/models/miku.pmx',
      motionPath: '/actions/CatchTheWave/motion.vmd',
      cameraPath: '/actions/CatchTheWave/camera.vmd',
      audioPath: '/actions/CatchTheWave/audio.wav',
    },
  },
  {
    id: 'dance-2',
    name: 'Another Dance',
    resources: {
      modelPath: '/models/miku.pmx',
      motionPath: '/actions/AnotherDance/motion.vmd',
      cameraPath: '/actions/AnotherDance/camera.vmd',
      audioPath: '/actions/AnotherDance/audio.wav',
    },
  },
];
```

### 3. 模型 × 动作组合

```typescript
const resourcesList: MMDResourceItem[] = [
  {
    id: 'miku-dance1',
    name: '初音未来 - Catch The Wave',
    resources: {
      modelPath: '/models/miku.pmx',
      motionPath: '/actions/CatchTheWave/motion.vmd',
      audioPath: '/actions/CatchTheWave/audio.wav',
    },
  },
  {
    id: 'elsa-dance1',
    name: '艾尔莎 - Catch The Wave',
    resources: {
      modelPath: '/models/elsa.pmx',
      motionPath: '/actions/CatchTheWave/motion.vmd',
      audioPath: '/actions/CatchTheWave/audio.wav',
    },
  },
  {
    id: 'miku-static',
    name: '初音未来 - 静态',
    resources: {
      modelPath: '/models/miku.pmx',
    },
  },
];
```

## 注意事项

1. **资源路径**：所有资源文件必须放置在 `public/` 目录下
2. **资源数量**：如果 `resourcesList` 只有 1 个资源，设置按钮不会显示
3. **必需参数**：必须提供 `resources` 或 `resourcesList` 中的至少一个
4. **ID 唯一性**：`resourcesList` 中每个资源的 `id` 必须唯一
5. **切换延迟**：切换资源需要重新加载，可能需要几秒时间
6. **性能考虑**：频繁切换大型模型可能影响性能

## 版本信息

- **首次发布**：2025-11-22
- **当前版本**：sa2kit v1.0.0
- **兼容性**：Next.js 13+, React 18+

## 相关文档

- [sa2kit MMD 设置指南](./sa2kit-mmd-setup.md)
- [MMD 资源配置](../sa2kit/src/mmd/types.ts)
- [MMD 预设配置](../sa2kit/src/mmd/presets.ts)

## 更新日志

### 2025-11-22
- 新增 `MMDResourceItem` 类型
- 新增 `resourcesList` 和 `defaultResourceId` 参数
- 新增设置按钮和设置弹窗 UI
- 新增 `onResourceChange` 回调
- 实现资源动态切换功能
- 保持向后兼容的单资源模式

