# VocaloidtoGO - 基于 VOCALOID 歌曲的日语学习游戏

## 1. 游戏核心机制设计

### 1.1 歌词同步显示
- 类似卡拉OK的歌词高亮显示系统
- 重点单词特殊标记与动画效果

### 1.2 互动方式
- 点击/划动匹配单词
- 填空题形式（播放时隐藏特定单词）
- 手势操作互动（假名/汉字划动）

## 2. 学习系统设计

### 2.1 分级系统
- 歌曲难度分级（N5-N1）
- 单词出现频率复习机制

### 2.2 知识点拆解
- 单词解释（中日英对照）
- 语法要点标注
- 相关词汇联想

### 2.3 成就系统
- 学习进度追踪
- 掌握单词数统计
- 连续学习天数奖励

## 3. 技术实现建议

### 3.1 音频处理
- Web Audio API 音频处理
- Howler.js 音频控制

### 3.2 歌词同步
- LRC 文件格式时间轴处理
- anime.js 动画效果

### 3.3 前端框架
- React + TypeScript
- Redux/Zustand 状态管理

### 3.4 数据存储
- LocalStorage/IndexedDB 本地存储
- 后端数据库用户进度

## 4. 用户体验优化

### 4.1 视觉反馈
- 答对/答错动画效果
- 进度条显示
- 成就解锁提示

### 4.2 音频控制
- 速度调节功能
- 片段重复播放
- 音量控制系统

### 4.3 学习辅助
- 发音示范功能
- 假名注音显示
- 上下文例句提供

## 5. 特色功能建议

### 5.1 社交功能
- 学习进度分享
- 歌曲难度评分
- 用户笔记分享

### 5.2 个性化学习
- 个人词库生成
- 错题集复习
- 学习数据分析

### 5.3 游戏化元素
- 每日挑战系统
- 排行榜机制
- 成就徽章收集

## 6. 内容运营建议
- 精选热门 VOCALOID 歌曲
- 定期更新歌曲库
- 根据用户反馈调整难度
- 用户歌曲投稿机制

## MVP 开发建议
首个版本应专注于以下核心功能：
1. 基础的歌词显示和同步
2. 简单的互动机制
3. 基础的学习追踪

后续可根据用户反馈逐步迭代，添加更多功能。

## 开发步骤规划

### 第一阶段：项目初始化与基础架构（1-2天）
1. **环境搭建**
   - Next.js + TypeScript 项目初始化
   - 依赖安装
     ```bash
     # 1. 核心依赖安装
     pnpm add howler @types/howler animejs @types/animejs pixi.js @pixi/react zustand tailwindcss postcss autoprefixer @types/node @types/react @types/react-dom typescript eslint prettier eslint-config-prettier eslint-plugin-react @typescript-eslint/parser @typescript-eslint/eslint-plugin

     # 2. 开发依赖安装
     pnpm add -D @types/howler gsap @types/gsap stats.js @types/stats.js
     ```
   - 已安装的依赖说明：
     - **核心游戏引擎**: pixi.js, @pixi/react (2D渲染), howler (音频), animejs/gsap (动画)
     - **开发工具**: TypeScript, ESLint, Prettier, stats.js (性能监控)
     - **状态管理**: Zustand (轻量级状态管理)
     - **样式工具**: Tailwind CSS, PostCSS, Autoprefixer
   - 配置 ESLint 和 Prettier
   - 设置基础目录结构

2. **数据结构设计**

#### 2.1 基础数据类型

##### 歌曲相关
```typescript
// 歌曲完整信息
interface Song {
    id: string;
    title: string;
    artist: string;
    difficulty: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    duration: number;  // 歌曲时长（秒）
    audioUrl: string;  // 音频文件路径
    coverUrl: string;  // 封面图片路径
    bpm: number;      // 歌曲速度
    tags: string[];   // 标签（如：流行、摇滚等）
}

// 歌曲元数据（用于列表展示）
interface SongMeta {
    id: string;
    title: string;
    artist: string;
    difficulty: Song['difficulty'];
    coverUrl: string;
    duration: number;
}

// 歌曲统计信息
interface SongStats {
    playCount: number;
    correctRate: number;
    lastPlayed: Date;
    bestScore: number;
    averageScore: number;
}
```

##### 歌词相关
```typescript
// 单个歌词行
interface LyricLine {
    id: string;
    startTime: number;  // 开始时间（毫秒）
    endTime: number;    // 结束时间（毫秒）
    text: string;       // 原文
    reading: string;    // 假名读音
    translation: string; // 翻译
    words: Word[];      // 单词列表
}

// 单词信息
interface Word {
    id: string;
    text: string;       // 原文
    reading: string;    // 假名读音
    meaning: string;    // 中文含义
    level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';  // JLPT等级
    startIndex: number; // 在原文中的起始位置
    endIndex: number;   // 在原文中的结束位置
    isKeyword: boolean; // 是否为关键词
}

// 完整歌词数据
interface LyricsData {
    songId: string;
    lines: LyricLine[];
    totalWords: number;
    uniqueWords: number;
    difficultyStats: {
        N5: number;
        N4: number;
        N3: number;
        N2: number;
        N1: number;
    };
}
```

##### 游戏相关
```typescript
// 游戏模式
type GameMode = 'practice' | 'challenge' | 'review';

// 游戏设置
interface GameSettings {
    mode: GameMode;
    showReading: boolean;     // 是否显示假名
    showTranslation: boolean; // 是否显示翻译
    autoPlay: boolean;        // 是否自动播放下一首
    playbackSpeed: number;    // 播放速度 (0.5-2.0)
}

// 游戏进度
interface GameProgress {
    score: number;
    combo: number;
    maxCombo: number;
    correctWords: Word[];
    wrongWords: Word[];
    timeSpent: number;
}

// 用户学习数据
interface UserStats {
    totalPlayTime: number;
    songsPlayed: number;
    wordsLearned: number;
    dailyStreak: number;
    songStats: Record<string, SongStats>;
    recentSongs: Song[];
    favoriteWords: Word[];
}
```

#### 2.2 状态管理设计

##### 游戏核心状态 (useGameStore)
```typescript
interface GameStore {
    // 状态
    session: GameSession;
    settings: GameSettings;
    
    // 动作
    startGame: (songId: string) => void;
    pauseGame: () => void;
    resumeGame: () => void;
    endGame: () => void;
    updateProgress: (progress: Partial<GameProgress>) => void;
    updateSettings: (settings: Partial<GameSettings>) => void;
    resetSession: () => void;
}
```

##### 歌词同步状态 (useLyricsStore)
```typescript
interface LyricsStore {
    // 状态
    currentLyrics: LyricsData | null;
    lyricState: LyricState;
    
    // 动作
    loadLyrics: (lyrics: LyricsData) => void;
    updateTime: (time: number) => void;
    highlightWord: (word: Word | null) => void;
    setPlaying: (isPlaying: boolean) => void;
    reset: () => void;
}
```

##### 用户数据状态 (useUserStore)
```typescript
interface UserStore {
    // 状态
    stats: UserStats;
    
    // 动作
    updatePlayTime: (seconds: number) => void;
    addPlayedSong: (song: Song) => void;
    updateSongStats: (songId: string, stats: Partial<SongStats>) => void;
    addLearnedWord: (word: Word) => void;
    addFavoriteWord: (word: Word) => void;
    removeFavoriteWord: (wordId: string) => void;
    updateDailyStreak: () => void;
    resetStats: () => void;
}
```

#### 2.3 状态管理特点
1. **持久化处理**
   - 游戏设置持久化
   - 用户统计数据持久化
   - 使用 localStorage 存储

2. **状态隔离**
   - 游戏核心逻辑
   - 歌词同步系统
   - 用户数据管理

3. **类型安全**
   - 完整的 TypeScript 类型定义
   - 状态更新类型检查
   - 动作参数类型验证

### 第二阶段：核心功能开发（3-5天）
1. **音频系统实现**
   - 集成 Howler.js
   - 实现基础播放控制
   - 添加进度跟踪功能

2. **歌词显示系统**
   - 解析 LRC 文件
   - 实现歌词同步显示
   - 添加高亮效果

3. **交互功能**
   - 实现单词点击识别
   - 添加基础动画效果
   - 设计简单的评分系统

### 第三阶段：学习功能（3-4天）
1. **单词系统**
   - 实现单词解释显示
   - 添加假名注音功能
   - 设计简单的记忆测试

2. **进度追踪**
   - 实现本地数据存储
   - 添加学习统计
   - 设计简单的复习机制

### 第四阶段：UI/UX优化（2-3天）
1. **界面美化**
   - 设计并实现主界面
   - 添加响应式布局
   - 优化动画效果

2. **用户体验**
   - 添加加载状态
   - 实现错误处理
   - 优化交互反馈

### 第五阶段：测试与发布（2-3天）
1. **测试**
   - 单元测试编写
   - 性能测试
   - 兼容性测试

2. **部署**
   - 配置部署环境
   - 性能优化
   - 发布第一个版本

### 后续迭代计划
- 添加更多歌曲
- 实现用户系统
- 添加社交功能
- 优化学习算法
- 增加游戏化元素

## 技术栈选择
- **前端框架**: Next.js + TypeScript
- **状态管理**: Zustand
- **样式方案**: Tailwind CSS
- **音频处理**: Howler.js
- **动画效果**: anime.js
- **数据存储**: LocalStorage (前期)
- **开发工具**: ESLint + Prettier
- **版本控制**: Git

## 注意事项
1. 每个阶段结束后进行代码审查
2. 保持代码简洁，做好注释
3. 遵循 TypeScript 最佳实践
4. 注意性能优化
5. 保持良好的错误处理
6. 做好版本控制管理

### 第一阶段：项目初始化与基础架构（1-2天）

3. **UI组件实现**
   
#### 3.1 目录结构
```
src/app/testField/VocaloidtoGO/
├── components/
│   └── common/
│       ├── Button.tsx      // 通用按钮组件
│       ├── Card.tsx        // 卡片容器组件
│       ├── IconButton.tsx  // 图标按钮组件
│       ├── ProgressBar.tsx // 进度条组件
│       └── index.ts        // 组件导出
└── styles/
    └── components/
        └── common/
            ├── button.css      // 按钮样式
            ├── card.css        // 卡片样式
            ├── icon-button.css // 图标按钮样式
            ├── progress-bar.css // 进度条样式
            └── index.css       // 样式导出
```

#### 3.2 基础组件实现

##### Button 组件
```typescript
interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
}
```
样式类：
- `.btn`: 基础按钮样式
- `.btn-primary`, `.btn-secondary`, `.btn-outline`: 变体样式
- `.btn-sm`, `.btn-md`, `.btn-lg`: 尺寸样式
- `.btn-disabled`, `.btn-loading`: 状态样式

##### ProgressBar 组件
```typescript
interface ProgressBarProps {
    progress: number;  // 0 到 100 之间的数值
    height?: number;   // 高度（像素）
    showLabel?: boolean;
    className?: string;
}
```
样式类：
- `.progress-container`: 容器样式
- `.progress-track`: 进度条轨道
- `.progress-bar`: 进度条
- `.progress-label`: 标签样式

##### IconButton 组件
```typescript
interface IconButtonProps {
    icon: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isRound?: boolean;
}
```
样式类：
- `.icon-btn`: 基础图标按钮样式
- `.icon-btn-primary`, `.icon-btn-secondary`, `.icon-btn-ghost`: 变体样式
- `.icon-btn-sm`, `.icon-btn-md`, `.icon-btn-lg`: 尺寸样式
- `.icon-btn-round`, `.icon-btn-square`: 形状样式

##### Card 组件
```typescript
interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}
```
样式类：
- `.card`: 基础卡片样式
- `.card-hoverable`: 悬停效果
- `.card-header`: 头部样式
- `.card-title`: 标题样式
- `.card-subtitle`: 副标题样式
- `.card-body`: 内容区域样式

#### 3.3 样式特点
1. **CSS 模块化**
   - 样式与组件分离
   - 使用 BEM 命名规范
   - 基于 Tailwind 的 @apply 指令

2. **组件特点**
   - TypeScript 类型支持
   - 支持样式自定义
   - 使用 tailwind-merge 处理类名冲突

3. **依赖管理**
```bash
pnpm add tailwind-merge  # 用于合并 Tailwind 类名
```

#### 3.4 播放器组件实现

##### 目录结构
```
src/app/testField/VocaloidtoGO/
├── components/
│   └── player/
│       ├── Player.tsx    // 播放器组件
│       └── index.ts      // 导出文件
└── styles/
    └── components/
        └── player/
            └── player.css // 播放器样式
```

##### 组件接口
```typescript
interface PlayerProps {
    className?: string;
}
```

##### 功能实现
1. **音频控制**
   - 使用 Howler.js 处理音频播放
   - 支持播放/暂停控制
   - 支持进度跳转
   - 支持音量调节

2. **状态管理**
   ```typescript
   const [isPlaying, setIsPlaying] = useState(false);
   const [currentTime, setCurrentTime] = useState(0);
   const [duration, setDuration] = useState(0);
   const [volume, setVolume] = useState(1);
   ```

3. **UI 组件**
   - 歌曲信息显示（标题、艺术家）
   - 播放控制按钮
   - 进度条
   - 音量控制
   - 设置按钮

4. **样式设计**
```css
.player {
    @apply fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200;
}

.player-container {
    @apply container mx-auto px-4 py-3;
}

.player-main {
    @apply flex items-center justify-between gap-4;
}

// ... 其他样式类
```

5. **事件处理**
   - 进度更新：使用 requestAnimationFrame 实现平滑更新
   - 音量控制：支持点击和拖动调节
   - 进度跳转：支持点击进度条跳转
   - 游戏状态同步：与游戏状态管理器集成

6. **生命周期管理**
   ```typescript
   useEffect(() => {
       if (session.currentSong) {
           soundRef.current = new Howl({
               src: [session.currentSong.audioUrl],
               html5: true,
               volume: volume,
               // ... 事件处理
           });
       }
       return () => {
           if (soundRef.current) {
               soundRef.current.unload();
           }
       };
   }, [session.currentSong]);
   ```

#### 3.5 歌词组件实现

##### 目录结构
```
src/app/testField/VocaloidtoGO/
├── components/
│   └── lyrics/
│       ├── Lyrics.tsx     // 主歌词组件
│       ├── LyricLine.tsx  // 歌词行组件
│       └── index.ts       // 导出文件
└── styles/
    └── components/
        └── lyrics/
            └── lyrics.css  // 歌词样式
```

##### 组件接口
```typescript
// 主歌词组件
interface LyricsProps {
    className?: string;
}

// 歌词行组件
interface LyricLineProps {
    line: LyricLineType;
    isActive: boolean;
    isBefore: boolean;
    isAfter: boolean;
    onWordClick?: (word: Word) => void;
    className?: string;
}
```

##### 功能实现
1. **歌词显示**
   - 垂直滚动的歌词显示
   - 当前行高亮和缩放效果
   - 支持显示假名和翻译
   - 单词级别的交互

2. **状态管理**
   ```typescript
   // 使用 Zustand store
   const { currentLyrics, lyricState, highlightWord } = useLyricsStore();
   const { updateProgress } = useGameStore();
   ```

3. **交互功能**
   - 单词点击响应
   - 单词悬停提示
   - 学习进度追踪
   - 正确/错误反馈

4. **样式设计**
```css
.lyrics-container {
    @apply flex flex-col items-center justify-center min-h-[300px] p-4;
}

.lyrics-line {
    @apply text-center my-2 transition-all duration-300 ease-out;
}

.lyrics-line-active {
    @apply text-xl font-bold text-blue-600 scale-110 transform;
}

// ... 其他样式类
```

5. **特色功能**
   - 自动计算可见行数
   - 平滑的动画过渡
   - 单词提示框
   - 游戏进度集成

6. **性能优化**
   ```typescript
   const visibleLines = React.useMemo(() => {
       // 计算要显示的歌词行范围
       // 优化重复计算
   }, [currentLyrics, lyricState.currentLineIndex]);
   ```

#### 3.6 游戏控制组件实现

##### 目录结构
```
src/app/testField/VocaloidtoGO/
├── components/
│   └── game/
│       ├── GameControl.tsx  // 游戏控制组件
│       └── index.ts        // 导出文件
└── styles/
    └── components/
        └── game/
            └── game-control.css  // 游戏控制样式
```

##### 组件接口
```typescript
// 游戏控制组件属性
interface GameControlProps {
    className?: string;
}

// 游戏会话状态
interface GameSession {
    currentSong: Song | null;
    isPlaying: boolean;      // 游戏播放状态
    startTime: number | null;
    endTime: number | null;
    progress: GameProgress;
}

// 游戏进度
interface GameProgress {
    score: number;
    combo: number;
    maxCombo: number;
    correctWords: Word[];
    wrongWords: Word[];
    timeSpent: number;
}
```

##### 功能实现
1. **游戏控制**
   ```typescript
   const handleStart = () => {
       if (!session.currentSong) return;
       startGame(session.currentSong.id);
   };

   const handlePause = () => {
       if (session.isPlaying) {
           pauseGame();
       } else {
           resumeGame();
       }
   };
   ```

2. **状态显示**
   - 分数显示: `session.progress.score`
   - 连击显示: `session.progress.combo`
   - 准确率计算:
     ```typescript
     const accuracy = correctWords / (correctWords + wrongWords) * 100;
     ```

3. **设置管理**
   ```typescript
   const { settings, setState } = useGameStore();
   
   // 更新设置示例
   const updateSetting = (key: keyof GameSettings, value: boolean) => {
       setState({ settings: { ...settings, [key]: value } });
   };
   ```

4. **样式设计**
```css
.game-control {
    @apply flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md;
}

.game-control-info {
    @apply grid grid-cols-3 gap-4;
}

.game-control-button {
    @apply px-4 py-2 rounded-md bg-blue-500 text-white font-medium
           hover:bg-blue-600 transition-colors duration-200;
}
```

5. **状态管理**
   - 使用 Zustand store 管理游戏状态
   - 实现游戏会话的完整生命周期
   - 支持游戏设置的持久化

6. **交互特点**
   - 按钮状态自动响应游戏状态
   - 实时更新游戏数据
   - 设置变更即时生效
   - 优雅的禁用状态处理

7. **性能优化**
   - 使用 React.memo 优化渲染
   - 避免不必要的状态更新
   - 合理使用 useCallback 和 useMemo

8. **错误处理**
   - 优雅处理无歌曲状态
   - 防止重复点击
   - 状态切换保护

9. **设置面板组件实现**

##### 目录结构
```
src/app/testField/VocaloidtoGO/
├── components/
│   └── settings/
│       ├── SettingsPanel.tsx  // 设置面板组件
│       └── index.ts          // 导出文件
└── styles/
    └── components/
        └── settings/
            └── settings-panel.css  // 设置面板样式
```

##### 组件接口
```typescript
interface SettingsPanelProps {
    className?: string;
    onClose?: () => void;
}

// 游戏设置类型
interface GameSettings {
    mode: 'practice' | 'challenge' | 'review';
    showReading: boolean;     // 是否显示假名
    showTranslation: boolean; // 是否显示翻译
    autoPlay: boolean;        // 是否自动播放下一首
    playbackSpeed: number;    // 播放速度 (0.5-2.0)
}
```

##### 功能实现
1. **设置分类**
   - 游戏模式选择
   - 播放设置调整
   - 显示选项控制

2. **状态管理**
   ```typescript
   const { settings, updateSettings } = useGameStore();
   
   const handleModeChange = (mode: GameMode) => {
       updateSettings({ mode });
   };
   
   const handleToggle = (key: keyof GameSettings) => {
       updateSettings({ [key]: !settings[key] });
   };
   ```

3. **UI 组件**
   - 模式选择按钮组
   - 播放速度滑块
   - 设置开关选项
   - 关闭按钮

4. **样式设计**
```css
.settings-panel {
    @apply fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
           w-full max-w-md bg-white rounded-lg shadow-xl p-6;
}

.settings-mode-btn {
    @apply px-4 py-2 rounded-md text-sm font-medium
           bg-gray-100 text-gray-700 hover:bg-gray-200;
}

// ... 其他样式类
```

5. **交互特点**
   - 实时设置更新
   - 模态框展示
   - 平滑的动画过渡
   - 响应式布局

6. **设置持久化**
   - 使用 localStorage 存储
   - 自动加载上次设置
   - 设置变更即时保存

7. **错误处理**
   - 设置范围验证
   - 默认值回退
   - 异常状态处理

8. **辅助功能**
   - 键盘快捷键支持
   - 屏幕阅读器支持
   - 高对比度模式

### 3.8 状态管理实现

#### 目录结构
```
src/app/testField/VocaloidtoGO/
└── store/
    ├── gameStore.ts    // 游戏核心状态
    ├── lyricsStore.ts  // 歌词同步状态
    ├── userStore.ts    // 用户数据状态
    └── index.ts        // 状态管理导出
```

#### 状态设计

##### 游戏核心状态 (gameStore)
```typescript
interface GameStore {
    // 状态
    session: GameSession;
    settings: GameSettings;
    
    // 动作
    startGame: (songId: string) => void;
    pauseGame: () => void;
    resumeGame: () => void;
    endGame: () => void;
    updateProgress: (progress: Partial<GameProgress>) => void;
    updateSettings: (settings: Partial<GameSettings>) => void;
    resetSession: () => void;
}
```

##### 歌词同步状态 (lyricsStore)
```typescript
interface LyricsStore {
    // 状态
    currentLyrics: LyricsData | null;
    lyricState: LyricState;
    
    // 动作
    loadLyrics: (lyrics: LyricsData) => void;
    updateTime: (time: number) => void;
    highlightWord: (word: Word | null) => void;
    setPlaying: (isPlaying: boolean) => void;
    reset: () => void;
}
```

##### 用户数据状态 (userStore)
```typescript
interface UserStore {
    // 状态
    stats: UserStats;
    
    // 动作
    updatePlayTime: (seconds: number) => void;
    addPlayedSong: (song: Song) => void;
    updateSongStats: (songId: string, stats: Partial<SongStats>) => void;
    addLearnedWord: (word: Word) => void;
    addFavoriteWord: (word: Word) => void;
    removeFavoriteWord: (wordId: string) => void;
    updateDailyStreak: () => void;
    resetStats: () => void;
}
```

#### 实现特点

1. **状态隔离**
   - 游戏核心逻辑独立管理
   - 歌词同步系统独立管理
   - 用户数据独立管理

2. **持久化处理**
   ```typescript
   persist(
       (set, get) => ({
           // store implementation
       }),
       {
           name: 'store-name',
           partialize: (state) => ({ /* selected state */ })
       }
   )
   ```

3. **类型安全**
   - 完整的 TypeScript 类型定义
   - 状态更新类型检查
   - 动作参数类型验证

4. **状态更新**
   - 不可变数据更新
   - 选择性状态合并
   - 派生状态计算

5. **性能优化**
   - 选择性状态订阅
   - 状态分片管理
   - 状态更新批处理

6. **错误处理**
   - 状态恢复机制
   - 异常状态处理
   - 默认值回退

7. **开发工具**
   - Redux DevTools 集成
   - 状态快照
   - 时间旅行调试

### 3.9 音频系统实现

#### 目录结构
```
src/app/testField/VocaloidtoGO/
└── services/
    └── audio.ts  // 音频服务实现
```

#### 服务设计
```typescript
class AudioService {
    private sound: Howl | null;
    private currentSong: Song | null;
    private onTimeUpdate: ((time: number) => void) | null;
    private onEnd: (() => void) | null;
    private rafId: number | null;

    // 公共方法
    loadSong(song: Song): void;
    play(): void;
    pause(): void;
    stop(): void;
    seek(position: number): void;
    setVolume(volume: number): void;
    setPlaybackRate(rate: number): void;
    getCurrentTime(): number;
    getDuration(): number;
    setOnTimeUpdate(callback: (time: number) => void): void;
    setOnEnd(callback: () => void): void;
    dispose(): void;
}
```

#### 功能实现

1. **音频加载与控制**
   ```typescript
   loadSong(song: Song) {
       if (this.sound) {
           this.sound.unload();
       }

       this.sound = new Howl({
           src: [song.audioUrl],
           html5: true,
           preload: true,
           // ... 事件处理
       });
   }
   ```

2. **播放控制**
   - 播放/暂停/停止
   - 进度控制
   - 音量调节
   - 播放速度调节

3. **时间更新**
   ```typescript
   private startTimeUpdate() {
       const update = () => {
           if (this.sound?.playing()) {
               this.onTimeUpdate?.(this.getCurrentTime());
               this.rafId = requestAnimationFrame(update);
           }
       };
       this.rafId = requestAnimationFrame(update);
   }
   ```

4. **事件处理**
   - 加载完成事件
   - 错误处理
   - 播放结束事件
   - 时间更新回调

5. **资源管理**
   - 自动释放旧资源
   - 内存管理
   - 错误恢复

6. **性能优化**
   - 使用 requestAnimationFrame
   - 资源预加载
   - 状态缓存

7. **错误处理**
   - 加载错误处理
   - 播放错误恢复
   - 状态同步保护

8. **使用示例**
```typescript
// 初始化
const song: Song = {
    id: '1',
    title: 'Example Song',
    audioUrl: '/songs/example.mp3',
    // ... 其他属性
};

// 加载并播放
audioService.loadSong(song);
audioService.setOnTimeUpdate(time => {
    console.log('Current time:', time);
});
audioService.play();

// 控制播放
audioService.setVolume(0.8);
audioService.setPlaybackRate(1.5);
audioService.seek(30); // 跳转到30秒

// 清理资源
audioService.dispose();
```

### 3.10 数据服务与测试数据

#### 目录结构
```
src/app/testField/VocaloidtoGO/
├── data/
│   ├── songs.ts    // 歌曲示例数据
│   └── lyrics.ts   // 歌词示例数据
└── services/
    └── data.ts     // 数据服务实现
```

#### 示例数据

##### 歌曲数据
```typescript
export const sampleSongs: Song[] = [
    {
        id: 'song1',
        title: '千本桜',
        artist: '初音ミク',
        difficulty: 'N3',
        duration: 240,
        audioUrl: '/songs/senbonzakura.mp3',
        coverUrl: '/covers/senbonzakura.jpg',
        bpm: 154,
        tags: ['流行', '传统', '快节奏']
    },
    // ... 其他歌曲
];
```

##### 歌词数据
```typescript
export const senbonzakuraLyrics: LyricsData = {
    songId: 'song1',
    lines: [
        {
            id: 'line1',
            startTime: 0,
            endTime: 4000,
            text: '大胆不敵にハイカラ革命',
            reading: 'だいたんふてきにハイカラかくめい',
            translation: '大胆不羁的文明开化',
            words: [
                // 单词数据
            ]
        }
    ],
    totalWords: 7,
    uniqueWords: 7,
    difficultyStats: {
        N5: 0, N4: 2, N3: 2, N2: 2, N1: 1
    }
};
```

#### 数据服务设计

##### 服务接口
```typescript
class DataService {
    // 数据存储
    private songs: Map<string, Song>;
    private lyrics: Map<string, LyricsData>;

    // 公共方法
    async getAllSongs(): Promise<Song[]>;
    async getSong(id: string): Promise<Song | null>;
    async getLyrics(songId: string): Promise<LyricsData | null>;
    async getSongsByDifficulty(difficulty: string): Promise<Song[]>;
    async searchSongs(query: string): Promise<Song[]>;
    async getRecommendedSongs(count?: number): Promise<Song[]>;
}
```

##### 功能实现

1. **数据管理**
   ```typescript
   constructor() {
       // 初始化示例数据
       sampleSongs.forEach(song => this.songs.set(song.id, song));
       this.lyrics.set('song1', senbonzakuraLyrics);
   }
   ```

2. **数据查询**
   - 获取所有歌曲
   - 按ID获取歌曲
   - 获取歌词数据
   - 按难度筛选
   - 搜索功能

3. **性能优化**
   - 使用 Map 存储
   - 数据缓存
   - 异步加载

4. **错误处理**
   - 数据验证
   - 空值处理
   - 异常恢复

5. **使用示例**
```typescript
// 获取所有歌曲
const songs = await dataService.getAllSongs();

// 获取特定歌曲及其歌词
const song = await dataService.getSong('song1');
const lyrics = await dataService.getLyrics('song1');

// 搜索歌曲
const results = await dataService.searchSongs('初音ミク');

// 获取推荐歌曲
const recommended = await dataService.getRecommendedSongs(3);
```

### 3.11 主页面实现

#### 目录结构
```
src/app/testField/VocaloidtoGO/
└── page.tsx  // 主页面组件
```

#### 页面布局
```typescript
export default function VocaloidtoGO() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* 游戏区域 */}
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 gap-8">
                    {/* 游戏控制区 */}
                    <GameControl />
                    {/* 歌词显示区 */}
                    <Lyrics />
                </div>
            </main>

            {/* 播放器 */}
            <footer className="fixed bottom-0 left-0 right-0">
                <Player />
            </footer>

            {/* 设置面板 */}
            <SettingsPanel />
        </div>
    );
}
```

#### 功能实现

1. **状态管理**
   ```typescript
   const [showSettings, setShowSettings] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const { session, settings } = useGameStore();
   const { loadLyrics } = useLyricsStore();
   ```

2. **数据加载**
   ```typescript
   useEffect(() => {
       const loadInitialData = async () => {
           try {
               const songs = await dataService.getAllSongs();
               if (songs.length > 0) {
                   const firstSong = songs[0];
                   const lyrics = await dataService.getLyrics(firstSong.id);
                   if (lyrics) {
                       loadLyrics(lyrics);
                   }
               }
           } catch (err) {
               setError('加载数据失败');
           }
       };

       loadInitialData();
   }, [loadLyrics]);
   ```

3. **音频同步**
   ```typescript
   useEffect(() => {
       if (session.currentSong) {
           audioService.setOnTimeUpdate((time) => {
               useLyricsStore.getState().updateTime(time);
           });

           audioService.setOnEnd(() => {
               useGameStore.getState().endGame();
           });
       }
   }, [session.currentSong]);
   ```

4. **设置同步**
   ```typescript
   useEffect(() => {
       audioService.setPlaybackRate(settings.playbackSpeed);
   }, [settings.playbackSpeed]);
   ```

#### 组件通信

1. **状态共享**
   - 使用 Zustand store 在组件间共享状态
   - 通过 hooks 访问全局状态
   - 使用 actions 更新状态

2. **事件处理**
   - 播放器控制事件
   - 歌词交互事件
   - 设置变更事件

3. **数据流向**
   ```
   GameStore ←→ Player
      ↑↓         ↑↓
   AudioService  Lyrics
      ↑↓         ↑↓
   LyricsStore ←→ GameControl
   ```

#### 性能优化

1. **加载优化**
   - 异步数据加载
   - 加载状态显示
   - 错误处理机制

2. **渲染优化**
   - 状态分离
   - 条件渲染
   - 组件缓存

3. **资源管理**
   - 组件卸载清理
   - 事件监听管理
   - 音频资源释放

### 3.12 工具函数实现

#### 目录结构
```
src/app/testField/VocaloidtoGO/
└── utils/
    ├── time.ts   // 时间处理工具
    ├── score.ts  // 分数计算工具
    └── index.ts  // 工具函数导出
```

#### 时间处理工具

##### 功能实现
```typescript
// 时间格式化
function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 时间单位转换
function msToSeconds(ms: number): number;
function secondsToMs(seconds: number): number;
function calculateDuration(startTime: number, endTime: number): number;
```

##### 使用场景
1. **播放器时间显示**
   ```typescript
   const timeDisplay = formatTime(currentTime);  // "03:45"
   ```

2. **进度同步**
   ```typescript
   const seconds = msToSeconds(timestamp);  // 将毫秒转换为秒
   const duration = calculateDuration(start, end);  // 计算持续时间
   ```

#### 分数计算工具

##### 功能实现
```typescript
// 单词得分计算
function calculateWordScore(word: Word, combo: number): number {
    const baseScore = 100;
    const difficultyMultiplier = {
        N5: 1.0, N4: 1.2, N3: 1.5, N2: 1.8, N1: 2.0
    };
    const keywordMultiplier = word.isKeyword ? 1.5 : 1.0;
    const comboMultiplier = 1 + Math.min(Math.floor(combo / 10) * 0.1, 1.0);

    return Math.round(
        baseScore * 
        difficultyMultiplier[word.level] * 
        keywordMultiplier * 
        comboMultiplier
    );
}

// 准确率计算
function calculateAccuracy(correctWords: Word[], wrongWords: Word[]): number;

// 最终得分计算
function calculateFinalScore(
    correctWords: Word[],
    wrongWords: Word[],
    maxCombo: number,
    timeSpent: number,
    difficulty: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
): number;
```

##### 得分系统设计

1. **基础分数**
   - 每个单词基础分数：100分
   - 难度等级加成：N5(1.0x) → N1(2.0x)
   - 关键词加成：1.5x

2. **连击系统**
   - 每10连击增加10%分数
   - 最高100%加成
   - 连击中断重置

3. **时间效率**
   - 基准：每分钟10个单词
   - 效率加成：0.5x ~ 1.5x
   - 时间压力平衡

4. **准确率影响**
   - 直接影响最终得分
   - 准确率百分比作为乘数
   - 鼓励精确学习

5. **难度加成**
   - 歌曲难度影响最终得分
   - N5 → N1 递增加成
   - 平衡挑战与奖励

##### 使用示例
```typescript
// 计算单词得分
const score = calculateWordScore(word, currentCombo);

// 计算准确率
const accuracy = calculateAccuracy(correctWords, wrongWords);

// 计算最终得分
const finalScore = calculateFinalScore(
    correctWords,
    wrongWords,
    maxCombo,
    timeSpent,
    songDifficulty
);
```
