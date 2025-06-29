# Mikutap 背景音乐管理系统

## 功能概述

Mikutap 背景音乐管理系统支持两种主要功能：

1. **上传音乐文件**：用户可以上传自己的音频文件作为背景音乐
2. **生成音乐**：使用内置的音乐生成器创建自定义背景音乐

## 核心特性

### 1. 背景音乐播放触发机制

- 背景音乐会在用户**首次点击音频响应块**时自动开始播放
- 支持两种音乐文件格式：
  - 上传的音乐文件（data: URL格式）
  - 生成的音乐（blob: URL格式）

### 2. 音乐生成器配置

音乐生成器支持以下配置选项：

#### 音乐风格
- **欢乐C大调**：明亮、积极的C大调I-IV-V-I和弦进行
- **忧郁A小调**：深沉、感性的A小调和弦进行
- **活力E大调**：充满活力的E大调和弦进行
- **平和G大调**：宁静、舒缓的G大调和弦进行

#### 音乐参数
- **BPM**：60-200，控制音乐速度
- **拍号**：4/4、3/4、2/4、6/8拍
- **时长**：4-60秒
- **波形类型**：正弦波、方波、锯齿波、三角波
- **音量**：0-100%
- **低音线**：可选择是否添加低音线增强音乐层次

### 3. 节奏系统

支持为背景音乐添加节奏层：

- **节奏音色**：正弦波、方波、锯齿波、三角波
- **节奏音量**：独立的音量控制
- **自动节奏型**：根据拍号自动生成合适的节奏型
  - 4/4拍：[1, 0.5, 0.5, 0.5]
  - 3/4拍：[1, 0.5, 0.5]
  - 2/4拍：[1, 0.5]
  - 6/8拍：[1, 0.5, 0.5, 0.5, 0.5, 0.5]

## 技术实现

### 音乐生成器 (MusicGenerator)

```typescript
interface MusicGenerationConfig {
  bpm: number;
  chordProgression: 'happy' | 'sad' | 'energetic' | 'peaceful';
  timeSignature: { numerator: number; denominator: number };
  duration: number;
  volume: number;
  waveType: 'sine' | 'square' | 'sawtooth' | 'triangle';
  enableHarmony: boolean;
  bassline: boolean;
}
```

### 节奏生成器 (RhythmGenerator)

```typescript
interface RhythmPattern {
  enabled: boolean;
  pattern: number[];
  soundType: 'sine' | 'square' | 'sawtooth' | 'triangle';
  volume: number;
}
```

### 背景音乐对象

```typescript
interface BackgroundMusic {
  id: string;
  name: string;
  file: string; // data: URL 或 blob: URL
  volume: number;
  loop: boolean;
  bpm: number;
  isDefault: boolean;
  rhythmPattern: RhythmPattern;
}
```

## 使用流程

### 1. 上传音乐

1. 在配置页面选择"上传音乐"标签
2. 输入音乐名称
3. 选择音频文件
4. 配置音量、循环播放等选项
5. 配置节奏设置（可选）
6. 点击"保存音乐"

### 2. 生成音乐

1. 在配置页面选择"生成音乐"标签
2. 输入音乐名称
3. 选择音乐风格、波形类型、BPM等参数
4. 配置拍号、时长、音量等
5. 选择是否添加低音线
6. 配置节奏设置（可选）
7. 点击"预览音乐"试听效果
8. 点击"生成并保存"保存音乐

### 3. 使用背景音乐

1. 在音乐列表中选择要使用的音乐
2. 点击"使用"按钮
3. 可选择"设为默认"作为默认背景音乐
4. 在Mikutap游戏中首次点击音频响应块时，背景音乐会自动开始播放

## 文件结构

```
src/modules/mikutap/
├── components/
│   └── BackgroundMusicManager.tsx  # 背景音乐管理组件（已弃用）
├── pages/
│   ├── ConfigPage.tsx              # 配置页面（包含背景音乐管理）
│   └── SimpleMikutapPage.tsx       # 主游戏页面
├── utils/
│   ├── musicGenerator.ts           # 音乐生成器
│   └── rhythmGenerator.ts          # 节奏生成器
├── types/
│   └── index.ts                    # 类型定义
└── BACKGROUND_MUSIC_GUIDE.md       # 本文档
```

## 存储机制

- 背景音乐列表存储在 `localStorage` 中
- 键名：`mikutap-background-music`
- 格式：JSON字符串数组

## 音频格式支持

### 输入格式
- 上传：支持浏览器支持的所有音频格式（MP3、WAV、OGG等）
- 生成：内部生成WAV格式

### 输出格式
- 上传的音乐：转换为base64编码的data URL
- 生成的音乐：WAV格式的blob URL

## 性能考虑

- 音乐生成是实时进行的，复杂的配置可能需要更多时间
- 生成的音乐文件大小取决于时长和采样率
- 建议生成的音乐时长不超过60秒以保持良好性能

## 扩展性

系统设计支持未来扩展：

1. **自定义和弦进行**：可以添加用户自定义和弦序列
2. **更多音乐风格**：可以轻松添加新的预设风格
3. **音效处理**：可以添加混响、延迟等音效
4. **MIDI支持**：可以扩展支持MIDI文件导入
5. **云存储**：可以将音乐存储到云端而非本地

## 故障排除

### 常见问题

1. **音乐无法播放**
   - 检查浏览器是否支持Web Audio API
   - 确保音频文件格式受支持
   - 检查音量设置

2. **生成的音乐质量不佳**
   - 尝试不同的波形类型
   - 调整音量和BPM设置
   - 检查拍号设置是否合适

3. **节奏不同步**
   - 确保BPM设置一致
   - 检查节奏型是否适合选择的拍号
   - 调整节奏音量

### 调试信息

- 在浏览器控制台中查看错误信息
- 检查 `localStorage` 中的背景音乐数据
- 使用浏览器的Web Audio调试工具 