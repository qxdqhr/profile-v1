import { GridCell, GridConfig } from '../types';

// 默认网格配置
export const DEFAULT_GRID_CONFIG: GridConfig = {
  id: 'default',
  name: '默认配置',
  description: '5x6网格，包含钢琴、鼓点和特效音色',
  rows: 6,
  cols: 5,
  cells: [],
  createdAt: new Date(),
  updatedAt: new Date(),
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
      const soundType = index < 10 ? 'piano' : index < 19 ? 'drum' : 'synth';
      const waveType = index < 10 ? 'sine' : index < 19 ? 'square' : 'sawtooth';
      const description = index < 10 ? '钢琴音' : index < 19 ? '鼓点音' : '特效音';
      const icon = index < 10 ? '🎹' : index < 19 ? '🥁' : '🎛️';
      const color = index < 10 ? '#3B82F6' : index < 19 ? '#10B981' : '#8B5CF6';

      cells.push({
        id: `cell-${row}-${col}`,
        row,
        col,
        key: key.toUpperCase(), // 默认配置仍然分配键盘按键
        soundType: soundType as 'piano' | 'drum' | 'synth',
        soundSource: 'synthesized',
        waveType: waveType as 'sine' | 'square' | 'sawtooth',
        frequency: getDefaultFrequency(soundType, index),
        volume: 100,
        description,
        icon,
        color,
        enabled: true,
        // 默认动画配置
        animationEnabled: true,
        animationType: index < 10 ? 'pulse' : index < 19 ? 'bounce' : 'ripple',
        animationConfig: {
          duration: 500,
          speed: 1,
          scale: 1.2,
          opacity: 0.8,
          direction: 'up',
          loop: false,
          autoplay: false,
          offset: { x: 0, y: 0 }
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