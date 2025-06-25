// 扩展的音效类型
export type SoundType = 'piano' | 'drum' | 'synth' | 'bass' | 'lead' | 'pad' | 'fx' | 'vocal' | 'custom';

// 音效源类型
export type SoundSource = 'synthesized' | 'file' | 'url';

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
  
  // 配置存储键
  export const CONFIG_STORAGE_KEY = 'mikutap-config';