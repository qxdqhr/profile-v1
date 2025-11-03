# 米库说话 (Miku Talking)

类似"会说话的汤姆猫"的MMD互动游戏，基于Three.js和MMD模型构建。

## 功能特性

### 🎮 核心交互功能

1. **点击互动**
   - 点击米库的不同部位（头部、脸部、身体、手臂、腿等）触发不同反应
   - 每个部位对应多种动画，随机播放
   - 支持桌面端鼠标点击和移动端触摸

2. **语音录制与变声**
   - 按住麦克风按钮录音（最长10秒）
   - 支持多种变声效果：
     - 正常 🎤
     - 尖声 🐭
     - 低沉 🐻
     - 机器人 🤖
     - 回声 🔊
     - 快速 ⚡
     - 慢速 🐌
   - 实时音量指示器

3. **手势识别**
   - 拖拽（抚摸效果）
   - 滑动（上下左右）
   - 长按
   - 双击
   - 可视化手势轨迹

4. **道具系统**
   - **食物类**：苹果🍎、蛋糕🍰、大葱🧅、牛奶🥛
   - **玩具类**：球⚽、音乐盒🎵、玩具熊🧸
   - **礼物类**：花束💐、礼物盒🎁、爱心❤️
   - **装饰类**：皇冠👑、蝴蝶结🎀
   - 支持消耗品和永久道具
   - 道具使用后触发特定动画和情绪变化

### 📊 情绪系统

- **快乐度**：通过互动和道具提升
- **能量值**：随时间自然消耗
- **饥饿度**：随时间增加，需要喂食
- **亲密度**：互动越多越高
- **等级系统**：获得经验值可升级

情绪会影响角色的自动反应和动画选择。

### 🎨 UI界面

- **顶部状态栏**：显示情绪、能量、饥饿度、亲密度、等级
- **底部道具栏**：分类显示所有道具，点击使用
- **浮动控制面板**：
  - 设置（音量、音效、背景音乐）
  - 帮助教程
  - 返回主页
  - 调试模式
- **交互覆盖层**：可视化交互区域（调试模式）
- **教程弹窗**：首次进入的引导

### 🎵 音效系统

- 点击音效
- 成功/错误提示音
- 道具使用音效
- 升级音效
- 背景音乐（可选）

## 技术栈

- **Three.js** - 3D渲染引擎
- **mmd-parser** - MMD模型解析
- **Web Audio API** - 录音和音效处理
- **React Hooks** - 状态管理
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架

## 文件结构

```
(mikutalking)/
├── layout.tsx                 # 页面布局
├── page.tsx                   # 主页面入口
├── README.md                  # 说明文档
├── types/
│   └── index.ts              # TypeScript类型定义
├── components/
│   ├── MikuTalkingGame.tsx   # 主游戏组件
│   ├── StatusBar.tsx          # 状态栏
│   ├── ItemBar.tsx            # 道具栏
│   ├── ControlPanel.tsx       # 控制面板
│   ├── InteractionOverlay.tsx # 交互层
│   ├── VoiceRecorder.tsx      # 录音组件
│   ├── TutorialModal.tsx      # 教程弹窗
│   ├── ItemEffect.tsx         # 道具效果
│   └── GestureLayer.tsx       # 手势可视化
├── hooks/
│   ├── useAnimationManager.ts # 动画管理
│   ├── useGestureDetector.ts  # 手势检测
│   └── useSoundEffects.ts     # 音效系统
├── utils/
│   ├── interactionZones.ts    # 交互区域定义
│   └── voiceEffects.ts        # 变声效果
└── constants/
    ├── animations.ts          # 动画配置
    └── items.ts               # 道具配置
```

## 使用方法

### 基本操作

1. **点击互动**
   - 直接点击米库的不同部位
   - 观察她的反应和动画

2. **录音变声**
   - 点击右侧变声效果图标选择效果
   - 按住麦克风按钮开始录音
   - 松开播放变声后的音频

3. **使用道具**
   - 点击底部向上箭头展开道具栏
   - 选择分类查看道具
   - 点击道具使用

4. **查看状态**
   - 顶部状态栏显示所有数值
   - 保持各项指标平衡

### 调试模式

在设置中开启调试模式可以：
- 查看交互区域边界
- 显示额外的调试信息
- 测试不同交互效果

## 开发说明

### 添加新动画

在 `constants/animations.ts` 中添加：

```typescript
export const ANIMATIONS = {
  // ... 现有动画
  new_animation: {
    type: 'new_animation',
    name: '新动画',
    duration: 3,
    priority: 5,
  }
}
```

### 添加新道具

在 `constants/items.ts` 中添加：

```typescript
{
  id: 'new_item',
  name: '新道具',
  type: 'food',
  icon: '🍕',
  effectAnimation: 'happy',
  emotionChange: {
    happiness: 15,
    hunger: -20,
  },
  consumable: true,
  initialQuantity: 5,
}
```

### 自定义交互区域

在 `utils/interactionZones.ts` 中修改 `INTERACTION_ZONES` 数组。

## 注意事项

1. **模型加载**
   - 游戏已内置默认MMD模型（v4c5.0short.pmx）
   - 进入游戏后会自动加载模型
   - 如需更换模型，可将新模型放入 `public/models/mikutalking/` 目录

2. **麦克风权限**
   - 首次使用录音功能需要授予麦克风权限
   - HTTPS环境下才能使用录音功能

3. **浏览器兼容性**
   - 推荐使用Chrome、Edge、Safari最新版本
   - 需要支持WebGL和Web Audio API

4. **性能优化**
   - 复杂的MMD模型可能影响性能
   - 移动端建议使用简化模型

## 未来计划

- [ ] 支持VMD动画文件加载
- [ ] 添加更多内置动画
- [ ] 成就系统
- [ ] 服装更换功能
- [ ] 背景场景切换
- [ ] 多语言支持
- [ ] 数据云端同步

## 许可证

本项目仅用于学习和个人娱乐，请勿用于商业用途。

