import { GridCell, GridConfig, AnimationType, AnimationConfig, DEFAULT_INTERFACE_SETTINGS } from '../types';

// 默认网格配置
export const DEFAULT_GRID_CONFIG: GridConfig = {
  id: 'default',
  name: '默认配置',
  description: '5x6网格，包含钢琴、鼓点和特效音色 - 可在动效映射标签页中自定义动画',
  rows: 6,
  cols: 5,
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
  const pianoFreqs = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];
  const drumFreqs = [60, 80, 100, 120, 140, 160, 180, 200, 220];
  const synthFreqs = [110, 146.83, 196, 246.94, 329.63, 415.30, 523.25];

  switch (soundType) {
    case 'piano':
      return pianoFreqs[index] || 440;
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