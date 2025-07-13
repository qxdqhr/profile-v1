# Mikutap 游戏模式技术实施计划

## 🚀 第一阶段：基础框架实现

### 1.1 创建新的类型定义

```typescript
// src/modules/mikutap/types/game.ts

export type AppMode = 'tool' | 'game';

export interface GameMode {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface MelodyPattern {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bpm: number;
  notes: MelodyNote[];
  previewAudio?: string;
  tags: string[];
  category: 'children' | 'popular' | 'classical' | 'anime';
}

export interface MelodyNote {
  cellId: string;          // 对应的格子ID
  startTime: number;       // 开始时间(毫秒)
  duration: number;        // 持续时间(毫秒)
  intensity: number;       // 强度(0-1)
  isAccent?: boolean;      // 是否为重音
}

export interface GameState {
  mode: 'demo' | 'practice' | 'challenge' | 'result';
  currentMelody: MelodyPattern | null;
  playerInput: MelodyNote[];
  score: GameScore;
  isPlaying: boolean;
  showHints: boolean;
  startTime: number;       // 游戏开始时间戳
  expectedNotes: MelodyNote[];
  currentNoteIndex: number;
}

export interface GameScore {
  accuracy: number;        // 准确度(0-100)
  timing: number;          // 节拍准确度(0-100)
  completeness: number;    // 完整度(0-100)
  totalScore: number;      // 总分(0-100)
  stars: number;           // 星级(1-3)
  correctNotes: number;    // 正确音符数
  totalNotes: number;      // 总音符数
  timingErrors: number[];  // 时间偏差记录
}

export interface UserGameProfile {
  totalScore: number;
  completedMelodies: string[];
  achievements: string[];
  currentLevel: number;
  preferences: {
    difficulty: 'easy' | 'medium' | 'hard';
    showHints: boolean;
    playbackSpeed: number;
    autoProgress: boolean;
  };
}
```

### 1.2 模式选择弹窗组件

```typescript
// src/modules/mikutap/components/game/GameModeSelector.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { AppMode } from '../../types/game';

interface GameModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onModeSelect: (mode: AppMode) => void;
}

export default function GameModeSelector({ 
  isOpen, 
  onClose, 
  onModeSelect 
}: GameModeSelectorProps) {
  const [alwaysToolMode, setAlwaysToolMode] = useState(false);

  useEffect(() => {
    // 读取用户偏好设置
    const preference = localStorage.getItem('mikutap-mode-preference');
    if (preference === 'always-tool') {
      setAlwaysToolMode(true);
    }
  }, []);

  const handleModeSelect = (mode: AppMode) => {
    if (alwaysToolMode && mode === 'tool') {
      localStorage.setItem('mikutap-mode-preference', 'always-tool');
    } else {
      localStorage.removeItem('mikutap-mode-preference');
    }
    onModeSelect(mode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🎵 Mikutap 模式选择
          </h2>
          <p className="text-gray-600">选择您想要的使用模式</p>
        </div>

        <div className="space-y-4">
          {/* 工具模式 */}
          <div 
            className="border-2 border-blue-200 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
            onClick={() => handleModeSelect('tool')}
          >
            <div className="flex items-center mb-3">
              <span className="text-3xl mr-3">🛠️</span>
              <h3 className="text-xl font-semibold text-gray-800">工具模式</h3>
            </div>
            <p className="text-gray-600 mb-4">
              自由创作音乐，探索声音的无限可能
            </p>
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
              进入工具模式
            </button>
          </div>

          {/* 游戏模式 */}
          <div 
            className="border-2 border-green-200 rounded-xl p-6 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all"
            onClick={() => handleModeSelect('game')}
          >
            <div className="flex items-center mb-3">
              <span className="text-3xl mr-3">🎮</span>
              <h3 className="text-xl font-semibold text-gray-800">游戏模式</h3>
            </div>
            <p className="text-gray-600 mb-4">
              跟随旋律学习音乐，挑战节奏技巧
            </p>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
              进入游戏模式
            </button>
          </div>
        </div>

        {/* 偏好设置 */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={alwaysToolMode}
              onChange={(e) => setAlwaysToolMode(e.target.checked)}
              className="rounded"
            />
            <span>⚙️ 总是以工具模式启动</span>
          </label>
        </div>
      </div>
    </div>
  );
}
```

### 1.3 模式切换按钮组件

```typescript
// src/modules/mikutap/components/game/GameModeSwitch.tsx

'use client';

import React from 'react';
import { AppMode } from '../../types/game';

interface GameModeSwitchProps {
  currentMode: AppMode;
  onModeSwitch: (mode: AppMode) => void;
  className?: string;
}

export default function GameModeSwitch({ 
  currentMode, 
  onModeSwitch, 
  className = '' 
}: GameModeSwitchProps) {
  const toggleMode = () => {
    const newMode: AppMode = currentMode === 'tool' ? 'game' : 'tool';
    onModeSwitch(newMode);
  };

  return (
    <button
      onClick={toggleMode}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-lg
        bg-white bg-opacity-20 hover:bg-opacity-30 
        text-white font-medium transition-all
        ${className}
      `}
    >
      {currentMode === 'tool' ? (
        <>
          <span>🎮</span>
          <span>切换到游戏模式</span>
        </>
      ) : (
        <>
          <span>🛠️</span>
          <span>切换到工具模式</span>
        </>
      )}
    </button>
  );
}
```

### 1.4 游戏模式主控制器

```typescript
// src/modules/mikutap/components/game/MelodyGameController.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GameState, MelodyPattern, GameScore, MelodyNote } from '../../types/game';
import { GridConfig } from '../../types';
import MelodyDemo from './MelodyDemo';
import ScoreDisplay from './ScoreDisplay';
import GameHUD from './GameHUD';

interface MelodyGameControllerProps {
  gridConfig: GridConfig;
  onPlaySound: (cellId: string, timestamp: number) => void;
  className?: string;
}

export default function MelodyGameController({
  gridConfig,
  onPlaySound,
  className = ''
}: MelodyGameControllerProps) {
  const [gameState, setGameState] = useState<GameState>({
    mode: 'demo',
    currentMelody: null,
    playerInput: [],
    score: {
      accuracy: 0,
      timing: 0,
      completeness: 0,
      totalScore: 0,
      stars: 0,
      correctNotes: 0,
      totalNotes: 0,
      timingErrors: []
    },
    isPlaying: false,
    showHints: true,
    startTime: 0,
    expectedNotes: [],
    currentNoteIndex: 0
  });

  const [selectedMelody, setSelectedMelody] = useState<MelodyPattern | null>(null);

  // 播放示范旋律
  const playDemo = useCallback(async (melody: MelodyPattern) => {
    setGameState(prev => ({
      ...prev,
      mode: 'demo',
      currentMelody: melody,
      isPlaying: true,
      expectedNotes: melody.notes,
      startTime: Date.now()
    }));

    // 按时间序列播放音符
    for (const note of melody.notes) {
      setTimeout(() => {
        onPlaySound(note.cellId, Date.now());
      }, note.startTime);
    }

    // 演示完成
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        mode: 'practice'
      }));
    }, Math.max(...melody.notes.map(n => n.startTime + n.duration)) + 1000);
  }, [onPlaySound]);

  // 开始挑战模式
  const startChallenge = useCallback(() => {
    if (!selectedMelody) return;

    setGameState(prev => ({
      ...prev,
      mode: 'challenge',
      playerInput: [],
      startTime: Date.now(),
      currentNoteIndex: 0,
      score: {
        accuracy: 0,
        timing: 0,
        completeness: 0,
        totalScore: 0,
        stars: 0,
        correctNotes: 0,
        totalNotes: selectedMelody.notes.length,
        timingErrors: []
      }
    }));
  }, [selectedMelody]);

  // 记录玩家输入
  const recordPlayerInput = useCallback((cellId: string, timestamp: number) => {
    if (gameState.mode !== 'challenge') return;

    const note: MelodyNote = {
      cellId,
      startTime: timestamp - gameState.startTime,
      duration: 300, // 默认持续时间
      intensity: 1
    };

    setGameState(prev => ({
      ...prev,
      playerInput: [...prev.playerInput, note]
    }));
  }, [gameState.mode, gameState.startTime]);

  // 评分算法
  const calculateScore = useCallback((expected: MelodyNote[], actual: MelodyNote[]): GameScore => {
    if (expected.length === 0) {
      return {
        accuracy: 0,
        timing: 0,
        completeness: 0,
        totalScore: 0,
        stars: 0,
        correctNotes: 0,
        totalNotes: 0,
        timingErrors: []
      };
    }

    let correctNotes = 0;
    let timingErrors: number[] = [];
    const tolerance = 500; // 500ms 容差

    // 检查每个期望的音符
    for (const expectedNote of expected) {
      const matchingActual = actual.find(actualNote => 
        actualNote.cellId === expectedNote.cellId &&
        Math.abs(actualNote.startTime - expectedNote.startTime) <= tolerance
      );

      if (matchingActual) {
        correctNotes++;
        timingErrors.push(Math.abs(matchingActual.startTime - expectedNote.startTime));
      } else {
        timingErrors.push(tolerance); // 完全错过
      }
    }

    const accuracy = (correctNotes / expected.length) * 100;
    const avgTimingError = timingErrors.reduce((sum, err) => sum + err, 0) / timingErrors.length;
    const timing = Math.max(0, 100 - (avgTimingError / tolerance * 100));
    const completeness = (actual.length / expected.length) * 100;
    
    const totalScore = (accuracy * 0.5 + timing * 0.3 + completeness * 0.2);
    const stars = totalScore >= 90 ? 3 : totalScore >= 70 ? 2 : totalScore >= 50 ? 1 : 0;

    return {
      accuracy,
      timing,
      completeness,
      totalScore,
      stars,
      correctNotes,
      totalNotes: expected.length,
      timingErrors
    };
  }, []);

  // 结束挑战模式
  const endChallenge = useCallback(() => {
    if (gameState.mode !== 'challenge' || !gameState.currentMelody) return;

    const score = calculateScore(gameState.expectedNotes, gameState.playerInput);
    
    setGameState(prev => ({
      ...prev,
      mode: 'result',
      score,
      isPlaying: false
    }));
  }, [gameState.mode, gameState.currentMelody, gameState.expectedNotes, gameState.playerInput, calculateScore]);

  // 自动结束挑战（基于时间）
  useEffect(() => {
    if (gameState.mode === 'challenge' && gameState.currentMelody) {
      const totalDuration = Math.max(...gameState.currentMelody.notes.map(n => n.startTime + n.duration)) + 2000;
      
      const timer = setTimeout(() => {
        endChallenge();
      }, totalDuration);

      return () => clearTimeout(timer);
    }
  }, [gameState.mode, gameState.currentMelody, endChallenge]);

  return (
    <div className={`game-controller ${className}`}>
      <GameHUD 
        gameState={gameState}
        onPlayDemo={() => selectedMelody && playDemo(selectedMelody)}
        onStartChallenge={startChallenge}
        onEndChallenge={endChallenge}
      />
      
      {gameState.mode === 'demo' && gameState.currentMelody && (
        <MelodyDemo 
          melody={gameState.currentMelody}
          isPlaying={gameState.isPlaying}
        />
      )}
      
      {gameState.mode === 'result' && (
        <ScoreDisplay 
          score={gameState.score}
          melody={gameState.currentMelody}
          onReplay={() => selectedMelody && playDemo(selectedMelody)}
          onNext={() => {/* 选择下一首旋律 */}}
        />
      )}
    </div>
  );
}
```

### 1.5 更新主页面集成

```typescript
// 在 src/modules/mikutap/pages/SimpleMikutapPage.tsx 中添加

import { useState, useEffect } from 'react';
import { AppMode } from '../types/game';
import GameModeSelector from '../components/game/GameModeSelector';
import GameModeSwitch from '../components/game/GameModeSwitch';
import MelodyGameController from '../components/game/MelodyGameController';

// 在组件开始处添加状态
const [appMode, setAppMode] = useState<AppMode>('tool');
const [showModeSelector, setShowModeSelector] = useState(false);

// 检查用户偏好设置
useEffect(() => {
  const preference = localStorage.getItem('mikutap-mode-preference');
  if (preference === 'always-tool') {
    setAppMode('tool');
  } else {
    setShowModeSelector(true);
  }
}, []);

// 处理模式选择
const handleModeSelect = (mode: AppMode) => {
  setAppMode(mode);
  setShowModeSelector(false);
};

// 在返回的JSX中添加组件
return (
  <div className={`mikutap-container ${className}`}>
    {/* 模式选择弹窗 */}
    <GameModeSelector 
      isOpen={showModeSelector}
      onClose={() => setShowModeSelector(false)}
      onModeSelect={handleModeSelect}
    />

    {/* 现有的工具模式界面 */}
    {appMode === 'tool' && (
      <div className="tool-mode">
        {/* 现有的界面内容 */}
        
        {/* 添加模式切换按钮 */}
        <div className="fixed top-4 left-4">
          <GameModeSwitch 
            currentMode={appMode}
            onModeSwitch={setAppMode}
          />
        </div>
      </div>
    )}

    {/* 游戏模式界面 */}
    {appMode === 'game' && (
      <div className="game-mode">
        <MelodyGameController 
          gridConfig={gridConfig}
          onPlaySound={(cellId, timestamp) => {
            // 使用现有的音效播放逻辑
            const cell = gridConfig?.cells.find(c => c.id === cellId);
            if (cell) {
              playSoundByCell(cell, 0, 0, true);
            }
          }}
        />
        
        {/* 添加模式切换按钮 */}
        <div className="fixed top-4 left-4">
          <GameModeSwitch 
            currentMode={appMode}
            onModeSwitch={setAppMode}
          />
        </div>
      </div>
    )}
  </div>
);
```

## 📝 下一步开发任务

### 近期任务（1-2周内）：
1. ✅ 创建游戏模式类型定义
2. ✅ 实现模式选择弹窗
3. ✅ 创建模式切换组件
4. ✅ 基础游戏控制器框架
5. [ ] 实现旋律数据存储
6. [ ] 创建基础旋律库
7. [ ] 音频播放时序控制

### 中期任务（2-4周内）：
1. [ ] 完善评分算法
2. [ ] 视觉反馈系统
3. [ ] 游戏界面HUD
4. [ ] 旋律库管理界面
5. [ ] 用户进度系统

### 长期任务（1-2月内）：
1. [ ] 成就系统
2. [ ] 高级游戏模式
3. [ ] 社交功能
4. [ ] 性能优化

## 🔧 技术考虑

### 音频同步策略：
- 使用`performance.now()`获取高精度时间戳
- Web Audio API的精确调度
- 考虑音频延迟补偿

### 性能优化：
- 音频文件预加载
- 组件懒加载
- 内存管理优化

### 用户体验：
- 响应式设计
- 触觉反馈
- 进度保存

---

这个实施计划提供了从基础框架到完整功能的渐进式开发路径，确保每个阶段都有可测试的成果。 