# Mikutap 游戏模式设计方案

## 📋 项目概述

为Mikutap音效板添加游戏化功能，通过模式选择弹窗让用户在"工具模式"和"游戏模式"之间切换。游戏模式以"旋律模仿"为核心玩法，提供渐进式音乐学习体验。

## 🎯 功能设计

### 1. 模式选择系统

#### 1.1 入口弹窗设计
```
┌─────────────────────────────────────┐
│           🎵 Mikutap 模式选择         │
├─────────────────────────────────────┤
│                                     │
│  🛠️  工具模式                        │
│  自由创作音乐，探索声音的无限可能      │
│  [进入工具模式]                      │
│                                     │
│  🎮  游戏模式                        │
│  跟随旋律学习音乐，挑战节奏技巧       │
│  [进入游戏模式]                      │
│                                     │
│  ⚙️  总是以工具模式启动 □             │
│                                     │
└─────────────────────────────────────┘
```

#### 1.2 模式切换
- 工具模式中可随时切换到游戏模式
- 游戏模式中可返回工具模式
- 用户偏好设置保存到localStorage

### 2. 游戏模式核心设计

#### 2.1 旋律模仿游戏机制

**基础流程：**
1. **示范阶段**：系统播放一段旋律（高亮显示对应按键）
2. **学习阶段**：用户可重复听取，查看按键提示
3. **挑战阶段**：用户尝试重复演奏
4. **评分阶段**：系统分析准确度并给出反馈

**游戏要素：**
- **准确度评分**：音符准确度、节拍准确度、完整度
- **难度等级**：简单(3-5音符) → 中等(6-10音符) → 困难(11+音符)
- **进度系统**：解锁新曲目、获得成就
- **提示系统**：实时按键高亮、节拍器、慢速播放

#### 2.2 音乐引导系统

**新手引导：**
```
第一阶段：基础音符认知
- 单音符点击练习
- 基本音阶练习(Do Re Mi...)
- 简单和弦练习

第二阶段：节奏感培养
- 节拍器同步练习
- 简单节奏模式
- 速度渐进训练

第三阶段：旋律模仿
- 3音符短旋律
- 5音符中等旋律
- 复杂旋律挑战
```

**分级指导：**
- **音乐零基础**：从单音符开始，重点培养音准感
- **有音乐基础**：直接进入节奏练习，快速上手
- **音乐专业**：复杂旋律和即兴创作挑战

### 3. 技术实现架构

#### 3.1 数据结构设计

```typescript
// 游戏模式类型
interface GameMode {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

// 旋律数据结构
interface MelodyPattern {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bpm: number;
  notes: MelodyNote[];
  previewAudio?: string;
  tags: string[];
}

interface MelodyNote {
  cellId: string;          // 对应的格子ID
  startTime: number;       // 开始时间(毫秒)
  duration: number;        // 持续时间(毫秒)
  intensity: number;       // 强度(0-1)
}

// 游戏状态
interface GameState {
  mode: 'demo' | 'practice' | 'challenge' | 'result';
  currentMelody: MelodyPattern | null;
  playerInput: MelodyNote[];
  score: GameScore;
  isPlaying: boolean;
  showHints: boolean;
}

interface GameScore {
  accuracy: number;        // 准确度(0-100)
  timing: number;          // 节拍准确度(0-100)
  completeness: number;    // 完整度(0-100)
  totalScore: number;      // 总分(0-100)
  stars: number;           // 星级(1-3)
}
```

#### 3.2 组件结构

```
src/modules/mikutap/components/game/
├── GameModeSelector.tsx       # 模式选择弹窗
├── GameModeSwitch.tsx         # 模式切换按钮
├── MelodyGameController.tsx   # 游戏主控制器
├── MelodyDemo.tsx            # 旋律示范组件
├── ScoreDisplay.tsx          # 分数显示组件
├── GameHUD.tsx               # 游戏界面HUD
├── TutorialOverlay.tsx       # 新手教程覆盖层
└── MelodyLibrary.tsx         # 旋律库选择界面
```

#### 3.3 游戏状态管理

```typescript
// 游戏模式Hook
const useGameMode = () => {
  const [gameState, setGameState] = useState<GameState>();
  const [selectedMelody, setSelectedMelody] = useState<MelodyPattern>();
  const [playerPerformance, setPlayerPerformance] = useState<MelodyNote[]>();
  
  // 播放示范旋律
  const playDemo = async (melody: MelodyPattern) => { ... };
  
  // 开始挑战模式
  const startChallenge = () => { ... };
  
  // 评分算法
  const calculateScore = (expected: MelodyNote[], actual: MelodyNote[]) => { ... };
  
  // 游戏进度保存
  const saveProgress = () => { ... };
  
  return { gameState, playDemo, startChallenge, calculateScore };
};
```

### 4. 内置旋律库设计

#### 4.1 经典旋律分类

**儿童歌曲类（简单）：**
- 小星星 (Twinkle Twinkle Little Star)
- 生日快乐歌
- 两只老虎
- 小毛驴

**流行音乐类（中等）：**
- 卡农 (Canon in D) - 主旋律片段
- 月光下的凤尾竹 - 开头旋律
- 天空之城 - 主题旋律
- 千与千寻 - 主题曲片段

**古典音乐类（困难）：**
- 贝多芬 - 欢乐颂
- 莫扎特 - 小夜曲
- 肖邦 - 夜曲片段
- 巴赫 - 小步舞曲

**动漫游戏类（中等-困难）：**
- 初音未来经典曲目片段
- 最终幻想主题曲
- 宫崎骋动画音乐
- 经典游戏BGM

#### 4.2 自适应难度系统

```typescript
interface DifficultyConfig {
  noteCount: number;        // 音符数量
  complexity: number;       // 旋律复杂度
  tempo: number;           // 速度要求
  allowedMistakes: number; // 允许错误次数
  hintLevel: number;       // 提示等级
}

const DIFFICULTY_LEVELS = {
  easy: {
    noteCount: 3-5,
    complexity: 1,
    tempo: 60-80,
    allowedMistakes: 3,
    hintLevel: 3
  },
  medium: {
    noteCount: 6-10,
    complexity: 2,
    tempo: 80-120,
    allowedMistakes: 2,
    hintLevel: 2
  },
  hard: {
    noteCount: 11-20,
    complexity: 3,
    tempo: 120-160,
    allowedMistakes: 1,
    hintLevel: 1
  }
};
```

### 5. 用户体验设计

#### 5.1 视觉反馈系统

**游戏界面元素：**
- **进度条**：显示当前旋律播放进度
- **节拍器**：可视化节拍指示器
- **按键高亮**：实时显示应该按的键
- **分数动画**：得分时的视觉特效
- **连击显示**：连续正确的视觉奖励

**动画效果：**
- 正确按键：绿色光圈 + 音符粒子效果
- 错误按键：红色闪烁 + 震动反馈
- 完美演奏：彩虹特效 + 欢庆动画
- 旋律完成：星星评级动画

#### 5.2 音频反馈系统

**示范模式：**
- 原始音效播放旋律
- 节拍器辅助音
- 可调节播放速度（0.5x - 1.5x）

**挑战模式：**
- 实时音效反馈
- 错误音效提示
- 成功完成音效奖励

#### 5.3 个性化设置

**游戏设置：**
- 难度自动调节开关
- 提示等级选择
- 节拍器开关
- 音效音量独立调节
- 视觉特效强度

**辅助功能：**
- 慢速播放模式
- 循环播放次数设置
- 颜色主题适配
- 触觉反馈强度

### 6. 成就系统设计

#### 6.1 成就类别

**技能成就：**
- 🎵 初学者：完成第一首旋律
- 🎶 节拍大师：节拍准确度达到95%以上
- 🎹 旋律天才：完成10首困难旋律
- 🌟 完美主义：获得100个满分

**进度成就：**
- 📈 持之以恒：连续7天游戏
- 🏆 收集家：解锁所有旋律
- 🎯 挑战者：尝试所有难度等级
- 👑 大师级：总分达到特定阈值

**创意成就：**
- 🎨 创作者：录制自己的旋律
- 🤝 分享者：分享旋律给朋友
- 💡 探索者：发现隐藏旋律
- ⭐ 评价者：为旋律评分

#### 6.2 奖励系统

**解锁内容：**
- 新的音效包
- 特殊视觉效果
- 限定颜色主题
- 高级游戏模式

**虚拟货币：**
- 音符币：通过游戏获得
- 购买提示道具
- 解锁特殊内容
- 自定义外观

### 7. 开发实施计划

#### 阶段1：基础框架 (1-2周)
- [x] 模式选择弹窗组件
- [ ] 游戏状态管理系统
- [ ] 基础UI组件开发
- [ ] 旋律数据结构定义

#### 阶段2：核心游戏机制 (2-3周)
- [ ] 旋律播放引擎
- [ ] 用户输入捕获和分析
- [ ] 评分算法实现
- [ ] 基础旋律库创建

#### 阶段3：用户体验优化 (1-2周)
- [ ] 视觉反馈系统
- [ ] 音频反馈完善
- [ ] 新手引导流程
- [ ] 设置和个性化

#### 阶段4：扩展功能 (2-3周)
- [ ] 成就系统
- [ ] 高级游戏模式
- [ ] 社交功能
- [ ] 数据统计和分析

#### 阶段5：测试和优化 (1-2周)
- [ ] 性能优化
- [ ] 兼容性测试
- [ ] 用户体验测试
- [ ] Bug修复和完善

### 8. 技术挑战和解决方案

#### 8.1 音频同步精度
**挑战**：确保演奏时机的精确检测
**解决方案**：
- 使用高精度时间戳
- Web Audio API精确计时
- 音频延迟补偿机制

#### 8.2 实时性能优化
**挑战**：游戏模式下的流畅体验
**解决方案**：
- 音频预加载和缓存
- 帧率优化和防抖动
- 内存管理优化

#### 8.3 跨设备兼容
**挑战**：不同设备的音频延迟差异
**解决方案**：
- 自动延迟检测校准
- 设备特定的优化配置
- 用户自定义校准工具

### 9. 数据分析和改进

#### 9.1 关键指标
- 游戏模式使用率
- 平均游戏时长
- 旋律完成率
- 用户进步速度
- 错误模式分析

#### 9.2 A/B测试计划
- 不同难度曲线效果
- 提示系统有效性
- 奖励机制吸引力
- UI布局优化效果

## 🎯 预期成果

1. **增强用户粘性**：游戏化元素提升长期使用意愿
2. **教育价值**：帮助用户学习音乐基础知识
3. **技能提升**：通过练习提高音乐感知能力
4. **社交互动**：为未来的多人功能奠定基础
5. **品牌差异化**：在音效工具中独树一帜的游戏体验

## 📚 参考资料

- 音乐游戏设计模式研究
- Web Audio API最佳实践
- 游戏化学习理论
- 音乐教育心理学
- 用户体验设计原则

---

*本方案将分阶段实施，确保每个功能都经过充分测试和用户验证，最终打造出既实用又有趣的音乐学习游戏平台。* 