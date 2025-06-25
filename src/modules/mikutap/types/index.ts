// 扩展的音效类型
export type SoundType = 'piano' | 'drum' | 'synth' | 'bass' | 'lead' | 'pad' | 'fx' | 'vocal' | 'custom';

// 音效源类型
export type SoundSource = 'synthesized' | 'file' | 'url';

// 动画类型
export type AnimationType = 'pulse' | 'slide' | 'bounce' | 'flash' | 'spin' | 'scale' | 'ripple' | 'custom';

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
  'pulse', 'slide', 'bounce', 'flash', 'spin', 'scale', 'ripple', 'custom'
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
  custom: '自定义动画 - Lottie JSON'
};

// 配置存储键
export const CONFIG_STORAGE_KEY = 'mikutap-config';