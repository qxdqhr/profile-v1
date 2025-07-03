// 扩展的音效类型
export type SoundType = 'piano' | 'drum' | 'synth' | 'bass' | 'lead' | 'pad' | 'fx' | 'vocal' | 'custom';

// 音效源类型
export type SoundSource = 'synthesized' | 'file' | 'url';

// 动画类型
export type AnimationType = 'pulse' | 'slide' | 'bounce' | 'flash' | 'spin' | 'scale' | 'ripple' | 'custom' | 'explosion' | 'vortex' | 'lightning' | 'rainbow' | 'wave';

// 背景动画类型 - 与按钮动效类型对齐
export type BackgroundAnimationType = 'pulse' | 'slide' | 'bounce' | 'flash' | 'spin' | 'scale' | 'ripple' | 'explosion' | 'vortex' | 'lightning' | 'rainbow' | 'wave' | 'custom' | 'none';

// 动画配置
export interface AnimationConfig {
  duration?: number;        // 动画持续时间(ms)
  speed?: number;          // 动画速度倍数
  scale?: number;          // 缩放倍数
  opacity?: number;        // 透明度
  direction?: 'up' | 'down' | 'left' | 'right' | 'random'; // 动画方向
  loop?: boolean;          // 是否循环
  autoplay?: boolean;      // 是否自动播放
  offset?: { x: number; y: number }; // 位置偏移
}

// 背景动画配置
export interface BackgroundAnimationConfig {
  intensity?: number;       // 动画强度 (0-100)
  colorOverride?: string;   // 颜色覆盖
  size?: number;           // 动画大小倍数
  position?: 'center' | 'random' | 'custom'; // 动画位置
  customPosition?: { x: number; y: number }; // 自定义位置
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay'; // 混合模式
}

// 网格单元格配置
export interface GridCell {
    id: string;
    row: number;
    col: number;
    key?: string;  // 键盘按键（可选）
    soundType: SoundType;
    soundSource: SoundSource;
    waveType: 'sine' | 'square' | 'sawtooth' | 'triangle';
    frequency?: number;
    volume?: number;
    description: string;
    icon: string;
    color: string;
    enabled: boolean;
    // 新增音效文件支持
    audioFile?: string;      // 音频文件路径或URL
    audioBuffer?: ArrayBuffer;  // 音频缓冲区
    // 新增音效处理参数
    effects?: {
      reverb?: number;       // 混响 0-100
      delay?: number;        // 延迟 0-100
      filter?: {             // 滤波器
        type: 'lowpass' | 'highpass' | 'bandpass';
        frequency: number;
        Q: number;
      };
      envelope?: {           // 包络
        attack: number;
        decay: number;
        sustain: number;
        release: number;
      };
    };
    // 动画配置
    animationEnabled?: boolean;    // 是否启用动画
    animationType?: AnimationType; // 动画类型
    animationData?: any;          // Lottie JSON数据或自定义动画数据
    animationConfig?: AnimationConfig; // 动画配置参数
    
    // 背景动画配置
    backgroundAnimationEnabled?: boolean;    // 是否启用背景动画
    backgroundAnimationType?: BackgroundAnimationType; // 背景动画类型
    backgroundAnimationConfig?: BackgroundAnimationConfig; // 背景动画配置参数
  }
  
  // 网格配置
  export interface GridConfig {
    id: string;
    name: string;
    description: string;
    rows: number;
    cols: number;
    cells: GridCell[];
    createdAt: Date;
    updatedAt: Date;
    // 新增音效库
    soundLibrary?: {
      [key: string]: {
        name: string;
        file: string;
        type: SoundType;
        description: string;
      };
    };
    // 界面设置
    interfaceSettings?: InterfaceSettings;
  }
  
  // 默认键位映射
  export const DEFAULT_KEYS = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
  
  // 扩展的音效类型
  export const SOUND_TYPES: SoundType[] = [
    'piano', 'drum', 'synth', 'bass', 'lead', 'pad', 'fx', 'vocal', 'custom'
  ];
  
  // 波形类型
  export const WAVE_TYPES: Array<'sine' | 'square' | 'sawtooth' | 'triangle'> = [
    'sine', 'square', 'sawtooth', 'triangle'
  ];
  
  // 音效类型颜色映射
  export const SOUND_TYPE_COLORS: Record<SoundType, string> = {
    piano: '#3B82F6',    // 蓝色
    drum: '#10B981',     // 绿色
    synth: '#8B5CF6',    // 紫色
    bass: '#F59E0B',     // 橙色
    lead: '#EF4444',     // 红色
    pad: '#06B6D4',      // 青色
    fx: '#84CC16',       // 柠檬绿
    vocal: '#EC4899',    // 粉色
    custom: '#6B7280'    // 灰色
  };
  
  // 音效源类型
export const SOUND_SOURCES: SoundSource[] = ['synthesized', 'file', 'url'];

// 动画类型数组
export const ANIMATION_TYPES: AnimationType[] = [
  'pulse', 'slide', 'bounce', 'flash', 'spin', 'scale', 'ripple', 'explosion', 'vortex', 'lightning', 'rainbow', 'wave', 'custom'
];

// 背景动画类型数组 - 与按钮动效对齐
export const BACKGROUND_ANIMATION_TYPES: BackgroundAnimationType[] = [
  'none', 'pulse', 'slide', 'bounce', 'flash', 'spin', 'scale', 'ripple', 'explosion', 'vortex', 'lightning', 'rainbow', 'wave', 'custom'
];

// 动画类型描述
export const ANIMATION_TYPE_DESCRIPTIONS: Record<AnimationType, string> = {
  pulse: '脉冲效果 - 放大缩小',
  slide: '滑动效果 - 方块滑过',
  bounce: '弹跳效果 - 上下弹跳',
  flash: '闪烁效果 - 快速闪烁',
  spin: '旋转效果 - 360度旋转',
  scale: '缩放效果 - 渐变缩放',
  ripple: '涟漪效果 - 水波扩散',
  explosion: '爆炸效果 - 快速扩张',
  vortex: '漩涡效果 - 旋转缩放',
  lightning: '闪电效果 - 快速闪烁',
  rainbow: '彩虹效果 - 颜色渐变',
  wave: '波浪效果 - 多重扩散',
  custom: '自定义动画 - Lottie JSON'
};

// 背景动画类型描述 - 与按钮动效对齐
export const BACKGROUND_ANIMATION_DESCRIPTIONS: Record<BackgroundAnimationType, string> = {
  none: '无背景动画',
  pulse: '脉冲动画 - 优雅扩散',
  slide: '滑动动画 - 流畅滑移',
  bounce: '弹跳动画 - 活力跳跃',
  flash: '闪烁动画 - 快速闪耀',
  spin: '旋转动画 - 优雅旋转',
  scale: '缩放动画 - 渐变缩放',
  ripple: '涟漪动画 - 波纹扩散',
  explosion: '爆炸动画 - 星状爆发',
  vortex: '漩涡动画 - 螺旋旋转',
  lightning: '闪电动画 - 电光闪烁',
  rainbow: '彩虹动画 - 色彩旋转',
  wave: '波纹动画 - 多重涟漪',
  custom: '自定义动画 - Lottie JSON'
};

// 配置存储键
export const CONFIG_STORAGE_KEY = 'mikutap-config';

// 背景音乐类型
export interface RhythmPattern {
  enabled: boolean;
  pattern: number[];
  soundType: 'sine' | 'square' | 'sawtooth' | 'triangle';
  volume: number;
}

export interface BackgroundMusic {
  id: string;
  name: string;
  audioData: string; // Base64编码的音频数据 - 必填
  fileType: 'uploaded' | 'generated';
  volume: number;
  loop: boolean;
  bpm: number;
  isDefault: boolean;
  rhythmPattern: RhythmPattern;
  size?: number;
  duration?: number;
  generationConfig?: any;
  description?: string;
  timeSignature?: {
    numerator: number;
    denominator: number;
  };
}

// 界面设置类型
export interface InterfaceSettings {
  volume: number;
  enableParticles: boolean;
  enableDragThrottle: boolean;
  dragThrottleDelay: number;
  particleLifetime: number;
  keyboardEnabled: boolean;
  mouseEnabled: boolean;
  enableRegionAnimations: boolean;
  enableBackgroundAnimations: boolean;
}

// 默认界面设置
export const DEFAULT_INTERFACE_SETTINGS: InterfaceSettings = {
  volume: 1.0,
  enableParticles: true,
  enableDragThrottle: true,
  dragThrottleDelay: 10,
  particleLifetime: 1000,
  keyboardEnabled: true,
  mouseEnabled: true,
  enableRegionAnimations: true,
  enableBackgroundAnimations: true,
};