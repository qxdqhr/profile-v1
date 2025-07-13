import { GridCell, GridConfig, AnimationType, AnimationConfig, DEFAULT_INTERFACE_SETTINGS } from '../types';

// 默认网格配置
export const DEFAULT_GRID_CONFIG: GridConfig = {
  id: 'default',
  name: '默认配置',
  description: '4x7网格，标准钢琴音阶布局 - 每行一个完整的do到si音阶',
  rows: 4,
  cols: 7,
  cells: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  interfaceSettings: DEFAULT_INTERFACE_SETTINGS,
};

// 生成默认网格单元格
export function generateDefaultCells(rows: number, cols: number): GridCell[] {
  const keys = 'qwertyuiopasdfghjklzxcvbnm'.split('');
  const cells: GridCell[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      if (index >= keys.length) break;

      const key = keys[index];
      
      // 根据索引生成默认配置
      const soundType = index < 10 ? 'piano' : index < 19 ? 'drum' : 'synth';
      const waveType = index < 10 ? 'sine' : index < 19 ? 'square' : 'sawtooth';
      const description = index < 10 ? '钢琴音' : index < 19 ? '鼓点音' : '特效音';
      const icon = index < 10 ? '🎹' : index < 19 ? '🥁' : '🎛️';
      const color = index < 10 ? '#3B82F6' : index < 19 ? '#10B981' : '#8B5CF6';
      
      // 为不同类型的音效生成不同的默认动画配置
      const animationTypes: AnimationType[] = ['pulse', 'bounce', 'flash', 'spin', 'scale', 'slide', 'ripple', 'explosion', 'vortex', 'lightning', 'rainbow', 'wave'];
      const animationType = animationTypes[index % animationTypes.length];
      
      // 根据音效类型和位置生成差异化的动画配置
      const baseDuration = 500;
      const durationVariation = (index % 5) * 100; // 100-400ms 的变化
      const scaleVariation = 1.2 + (index % 4) * 0.1; // 1.2-1.5x 的变化
      const opacityVariation = 0.6 + (index % 4) * 0.1; // 0.6-0.9 的变化
      
      const animationConfig: AnimationConfig = {
        duration: baseDuration + durationVariation,
        speed: 1,
        scale: scaleVariation,
        opacity: opacityVariation,
        direction: ['up', 'down', 'left', 'right'][index % 4] as 'up' | 'down' | 'left' | 'right',
        loop: false,
        autoplay: false,
        offset: { x: 0, y: 0 }
      };

      // 根据音效类型选择默认背景动画
      const getDefaultBackgroundAnimationType = (soundType: string, index: number) => {
        switch (soundType) {
          case 'piano':
            return ['piano', 'wave', 'spiral'][index % 3] as any;
          case 'drum':
            return ['drum', 'explosion', 'fireworks'][index % 3] as any;
          case 'synth':
          case 'fx':
            return ['synth', 'lightning', 'rainbow'][index % 3] as any;
          default:
            return 'piano' as any;
        }
      };

      cells.push({
        id: `cell-${row}-${col}`,
        row,
        col,
        key: key.toUpperCase(),
        soundType: soundType as 'piano' | 'drum' | 'synth',
        soundSource: 'synthesized',
        waveType: waveType as 'sine' | 'square' | 'sawtooth',
        frequency: getDefaultFrequency(soundType, index),
        volume: 100,
        description,
        icon,
        color,
        enabled: true,
        // 使用生成的动画设置
        animationEnabled: true,
        animationType: animationType,
        animationConfig: animationConfig,
        // 背景动画配置
        backgroundAnimationEnabled: true,
        backgroundAnimationType: getDefaultBackgroundAnimationType(soundType, index),
        backgroundAnimationConfig: {
          intensity: 80,
          size: 1.0 + (index % 3) * 0.2, // 1.0-1.4倍大小
          position: 'center',
          blendMode: 'screen'
        }
      });
    }
  }

  return cells;
}

// 获取默认频率
function getDefaultFrequency(soundType: string, index: number): number {
  // 钢琴频率：4行7列，每行一个完整的do到si音阶(C-D-E-F-G-A-B)
  const pianoFreqs = Array.from({ length: 28 }, (_, i) => {
    const row = Math.floor(i / 7); // 0-3行
    const col = i % 7; // 0-6列
    const octave = row + 2; // 从2八度开始: C2, C3, C4, C5
    
    // 基于C2 = 65.406 Hz计算
    const c2Frequency = 65.406;
    // 半音步数: C=0, D=2, E=4, F=5, G=7, A=9, B=11
    const semitoneSteps = [0, 2, 4, 5, 7, 9, 11];
    const semitonesFromC2 = (octave - 2) * 12 + semitoneSteps[col]; // 相对于C2的半音步数
    return c2Frequency * Math.pow(2, semitonesFromC2 / 12);
  });
  
  const drumFreqs = [60, 80, 100, 120, 140, 160, 180, 200, 220];
  const synthFreqs = [110, 146.83, 196, 246.94, 329.63, 415.30, 523.25];

  switch (soundType) {
    case 'piano':
      return pianoFreqs[index] || 261.63; // 默认返回中央C4
    case 'drum':
      return drumFreqs[index - 10] || 100;
    case 'synth':
      return synthFreqs[index - 19] || 220;
    default:
      return 440;
  }
}

// 重置为默认配置（生成默认配置但不保存）
export function resetToDefaultConfig(): GridConfig {
  const defaultConfig = {
    ...DEFAULT_GRID_CONFIG,
    cells: generateDefaultCells(DEFAULT_GRID_CONFIG.rows, DEFAULT_GRID_CONFIG.cols),
    interfaceSettings: DEFAULT_INTERFACE_SETTINGS,
    updatedAt: new Date(),
  };
  return defaultConfig;
}

// 更新网格尺寸
export function updateGridSize(config: GridConfig, rows: number, cols: number): GridConfig {
  const newConfig = {
    ...config,
    rows,
    cols,
    cells: generateDefaultCells(rows, cols),
    updatedAt: new Date(),
  };
  return newConfig;
}

// 更新单元格
export function updateGridCell(config: GridConfig, cellId: string, updates: Partial<GridCell>): GridConfig {
  const newConfig = {
    ...config,
    cells: config.cells.map(cell => 
      cell.id === cellId ? { ...cell, ...updates } : cell
    ),
    updatedAt: new Date(),
  };
  return newConfig;
}