# MMD OSS 路径配置指南

## 🎯 路径格式说明

### 正确的 OSS 路径结构

当你上传 MMD 资源到 OSS 后，路径应该遵循以下格式：

```
https://{bucket}.{region}.aliyuncs.com/{basePath}/{modelFolder}/{file}
```

**示例：**
```
OSS 基础路径：
https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/mmd

完整的模型路径：
https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/mmd/2025/11/23/miku/miku.pmx

贴图会自动从相对路径加载：
https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/mmd/2025/11/23/miku/textures/face.png
```

## ❌ 常见错误

### 错误 1：只上传单个文件

```typescript
// ❌ 错误：只上传了 .pmx 文件，没有贴图
modelPath: 'https://xxx.oss.com/mmd/2025/11/23/32366a8d-024f-4e0f-9fbf-19fb09902f0b.pmx'

// 问题：模型会尝试加载贴图，但找不到
// https://xxx.oss.com/mmd/2025/11/23/textures/face.png ❌ 404
```

**解决方法：** 上传整个模型文件夹

### 错误 2：路径结构不正确

```typescript
// ❌ 错误：文件直接放在根目录
modelPath: 'https://xxx.oss.com/miku.pmx'

// 问题：贴图路径会变成
// https://xxx.oss.com/textures/face.png
// 但实际贴图可能在其他位置
```

**解决方法：** 保持文件夹结构

## ✅ 正确的配置方式

### 方式一：使用本地资源（开发/测试）

```typescript
const playlist: MMDPlaylistConfig = {
  nodes: [
    {
      id: 'node1',
      name: '初音未来',
      resources: {
        modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
        motionPath: '/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd',
        audioPath: '/mikutalking/actions/CatchTheWave/pv_268.wav',
        cameraPath: '/mikutalking/actions/CatchTheWave/camera.vmd',
      },
    },
  ],
};
```

**优点：**
- 快速开发，无需上传
- 不消耗 OSS 流量
- 适合本地测试

**缺点：**
- 加载速度慢（服务器带宽限制）
- 不适合生产环境

### 方式二：使用 OSS 资源（生产环境）

#### 步骤 1：上传完整的模型文件夹

```bash
# 模型文件夹结构
miku/
├── miku.pmx
└── textures/
    ├── face.png
    ├── body.png
    └── hair.png
```

访问 `/testField/mmdUpload`，选择整个 `miku` 文件夹上传。

#### 步骤 2：记录上传后的路径

上传成功后，你会得到：
```
https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/mmd/2025/11/23/miku/miku.pmx
```

#### 步骤 3：在代码中使用

```typescript
const ossBasePath = 'https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/mmd';

const playlist: MMDPlaylistConfig = {
  nodes: [
    {
      id: 'node-oss-1',
      name: 'OSS - 初音未来',
      resources: {
        // 模型路径：基础路径 + 日期 + 文件夹 + 文件名
        modelPath: `${ossBasePath}/2025/11/23/miku/miku.pmx`,
        
        // 动作、音频、相机路径
        motionPath: `${ossBasePath}/2025/11/23/motions/dance.vmd`,
        audioPath: `${ossBasePath}/2025/11/23/audio/music.mp3`,
        cameraPath: `${ossBasePath}/2025/11/23/camera/camera.vmd`,
      },
    },
  ],
};
```

**优点：**
- 加载速度快（CDN 加速）
- 减轻服务器压力
- 适合生产环境

## 📋 完整示例

### 示例 1：混合使用本地和 OSS 资源

```typescript
'use client'

import { MMDPlaylist, type MMDPlaylistConfig } from 'sa2kit/business/mmd'

export default function MMDPlaylistTestPage() {
  const ossBasePath = 'https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/mmd';
  
  const playlist: MMDPlaylistConfig = {
    id: 'mixed-playlist',
    name: '混合播放列表',
    nodes: [
      // 节点 1：本地资源
      {
        id: 'local-node',
        name: '本地 - 初音未来',
        resources: {
          modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
          motionPath: '/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd',
          audioPath: '/mikutalking/actions/CatchTheWave/pv_268.wav',
        },
      },
      
      // 节点 2：OSS 资源
      {
        id: 'oss-node',
        name: 'OSS - 艾尔莎',
        resources: {
          modelPath: `${ossBasePath}/2025/11/23/elsa/elsa.pmx`,
          motionPath: `${ossBasePath}/2025/11/23/motions/wave.vmd`,
        },
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
    ammoPath: '/mikutalking/libs/ammo.wasm.js',
    ammoWasmPath: '/mikutalking/libs/',
  };

  return (
    <div className="fixed inset-0 bg-[#01030b]">
      <MMDPlaylist
        playlist={playlist}
        stage={customStage}
        className="h-full w-full"
      />
    </div>
  );
}
```

### 示例 2：纯 OSS 资源

```typescript
export default function MMDPlaylistTestPage() {
  // 定义 OSS 基础路径
  const ossBasePath = 'https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/mmd';
  const uploadDate = '2025/11/23'; // 上传日期
  
  const playlist: MMDPlaylistConfig = {
    id: 'oss-playlist',
    name: 'OSS 播放列表',
    nodes: [
      {
        id: 'miku-dance',
        name: '初音未来 - 舞蹈',
        resources: {
          modelPath: `${ossBasePath}/${uploadDate}/miku/miku.pmx`,
          motionPath: `${ossBasePath}/${uploadDate}/motions/dance.vmd`,
          audioPath: `${ossBasePath}/${uploadDate}/audio/music.mp3`,
          cameraPath: `${ossBasePath}/${uploadDate}/camera/dance-camera.vmd`,
        },
      },
      {
        id: 'luka-sing',
        name: '巡音流歌 - 唱歌',
        resources: {
          modelPath: `${ossBasePath}/${uploadDate}/luka/luka.pmx`,
          motionPath: `${ossBasePath}/${uploadDate}/motions/sing.vmd`,
          audioPath: `${ossBasePath}/${uploadDate}/audio/song.mp3`,
        },
      },
    ],
    loop: true,
    autoPlay: true,
  };

  return <MMDPlaylist playlist={playlist} />;
}
```

## 🔧 路径管理最佳实践

### 1. 使用配置文件

创建一个配置文件管理所有 OSS 路径：

```typescript
// config/mmd-resources.ts
export const MMD_OSS_CONFIG = {
  basePath: 'https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/mmd',
  uploadDate: '2025/11/23',
  
  models: {
    miku: 'miku/miku.pmx',
    elsa: 'elsa/elsa.pmx',
    luka: 'luka/luka.pmx',
  },
  
  motions: {
    dance: 'motions/dance.vmd',
    wave: 'motions/wave.vmd',
    sing: 'motions/sing.vmd',
  },
  
  audio: {
    catchTheWave: 'audio/catch-the-wave.mp3',
    song: 'audio/song.mp3',
  },
};

// 辅助函数
export function getOSSPath(category: string, name: string): string {
  const { basePath, uploadDate } = MMD_OSS_CONFIG;
  const path = MMD_OSS_CONFIG[category]?.[name];
  return path ? `${basePath}/${uploadDate}/${path}` : '';
}
```

使用配置：

```typescript
import { getOSSPath } from '@/config/mmd-resources';

const playlist: MMDPlaylistConfig = {
  nodes: [
    {
      id: 'node1',
      name: '初音未来',
      resources: {
        modelPath: getOSSPath('models', 'miku'),
        motionPath: getOSSPath('motions', 'dance'),
        audioPath: getOSSPath('audio', 'catchTheWave'),
      },
    },
  ],
};
```

### 2. 环境变量配置

```typescript
// .env.local
NEXT_PUBLIC_MMD_OSS_BASE_PATH=https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/mmd
NEXT_PUBLIC_MMD_UPLOAD_DATE=2025/11/23

// 使用
const ossBasePath = process.env.NEXT_PUBLIC_MMD_OSS_BASE_PATH;
const uploadDate = process.env.NEXT_PUBLIC_MMD_UPLOAD_DATE;

const modelPath = `${ossBasePath}/${uploadDate}/miku/miku.pmx`;
```

### 3. 动态加载配置

```typescript
// 从 API 获取资源配置
const [resources, setResources] = useState<MMDPlaylistConfig | null>(null);

useEffect(() => {
  fetch('/api/mmd/resources')
    .then(res => res.json())
    .then(data => setResources(data));
}, []);

if (!resources) return <div>加载中...</div>;

return <MMDPlaylist playlist={resources} />;
```

## 🔍 故障排查

### 问题 1：模型加载失败

**检查清单：**
1. ✅ OSS 路径是否正确？
2. ✅ 是否上传了完整的模型文件夹（包含贴图）？
3. ✅ OSS CORS 是否已配置？
4. ✅ 文件权限是否为公共读？

**调试方法：**
```typescript
// 在浏览器控制台查看实际请求的 URL
console.log('Model Path:', modelPath);

// 检查网络请求
// 打开开发者工具 -> Network 标签
// 查看是否有 404 错误
```

### 问题 2：贴图加载失败

**原因：** 模型文件引用的贴图路径与实际路径不匹配

**解决方法：**
1. 确保上传了完整的文件夹结构
2. 检查贴图文件是否都存在
3. 验证路径大小写是否匹配

### 问题 3：CORS 错误

**错误信息：**
```
Access to fetch at 'https://xxx.oss.com/...' has been blocked by CORS policy
```

**解决方法：**
参考 `docs/oss-cors-setup.md` 配置 OSS CORS

## 📚 相关文档

- [MMD 资源上传完整指南](./mmd-resource-upload-guide.md)
- [OSS CORS 配置指南](./oss-cors-setup.md)
- [MMD 上传工具使用指南](./mmd-upload-guide.md)

## 💡 总结

**记住三个关键点：**

1. **上传完整文件夹** - 不要只上传 .pmx 文件
2. **保持路径结构** - 模型和贴图的相对关系要正确
3. **配置 CORS** - OSS 必须允许跨域访问

**推荐工作流程：**

1. 在本地测试页面开发（使用 `/public` 目录资源）
2. 测试通过后，上传完整模型文件夹到 OSS
3. 更新代码中的路径为 OSS URL
4. 验证 CORS 配置
5. 部署到生产环境

