'use client';

import { useState } from 'react';
import { GridCell, SoundType, DEFAULT_KEYS } from '../types';

// 音效预设套装类型
interface SoundPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'keyboard' | 'drums' | 'guitar' | 'effects';
  cells: Omit<GridCell, 'id' | 'row' | 'col'>[];
}

// 预设音效套装数据
const SOUND_PRESETS: SoundPreset[] = [
  // 钢琴键盘 - 低音到高音30个音
  {
    id: 'piano-30-keys',
    name: '钢琴键盘 (30键)',
    description: '从低音C到高音F，覆盖30个半音阶',
    icon: '🎹',
    category: 'keyboard',
    cells: Array.from({ length: 30 }, (_, i) => {
      const baseFreq = 130.81; // C3
      const frequency = baseFreq * Math.pow(2, i / 12);
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const octave = Math.floor(i / 12) + 3;
      const noteName = noteNames[i % 12] + octave;
      
      return {
        key: i < DEFAULT_KEYS.length ? DEFAULT_KEYS[i] : undefined,
        soundType: 'piano' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sine' as const,
        frequency,
        volume: 80,
        description: `钢琴 ${noteName}`,
        icon: '🎹',
        color: '#3B82F6',
        enabled: true,
      };
    })
  },

  // 鼓组套装
  {
    id: 'drum-kit',
    name: '鼓组套装',
    description: '包含踢鼓、军鼓、嗵嗵鼓、镲片等完整鼓组',
    icon: '🥁',
    category: 'drums',
    cells: [
      // 踢鼓
      {
        key: 'Q',
        soundType: 'drum' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sine' as const,
        frequency: 60,
        volume: 100,
        description: '踢鼓',
        icon: '🥁',
        color: '#10B981',
        enabled: true,
      },
      // 军鼓
      {
        key: 'W',
        soundType: 'drum' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'square' as const,
        frequency: 200,
        volume: 90,
        description: '军鼓',
        icon: '🥁',
        color: '#10B981',
        enabled: true,
      },
      // 闭音镲
      {
        key: 'E',
        soundType: 'drum' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 8000,
        volume: 70,
        description: '闭音镲',
        icon: '🔔',
        color: '#F59E0B',
        enabled: true,
      },
      // 开音镲
      {
        key: 'R',
        soundType: 'drum' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 6000,
        volume: 85,
        description: '开音镲',
        icon: '🔔',
        color: '#F59E0B',
        enabled: true,
      },
      // 高嗵嗵鼓
      {
        key: 'T',
        soundType: 'drum' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'triangle' as const,
        frequency: 320,
        volume: 85,
        description: '高嗵嗵鼓',
        icon: '🥁',
        color: '#10B981',
        enabled: true,
      },
      // 中嗵嗵鼓
      {
        key: 'Y',
        soundType: 'drum' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'triangle' as const,
        frequency: 240,
        volume: 85,
        description: '中嗵嗵鼓',
        icon: '🥁',
        color: '#10B981',
        enabled: true,
      },
      // 低嗵嗵鼓
      {
        key: 'U',
        soundType: 'drum' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'triangle' as const,
        frequency: 180,
        volume: 85,
        description: '低嗵嗵鼓',
        icon: '🥁',
        color: '#10B981',
        enabled: true,
      },
      // 脚踏镲
      {
        key: 'I',
        soundType: 'drum' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 4000,
        volume: 60,
        description: '脚踏镲',
        icon: '🔔',
        color: '#F59E0B',
        enabled: true,
      },
      // 撞击镲
      {
        key: 'O',
        soundType: 'drum' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 5000,
        volume: 90,
        description: '撞击镲',
        icon: '🔔',
        color: '#F59E0B',
        enabled: true,
      },
      // 踩镲
      {
        key: 'P',
        soundType: 'drum' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 7000,
        volume: 75,
        description: '踩镲',
        icon: '🔔',
        color: '#F59E0B',
        enabled: true,
      },
    ]
  },

  // 吉他音效
  {
    id: 'guitar-chords',
    name: '吉他和弦',
    description: '常用吉他和弦和单音，包含清音和失真效果',
    icon: '🎸',
    category: 'guitar',
    cells: [
      // C大调和弦
      {
        key: 'Q',
        soundType: 'lead' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 261.63, // C4
        volume: 85,
        description: 'C大调和弦',
        icon: '🎸',
        color: '#EF4444',
        enabled: true,
      },
      // D小调和弦
      {
        key: 'W',
        soundType: 'lead' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 293.66, // D4
        volume: 85,
        description: 'D小调和弦',
        icon: '🎸',
        color: '#EF4444',
        enabled: true,
      },
      // E小调和弦
      {
        key: 'E',
        soundType: 'lead' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 329.63, // E4
        volume: 85,
        description: 'E小调和弦',
        icon: '🎸',
        color: '#EF4444',
        enabled: true,
      },
      // F大调和弦
      {
        key: 'R',
        soundType: 'lead' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 349.23, // F4
        volume: 85,
        description: 'F大调和弦',
        icon: '🎸',
        color: '#EF4444',
        enabled: true,
      },
      // G大调和弦
      {
        key: 'T',
        soundType: 'lead' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 392.00, // G4
        volume: 85,
        description: 'G大调和弦',
        icon: '🎸',
        color: '#EF4444',
        enabled: true,
      },
      // A小调和弦
      {
        key: 'Y',
        soundType: 'lead' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 440.00, // A4
        volume: 85,
        description: 'A小调和弦',
        icon: '🎸',
        color: '#EF4444',
        enabled: true,
      },
      // B减和弦
      {
        key: 'U',
        soundType: 'lead' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 493.88, // B4
        volume: 85,
        description: 'B减和弦',
        icon: '🎸',
        color: '#EF4444',
        enabled: true,
      },
      // 吉他单音 - 高音E弦
      {
        key: 'I',
        soundType: 'lead' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'square' as const,
        frequency: 659.25, // E5
        volume: 80,
        description: '高音E弦',
        icon: '🎸',
        color: '#F59E0B',
        enabled: true,
      },
      // 吉他单音 - B弦
      {
        key: 'O',
        soundType: 'lead' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'square' as const,
        frequency: 493.88, // B4
        volume: 80,
        description: 'B弦',
        icon: '🎸',
        color: '#F59E0B',
        enabled: true,
      },
      // 吉他单音 - G弦
      {
        key: 'P',
        soundType: 'lead' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'square' as const,
        frequency: 392.00, // G4
        volume: 80,
        description: 'G弦',
        icon: '🎸',
        color: '#F59E0B',
        enabled: true,
      },
    ]
  },

  // 效果器音效
  {
    id: 'fx-sounds',
    name: '效果器音效',
    description: '各种特效音效，包含环境音、撞击音、电子音等',
    icon: '🎛️',
    category: 'effects',
    cells: [
      // 激光音效
      {
        key: 'Q',
        soundType: 'fx' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 1200,
        volume: 75,
        description: '激光音效',
        icon: '⚡',
        color: '#84CC16',
        enabled: true,
      },
      // 爆炸音效
      {
        key: 'W',
        soundType: 'fx' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'square' as const,
        frequency: 80,
        volume: 95,
        description: '爆炸音效',
        icon: '💥',
        color: '#84CC16',
        enabled: true,
      },
      // 水滴音效
      {
        key: 'E',
        soundType: 'fx' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sine' as const,
        frequency: 2000,
        volume: 60,
        description: '水滴音效',
        icon: '💧',
        color: '#06B6D4',
        enabled: true,
      },
      // 风声音效
      {
        key: 'R',
        soundType: 'fx' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 300,
        volume: 50,
        description: '风声音效',
        icon: '💨',
        color: '#84CC16',
        enabled: true,
      },
      // 电子音效
      {
        key: 'T',
        soundType: 'fx' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'square' as const,
        frequency: 800,
        volume: 70,
        description: '电子音效',
        icon: '🔌',
        color: '#8B5CF6',
        enabled: true,
      },
      // 机械音效
      {
        key: 'Y',
        soundType: 'fx' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'square' as const,
        frequency: 150,
        volume: 80,
        description: '机械音效',
        icon: '⚙️',
        color: '#6B7280',
        enabled: true,
      },
      // 铃声音效
      {
        key: 'U',
        soundType: 'fx' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sine' as const,
        frequency: 1760,
        volume: 65,
        description: '铃声音效',
        icon: '🔔',
        color: '#F59E0B',
        enabled: true,
      },
      // 空间音效
      {
        key: 'I',
        soundType: 'fx' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'sawtooth' as const,
        frequency: 500,
        volume: 55,
        description: '空间音效',
        icon: '🌌',
        color: '#8B5CF6',
        enabled: true,
      },
      // 报警音效
      {
        key: 'O',
        soundType: 'fx' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'square' as const,
        frequency: 1000,
        volume: 85,
        description: '报警音效',
        icon: '🚨',
        color: '#EF4444',
        enabled: true,
      },
      // 科幻音效
      {
        key: 'P',
        soundType: 'fx' as SoundType,
        soundSource: 'synthesized' as const,
        waveType: 'triangle' as const,
        frequency: 1500,
        volume: 70,
        description: '科幻音效',
        icon: '🛸',
        color: '#8B5CF6',
        enabled: true,
      },
    ]
  },
];

interface SoundLibraryPresetsProps {
  onApplyPreset: (preset: SoundPreset) => void;
  currentRows: number;
  currentCols: number;
}

export default function SoundLibraryPresets({ onApplyPreset, currentRows, currentCols }: SoundLibraryPresetsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPreset, setSelectedPreset] = useState<SoundPreset | null>(null);

  const categories = [
    { id: 'all', name: '全部', icon: '🎵' },
    { id: 'keyboard', name: '键盘', icon: '🎹' },
    { id: 'drums', name: '鼓组', icon: '🥁' },
    { id: 'guitar', name: '吉他', icon: '🎸' },
    { id: 'effects', name: '效果器', icon: '🎛️' },
  ];

  const filteredPresets = selectedCategory === 'all' 
    ? SOUND_PRESETS 
    : SOUND_PRESETS.filter(preset => preset.category === selectedCategory);

  const handleApplyPreset = (preset: SoundPreset) => {
    const maxCells = currentRows * currentCols;
    if (preset.cells.length > maxCells) {
      if (!confirm(`当前网格只有 ${maxCells} 个格子，但预设包含 ${preset.cells.length} 个音效。\n是否要应用前 ${maxCells} 个音效？`)) {
        return;
      }
    }
    onApplyPreset(preset);
    setSelectedPreset(null);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">🎵 音效库预设</h3>
      
      {/* 分类筛选 */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 预设列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPresets.map(preset => (
          <div
            key={preset.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedPreset(preset)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{preset.icon}</span>
                  <h4 className="font-medium text-gray-900">{preset.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">{preset.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>🎵 {preset.cells.length} 个音效</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {categories.find(c => c.id === preset.category)?.name}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApplyPreset(preset);
                }}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                应用
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 预设详情弹窗 */}
      {selectedPreset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{selectedPreset.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedPreset.name}</h3>
                    <p className="text-gray-600">{selectedPreset.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPreset(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* 音效列表预览 */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">包含的音效 ({selectedPreset.cells.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {selectedPreset.cells.map((cell, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 bg-gray-50 rounded border"
                    >
                      <span className="mr-2">{cell.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {cell.key && `[${cell.key}] `}{cell.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(cell.frequency || 0).toFixed(2)}Hz
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleApplyPreset(selectedPreset)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  🎵 应用此预设
                </button>
                <button
                  onClick={() => setSelectedPreset(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
              </div>

              {/* 提示信息 */}
              {selectedPreset.cells.length > currentRows * currentCols && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center text-yellow-800">
                    <span className="mr-2">⚠️</span>
                    <span className="text-sm">
                      当前网格只有 {currentRows * currentCols} 个格子，但此预设包含 {selectedPreset.cells.length} 个音效。
                      应用时会使用前 {currentRows * currentCols} 个音效。
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredPresets.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <div className="text-3xl mb-2">🎵</div>
          <div>暂无此分类的预设</div>
        </div>
      )}
    </div>
  );
}

export type { SoundPreset }; 