# MMD 完整播放功能说明

## 功能概述

现在游戏支持两种模式：

### 1. 🎬 播放模式（默认）
- 完整的MMD播放功能
- 支持模型 + 动作 + 镜头 + 音乐同步播放
- 自动播放动画
- 提供播放/暂停/停止控制

### 2. 🎮 互动模式
- 原有的互动游戏功能
- 点击模型不同部位触发反应
- 道具系统
- 语音录制等

## 当前配置

### 播放模式资源
- **模型**: `/mikutalking/models/YYB_Z6水手樱未来-2/miku.pmx`
- **动作**: `/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd`
- **镜头**: `/mikutalking/actions/CatchTheWave/camera.vmd`
- **音频**: `/mikutalking/actions/CatchTheWave/pv_268.wav`

### 互动模式资源
- **模型**: `/mikutalking/models/test/v4c5.0.pmx`

## 文件结构

```
public/mikutalking/
├── models/
│   ├── YYB_Z6水手樱未来-2/
│   │   ├── miku.pmx              # 樱花未来模型
│   │   ├── tex/                  # 纹理文件夹
│   │   ├── spa/                  # 球面贴图
│   │   └── toon/                 # 卡通渲染
│   └── test/
│       ├── v4c5.0.pmx            # 测试模型
│       ├── texture/              # 纹理
│       └── spa/                  # 球面贴图
└── actions/
    └── CatchTheWave/
        ├── mmd_CatchTheWave_motion.vmd  # 动作文件
        ├── camera.vmd                    # 镜头文件
        └── pv_268.wav                    # 音频文件
```

## 使用说明

### 切换模式
点击屏幕左上角的按钮：
- 🎬 切换到播放模式
- 🎮 切换到互动模式

### 播放控制（播放模式）
屏幕底部中央有播放控制按钮：
- ▶️ 播放
- ⏸️ 暂停
- ⏹️ 停止

### 添加新的MMD动作

1. 将文件放到 `public/mikutalking/actions/[动作名]/` 目录下
2. 修改 `MikuTalkingGame.tsx` 中的 `mmdConfig`：

```typescript
const mmdConfig = {
  modelPath: '/mikutalking/models/你的模型/模型.pmx',
  motionPath: '/mikutalking/actions/你的动作/动作.vmd',
  cameraPath: '/mikutalking/actions/你的动作/镜头.vmd',
  audioPath: '/mikutalking/actions/你的动作/音乐.wav',
}
```

## 技术实现

### MMDPlayer 组件
- 使用 `MMDLoader` 加载 PMX 模型和 VMD 动画
- 使用 `MMDAnimationHelper` 处理动画播放
- 支持物理引擎、IK、Grant 等高级特性
- 音频与动画自动同步

### 加载流程
1. 加载模型 (0-60%)
2. 加载动作 (60-80%)
3. 加载镜头 (80-90%)
4. 加载音频 (90-100%)
5. 自动播放（如果 autoPlay=true）

## 注意事项

1. **文件路径**：
   - 所有路径都是相对于 `public` 目录
   - 使用正斜杠 `/` 而不是反斜杠 `\`

2. **文件格式**：
   - 模型：`.pmx` 或 `.pmd`
   - 动作/镜头：`.vmd`
   - 音频：`.wav`, `.mp3` 等

3. **性能**：
   - 大型模型和复杂动画可能需要较长加载时间
   - 建议优化纹理大小和模型面数

4. **兼容性**：
   - 需要现代浏览器支持 WebGL
   - 推荐使用 Chrome、Edge、Firefox 最新版本

## 未来扩展

可以添加：
- 动作列表选择器
- 播放进度条
- 播放速度控制
- 循环播放选项
- 多个模型同时显示
- 自定义背景和舞台

