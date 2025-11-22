# MMD 播放列表功能

## 概述

MMD 播放列表功能允许您创建一个包含多个 MMD 场景的播放序列，每个场景可以有不同的模型、动作、音乐、镜头、场景和背景。播放列表会自动按顺序播放每个节点，实现连续的 MMD 表演。

## 核心概念

### 1. 播放节点 (MMDPlaylistNode)

一个播放节点代表一个完整的 MMD 场景配置，包含：

```typescript
interface MMDPlaylistNode {
  id: string;              // 节点唯一标识
  name: string;            // 节点名称
  description?: string;    // 节点描述（可选）
  selection: MMDSelection; // 资源选择配置
  loop?: boolean;          // 是否循环播放此节点
  duration?: number;       // 播放时长（毫秒）
}
```

### 2. 资源选择 (MMDSelection)

每个节点的资源选择配置：

```typescript
interface MMDSelection {
  modelId?: string;       // 模型 ID
  motionId?: string;      // 动作 ID
  audioId?: string;       // 音频 ID
  cameraId?: string;      // 相机 ID
  stageModelId?: string;  // 场景模型 ID
  backgroundId?: string;  // 背景 ID
}
```

### 3. 播放列表 (MMDPlaylist)

播放列表配置：

```typescript
interface MMDPlaylist {
  id: string;                // 播放列表 ID
  name: string;              // 播放列表名称
  nodes: MMDPlaylistNode[];  // 播放节点列表
  loop?: boolean;            // 是否循环播放整个列表
  autoPlay?: boolean;        // 是否自动播放
}
```

## 使用方法

### 基本示例

```typescript
import { MMDPlayerEnhanced, type MMDResourceOptions, type MMDPlaylist } from 'sa2kit/mmd';

// 1. 定义资源选项
const resourceOptions: MMDResourceOptions = {
  models: [
    { id: 'miku', name: '初音未来', path: '/models/miku.pmx' },
    { id: 'luka', name: '巡音流歌', path: '/models/luka.pmx' },
  ],
  motions: [
    { id: 'dance1', name: '舞蹈1', path: '/motions/dance1.vmd' },
    { id: 'dance2', name: '舞蹈2', path: '/motions/dance2.vmd' },
  ],
  audios: [
    { id: 'song1', name: '歌曲1', path: '/audio/song1.mp3' },
    { id: 'song2', name: '歌曲2', path: '/audio/song2.mp3' },
  ],
  cameras: [
    { id: 'cam1', name: '镜头1', path: '/cameras/cam1.vmd' },
  ],
  stageModels: [
    { id: 'stage1', name: '舞台', path: '/stages/stage1.pmx' },
  ],
  backgrounds: [
    { id: 'bg1', name: '背景1', path: '/backgrounds/bg1.jpg' },
  ],
};

// 2. 定义播放列表
const playlist: MMDPlaylist = {
  id: 'my-playlist',
  name: '我的播放列表',
  loop: true,      // 整个列表循环播放
  autoPlay: true,  // 自动播放
  nodes: [
    {
      id: 'node-1',
      name: '初音未来 - 舞蹈1',
      selection: {
        modelId: 'miku',
        motionId: 'dance1',
        audioId: 'song1',
        cameraId: 'cam1',
        stageModelId: 'stage1',
        backgroundId: 'bg1',
      },
    },
    {
      id: 'node-2',
      name: '巡音流歌 - 舞蹈2',
      selection: {
        modelId: 'luka',
        motionId: 'dance2',
        audioId: 'song2',
        cameraId: 'cam1',
      },
    },
  ],
};

// 3. 使用播放器
<MMDPlayerEnhanced
  resourceOptions={resourceOptions}
  playlist={playlist}
  defaultNodeIndex={0}
  stage={customStage}
  onPlaylistNodeChange={(index, node) => {
    console.log(`切换到节点 ${index}: ${node.name}`);
  }}
  onPlaylistComplete={() => {
    console.log('播放列表完成');
  }}
/>
```

## 播放控制

### 自动播放

播放列表会在以下情况自动切换到下一个节点：

1. 当前节点的音频播放结束
2. 当前节点没有设置 `loop: true`
3. 不是最后一个节点，或者列表设置了 `loop: true`

### 手动控制

播放列表模式下会显示额外的控制按钮：

- **⏮️ 上一个**：切换到上一个节点（循环到最后一个）
- **⏭️ 下一个**：切换到下一个节点（循环到第一个）
- **📋 播放列表**：打开播放列表弹窗，查看所有节点并跳转

### 循环播放

支持两种循环模式：

1. **节点级循环** (`node.loop = true`)
   - 单个节点循环播放
   - 不会自动切换到下一个节点
   - 优先级高于列表级循环

2. **列表级循环** (`playlist.loop = true`)
   - 播放到最后一个节点后，自动回到第一个节点
   - 无限循环播放整个列表

## 回调函数

### onPlaylistNodeChange

节点切换时触发：

```typescript
onPlaylistNodeChange={(index, node) => {
  console.log(`当前节点: ${index}`, node);
  // 可以在这里更新 UI、记录日志等
}}
```

### onPlaylistComplete

播放列表完成时触发（仅在非循环模式）：

```typescript
onPlaylistComplete={() => {
  console.log('播放列表播放完成');
  // 可以在这里显示结束画面、跳转页面等
}}
```

## 高级用法

### 节点循环播放

让某个节点循环播放（例如待机动画）：

```typescript
{
  id: 'idle-node',
  name: '待机动画',
  selection: {
    modelId: 'miku',
    motionId: 'idle',
  },
  loop: true, // 此节点会一直循环，不会自动切换
}
```

### 无音乐/镜头节点

创建简单的动作展示：

```typescript
{
  id: 'simple-node',
  name: '简单动作',
  selection: {
    modelId: 'miku',
    motionId: 'wave',
    // 不指定 audioId 和 cameraId
  },
}
```

### 动态切换场景和背景

每个节点可以有不同的场景和背景：

```typescript
nodes: [
  {
    id: 'indoor',
    name: '室内场景',
    selection: {
      modelId: 'miku',
      motionId: 'dance',
      stageModelId: 'classroom',
      backgroundId: 'indoor-bg',
    },
  },
  {
    id: 'outdoor',
    name: '室外场景',
    selection: {
      modelId: 'miku',
      motionId: 'walk',
      stageModelId: 'park',
      backgroundId: 'outdoor-bg',
    },
  },
]
```

## 使用场景

1. **多段表演连续播放**
   - 将多个舞蹈/表演串联成完整的演出

2. **不同角色轮流展示**
   - 展示多个角色的不同动作

3. **故事情节演绎**
   - 通过不同场景和背景讲述故事

4. **自动演示系统**
   - 创建自动循环播放的展示系统

5. **交互式选择**
   - 结合回调函数实现用户交互

## 注意事项

1. **资源选项必须提供**
   - 播放列表模式必须同时提供 `resourceOptions` 参数
   - 节点中的 ID 必须在 `resourceOptions` 中存在

2. **资源切换性能**
   - 切换节点时会重新加载资源
   - 建议预加载常用资源以提高切换速度

3. **音频同步**
   - 节点切换基于音频播放结束事件
   - 如果没有音频，需要手动切换或设置 `duration`

4. **内存管理**
   - 切换节点时会清理旧资源
   - 大量节点可能需要优化加载策略

## 测试页面

访问 `/testField/mmdPlaylist` 查看完整的播放列表示例。

## API 参考

### MMDPlayerEnhancedProps

```typescript
interface MMDPlayerEnhancedProps {
  // ... 其他属性
  
  // 播放列表相关
  playlist?: MMDPlaylist;
  defaultNodeIndex?: number;
  onPlaylistNodeChange?: (nodeIndex: number, node: MMDPlaylistNode) => void;
  onPlaylistComplete?: () => void;
}
```

### MMDPlaylist

```typescript
interface MMDPlaylist {
  id: string;
  name: string;
  nodes: MMDPlaylistNode[];
  loop?: boolean;
  autoPlay?: boolean;
}
```

### MMDPlaylistNode

```typescript
interface MMDPlaylistNode {
  id: string;
  name: string;
  description?: string;
  selection: MMDSelection;
  loop?: boolean;
  duration?: number;
}
```

### MMDSelection

```typescript
interface MMDSelection {
  modelId?: string;
  motionId?: string;
  audioId?: string;
  cameraId?: string;
  stageModelId?: string;
  backgroundId?: string;
}
```

