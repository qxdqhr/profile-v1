# MMD 播放列表组件 (MMDPlaylist)

## 概述

`MMDPlaylist` 是基于 `MMDPlayerEnhanced` 封装的播放列表组件，支持多个 MMD 资源配置的连续播放。

## 核心特性

- ✅ **资源预加载**：在初始化时预加载所有节点的资源
- ✅ **无缝切换**：切换节点时无需加载页面，瞬时完成
- ✅ 支持多个资源节点的连续播放
- ✅ 支持播放列表循环
- ✅ 支持单节点循环
- ✅ 提供上一个/下一个节点切换按钮
- ✅ 提供播放列表弹窗，显示所有节点并支持跳转
- ✅ 在左上角显示当前节点信息
- ✅ 播放列表按钮位于右下角，不与播放器控制按钮重叠
- ✅ 自动处理节点切换和播放状态
- ✅ 完全独立的组件，不影响 `MMDPlayerEnhanced` 的原有逻辑

## 预加载机制

### 工作原理

1. **并行加载**：为每个节点创建独立的 `MMDPlayerEnhanced` 实例
2. **隐藏渲染**：所有节点同时加载，但只有当前节点可见
3. **状态跟踪**：跟踪每个节点的加载状态，全部完成后隐藏加载页面
4. **瞬时切换**：切换节点只需改变 `visibility` 属性，无需重新加载

### 优势

- 🚀 **节点切换瞬时完成**，无加载等待
- 💾 **资源只加载一次**，内存中保持
- 🎯 **用户体验流畅**，无中断感

### 注意事项

- ⚠️ **内存占用增加**：所有节点同时存在于内存中
- ⚠️ **适合场景**：建议节点数量 < 10 个
- ⚠️ **初始加载时间**：第一次加载所有资源需要较长时间

## 类型定义

### MMDPlaylistNode

```typescript
interface MMDPlaylistNode {
  /** 节点 ID */
  id: string;
  /** 节点名称 */
  name: string;
  /** 节点描述（可选） */
  description?: string;
  /** 资源配置 */
  resources: MMDResources;
  /** 是否循环播放当前节点（默认 false） */
  loop?: boolean;
}
```

### MMDPlaylistConfig

```typescript
interface MMDPlaylistConfig {
  /** 播放列表 ID */
  id: string;
  /** 播放列表名称 */
  name: string;
  /** 播放列表描述（可选） */
  description?: string;
  /** 播放节点列表 */
  nodes: MMDPlaylistNode[];
  /** 是否循环播放整个列表（默认 false） */
  loop?: boolean;
  /** 是否自动播放（默认 true） */
  autoPlay?: boolean;
}
```

### MMDPlaylistProps

```typescript
interface MMDPlaylistProps {
  /** 播放列表配置 */
  playlist: MMDPlaylistConfig;
  /** 舞台配置 */
  stage?: MMDStage;
  /** 默认播放的节点索引（默认 0） */
  defaultNodeIndex?: number;
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 资源加载完成回调 */
  onLoad?: () => void;
  /** 资源加载错误回调 */
  onError?: (error: any) => void;
  /** 节点切换回调 */
  onNodeChange?: (nodeIndex: number, node: MMDPlaylistNode) => void;
  /** 播放列表完成回调 */
  onPlaylistComplete?: () => void;
}
```

## 使用示例

### 基础用法

```tsx
import { MMDPlaylist, type MMDPlaylistConfig } from 'sa2kit/business/mmd';

const playlist: MMDPlaylistConfig = {
  id: 'my-playlist',
  name: '我的播放列表',
  description: '包含多个 MMD 表演的连续播放',
  nodes: [
    {
      id: 'node1',
      name: '初音未来 - Catch The Wave',
      resources: {
        modelPath: '/models/miku.pmx',
        motionPath: '/motions/catch-the-wave.vmd',
        audioPath: '/audio/catch-the-wave.wav',
        cameraPath: '/camera/catch-the-wave.vmd',
      },
      loop: false,
    },
    {
      id: 'node2',
      name: '艾尔莎 - 打招呼',
      resources: {
        modelPath: '/models/elsa.pmx',
        motionPath: '/motions/greeting.vmd',
      },
      loop: false,
    },
  ],
  loop: true, // 播放列表循环
  autoPlay: true, // 自动播放
};

export default function MyPage() {
  return (
    <div className="h-screen w-screen">
      <MMDPlaylist
        playlist={playlist}
        onNodeChange={(index, node) => {
          console.log('节点切换:', index, node.name);
        }}
        onPlaylistComplete={() => {
          console.log('播放列表完成');
        }}
      />
    </div>
  );
}
```

### 完整配置示例

```tsx
const playlist: MMDPlaylistConfig = {
  id: 'full-playlist',
  name: '完整播放列表',
  description: '包含场景和背景的完整表演',
  nodes: [
    {
      id: 'node1',
      name: '节点 1',
      description: '带场景和背景的表演',
      resources: {
        modelPath: '/models/miku.pmx',
        motionPath: '/motions/dance.vmd',
        audioPath: '/audio/music.wav',
        cameraPath: '/camera/camera.vmd',
        stageModelPath: '/stages/classroom.pmx', // 场景模型
        backgroundPath: '/backgrounds/sky.jpg', // 背景图片
      },
      loop: false,
    },
    {
      id: 'node2',
      name: '节点 2',
      description: '循环播放的节点',
      resources: {
        modelPath: '/models/elsa.pmx',
        motionPath: '/motions/idle.vmd',
      },
      loop: true, // 这个节点会循环播放，不会自动切换到下一个
    },
  ],
  loop: true,
  autoPlay: true,
};

const customStage = {
  backgroundColor: '#01030b',
  cameraPosition: { x: 0, y: 10, z: 30 },
  cameraTarget: { x: 0, y: 10, z: 0 },
  enablePhysics: true,
  showGrid: false,
  ammoPath: '/libs/ammo.wasm.js',
  ammoWasmPath: '/libs/',
  backgroundType: 'image' as const,
};

<MMDPlaylist
  playlist={playlist}
  stage={customStage}
  defaultNodeIndex={0}
  className="h-full w-full"
  onNodeChange={(index, node) => console.log('节点切换:', index, node.name)}
  onPlaylistComplete={() => console.log('播放列表完成')}
/>
```

## 播放逻辑

### 自动切换

- **有音频的节点**：音频播放完成后，会自动切换到下一个节点
- **没有音频的节点**：动画播放完成后，会自动切换到下一个节点
- 如果当前节点设置了 `loop: true`，则不会自动切换
- 如果是最后一个节点且播放列表设置了 `loop: true`，则回到第一个节点
- 如果是最后一个节点且播放列表没有设置循环，则触发 `onPlaylistComplete` 回调

### 动画结束检测

- 组件会自动检测节点是否有音频
- **有音频**：使用 `onAudioEnded` 回调，在音频结束时触发
- **没有音频**：使用 `onAnimationEnded` 回调，在动画结束时触发
- 动画结束判定：当前播放时间 >= 动画时长 - 0.1秒（留一点余量避免浮点数误差）
- 动画时长从 VMD 文件中自动读取

### 手动切换

- 点击"上一个"按钮：切换到上一个节点（如果是第一个节点，则跳到最后一个）
- 点击"下一个"按钮：切换到下一个节点（如果是最后一个节点，则跳到第一个）
- 点击"播放列表"按钮：打开播放列表弹窗，点击任意节点跳转

### 自动播放

- 第一次加载时，如果 `playlist.autoPlay !== false`，则自动播放
- 自动切换到下一个节点时，会自动开始播放
- 手动切换节点时，需要手动点击播放按钮

## UI 布局

- **左上角**：当前节点信息（节点编号、节点名称、循环标记）
- **底部中央**：播放器控制按钮（播放/暂停、停止）- 由 `MMDPlayerEnhanced` 提供
- **右上角**：设置按钮（如果使用 `resourceOptions` 模式）- 由 `MMDPlayerEnhanced` 提供
- **右下角**：播放列表控制按钮（上一个、播放列表、下一个）

## 注意事项

1. **资源预加载**：
   - 初始化时会预加载所有节点的资源
   - 显示预加载进度条和已加载节点数
   - 全部节点加载完成后才能开始播放和切换
   
2. **内存管理**：
   - 所有节点的资源同时存在于内存中
   - 建议节点数量控制在 10 个以内
   - 每个节点包含完整的 Three.js 场景和模型
   
3. **切换性能**：
   - 节点切换瞬时完成，无需等待加载
   - 使用 `visibility` 属性控制显示，不销毁实例
   - 适合需要频繁切换的场景
   
4. **自动切换支持**：
   - **有音频的节点**：使用 `onAudioEnded` 回调，在音频结束时自动切换
   - **没有音频的节点**：使用 `onAnimationEnded` 回调，在动画结束时自动切换
   - 两种方式都能正确实现自动节点切换
   
5. **循环播放**：
   - 节点的 `loop` 优先级高于播放列表的 `loop`
   - 如果节点设置了循环，则不会自动切换到下一个节点
   
6. **动画时长**：
   - 动画时长从 VMD 文件中自动读取
   - 如果 VMD 文件没有提供时长信息，使用停止检测方案
   
7. **适用场景**：
   - ✅ 适合：节点数量少、需要频繁切换、追求流畅体验
   - ❌ 不适合：节点数量多（>10）、内存受限的设备

## 测试页面

测试页面路径：`/testField/mmdPlaylistTest`

包含 3 个测试节点：
1. 初音未来 - Catch The Wave（完整表演）
2. 艾尔莎 - 打招呼（简单动作）
3. 初音未来 + 场景 + 背景（完整配置）

## 与 MMDPlayerEnhanced 的关系

- `MMDPlaylist` 是基于 `MMDPlayerEnhanced` 封装的高级组件
- 不影响 `MMDPlayerEnhanced` 的原有逻辑和功能
- 可以单独使用 `MMDPlayerEnhanced` 或 `MMDPlaylist`
- `MMDPlaylist` 内部使用 `MMDPlayerEnhanced` 的 `resources` 模式（单资源模式）

