/**
 * 简化版 Mikutap 页面组件
 * 使用统一音频管理器解决音频冲突问题
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { audioManager } from '../utils/audioManager';
import { Modal } from '@/components/PopWindow';
import { GridConfig, GridCell, BackgroundMusic } from '../types';
import { useConfigDatabase } from '../hooks/useConfigDatabase';
import TestAnimation from '../components/TestAnimation';
import FullscreenAnimation from '../components/FullscreenAnimation';
import MikutapButton from '../components/MikutapButton';
import { RhythmGenerator } from '../utils/rhythmGenerator';

interface SimpleMikutapPageProps {
  className?: string;
}

export default function SimpleMikutapPage({ className = '' }: SimpleMikutapPageProps) {
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const [lastKey, setLastKey] = useState<string>('');
  const [particles, setParticles] = useState<Array<{ id: string, x: number, y: number, color: string, life: number }>>([]);
  const [showHelpInfo, setShowHelpInfo] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPlayTime, setLastPlayTime] = useState(0);
  const [settings, setSettings] = useState({
    volume: 1.0,
    enableParticles: true,
    enableDragThrottle: true,
    dragThrottleDelay: 10,
    particleLifetime: 1000,
    keyboardEnabled: true,
    mouseEnabled: true,
  });
  const [touchHandled, setTouchHandled] = useState(false);
  const [gridConfig, setGridConfig] = useState<GridConfig | null>(null);
  const [triggeredCells, setTriggeredCells] = useState<Set<string>>(new Set());
  const [lastTriggeredCellId, setLastTriggeredCellId] = useState<string | null>(null);
  const [lastMousePosition, setLastMousePosition] = useState<{ x: number, y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // 移除旧的音频生成器引用，现在使用统一音频管理器
  const { loadConfig: loadConfigFromDB } = useConfigDatabase();
  const [animationTriggers, setAnimationTriggers] = useState<Record<string, number>>({});
  const [backgroundMusics, setBackgroundMusics] = useState<BackgroundMusic[]>([]);
  const [currentBgMusic, setCurrentBgMusic] = useState<BackgroundMusic | undefined>();
  const [isBackgroundMusicStarted, setIsBackgroundMusicStarted] = useState(false);

  // 记录上一次触发的格子位置
  const lastGridPositionRef = useRef<{ row: number, col: number } | null>(null);

  // 添加全屏动画相关状态
  const [fullscreenAnimationTrigger, setFullscreenAnimationTrigger] = useState<number>(0);
  const [activeCell, setActiveCell] = useState<GridCell | null>(null);

  // 监控animationTriggers状态变化
  useEffect(() => {
    console.log('🔥 animationTriggers state changed 🔥:', animationTriggers);
  }, [animationTriggers]);

  // 监控showHelpInfo状态变化
  useEffect(() => {
    console.log('showHelpInfo state changed:', showHelpInfo);
  }, [showHelpInfo]);

  // 监控currentBgMusic状态变化
  useEffect(() => {
    console.log('🎵 currentBgMusic state changed:', currentBgMusic);
  }, [currentBgMusic]);

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await loadConfigFromDB('default');
        if (config) {
          setGridConfig(config);
        }
      } catch (error) {
        console.error('Failed to load configuration from database:', error);
      }
    }

    loadConfig();
  }, [loadConfigFromDB]);

  // 初始化时加载背景音乐列表
  useEffect(() => {
    loadBackgroundMusics();
    // 测试数据库连接
    testDatabaseConnection();
  }, []);

  const testDatabaseConnection = async () => {
    try {
      console.log('🔍 测试数据库连接...');
      const response = await fetch('/api/mikutap/background-music/test');
      const result = await response.json();
      console.log('🔍 数据库测试结果:', result);

      // 调用调试API
      console.log('🔍 调用调试API...');
      const debugResponse = await fetch('/api/mikutap/background-music/debug');
      const debugResult = await debugResponse.json();
      console.log('🔍 调试API结果:', debugResult);
    } catch (error) {
      console.error('🔍 数据库测试失败:', error);
    }
  };

  // 测试音频文件是否可访问
  const testAudioFile = async (filePath: string) => {
    try {
      console.log('🔍 测试音频文件访问:', filePath);
      const response = await fetch(filePath);
      console.log('🔍 音频文件响应状态:', response.status);
      console.log('🔍 音频文件响应头:', response.headers.get('content-type'));
      console.log('🔍 音频文件大小:', response.headers.get('content-length'));

      if (!response.ok) {
        console.error('🔍 音频文件访问失败:', response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('🔍 音频文件测试失败:', error);
      return false;
    }
  };

  const loadBackgroundMusics = async () => {
    try {
      console.log('🎵 开始加载背景音乐...');
      const response = await fetch('/api/mikutap/background-music?configId=default');
      const result = await response.json();
      console.log('🎵 背景音乐API响应:', result);

      if (result.success) {
        setBackgroundMusics(result.data);
        console.log('🎵 设置背景音乐列表:', result.data);

        const defaultMusic = result.data.find((m: BackgroundMusic) => m.isDefault);
        console.log('🎵 找到默认音乐:', defaultMusic);
        console.log('🎵 音乐列表长度:', result.data.length);
        console.log('🎵 第一个音乐详情:', result.data[0]);

        if (defaultMusic) {
          setCurrentBgMusic(defaultMusic);
          console.log('🎵 设置当前背景音乐:', defaultMusic.name);
        } else if (result.data.length > 0) {
          // 如果没有默认音乐但有音乐列表，使用第一个音乐
          const firstMusic = result.data[0];
          console.log('🎵 没有默认音乐，准备使用第一个音乐:', firstMusic);
          setCurrentBgMusic(firstMusic);
          console.log('🎵 已设置第一个音乐为当前背景音乐:', firstMusic.name);

          // 测试音频文件是否可访问
          testAudioFile(firstMusic.file);
        } else {
          console.log('🎵 没有找到任何背景音乐');
        }
      } else {
        console.error('❌ 加载背景音乐失败:', result.error);
      }
    } catch (error) {
      console.error('❌ 加载背景音乐失败:', error);
    }
  };

  // 启动背景音乐的函数
  const startBackgroundMusic = useCallback(async () => {
    console.log('🎵 尝试启动背景音乐...');
    console.log('🎵 当前背景音乐:', currentBgMusic);
    console.log('🎵 背景音乐是否已启动:', isBackgroundMusicStarted);

    if (!currentBgMusic || isBackgroundMusicStarted) {
      console.log('🎵 跳过启动背景音乐 - 没有音乐或已启动');
      return;
    }

    try {
      // 使用统一音频管理器播放背景音乐
      await audioManager.playBackgroundMusic(currentBgMusic);
      setIsBackgroundMusicStarted(true);
      console.log('🎵 背景音乐已通过统一管理器启动:', currentBgMusic.name);
    } catch (error) {
      console.error('❌ 启动背景音乐失败:', error);
    }
  }, [currentBgMusic, isBackgroundMusicStarted]);

  // 停止背景音乐
  const stopBackgroundMusic = useCallback(() => {
    audioManager.stopBackgroundMusic();
    setIsBackgroundMusicStarted(false);
  }, []);

  // 在组件卸载时清理音频资源
  useEffect(() => {
    return () => {
      stopBackgroundMusic();
      // 不需要手动清理audioContext，统一音频管理器会处理
    };
  }, [stopBackgroundMusic]);

  // 按钮处理函数
  const handleConfigClick = () => {
    window.open('/testField/mikutap/config', '_blank');
  };



  const handleTestClick = async () => {
    if (!isAudioInitialized) {
      await initializeAudio();
    } else {
      // 播放测试音阶
      const notes = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'];
      notes.forEach((note, index) => {
        setTimeout(() => {
          const rect = containerRef.current?.getBoundingClientRect();
          const x = rect ? rect.width / 2 : 400;
          const y = rect ? rect.height / 2 : 300;
          playSoundByKey(note, x, y, true);
        }, index * 200);
      });
    }
  };

  const handleHelpClick = () => {
    setShowHelpInfo(prev => !prev);
  };

  const handleMusicToggle = async () => {
    if (!currentBgMusic) {
      console.log('🎵 没有可用的背景音乐');
      return;
    }

    if (isBackgroundMusicStarted) {
      // 当前正在播放，暂停音乐
      stopBackgroundMusic();
      console.log('🎵 暂停背景音乐');
    } else {
      // 当前暂停中，开始播放音乐
      await startBackgroundMusic();
      console.log('🎵 恢复背景音乐播放');
    }
  };

  /**
   * 初始化音频系统
   */
  const initializeAudio = useCallback(async () => {
    try {
      const success = await audioManager.initialize();
      if (success) {
        setIsAudioInitialized(true);
        setAudioError(null);
      } else {
        setAudioError('音频系统初始化失败');
      }
    } catch (error) {
      setAudioError('音频系统初始化出错');
      console.error('音频初始化错误:', error);
    }
  }, []);

  /**
   * 触发单元格动画（支持重复触发）
   */
  const triggerCellAnimation = useCallback((cellId: string) => {
    setAnimationTriggers(prev => ({
      ...prev,
      [cellId]: (prev[cellId] || 0) + 1
    }));
  }, []);

  /**
   * 根据键盘按键播放音效
   */
  const playSoundByKey = useCallback(async (key: string, x: number = 0, y: number = 0, skipThrottle = false) => {
    // 1. 初始化
    if (!isAudioInitialized) {
      await initializeAudio();
    }
    if (!isBackgroundMusicStarted && currentBgMusic) {
      console.log('🎵 首次交互 (by key)，启动背景音乐...');
      await startBackgroundMusic();
    }

    // 2. 检查配置
    if (!gridConfig) return;

    console.log('🎹 播放音效 - 按键:', key);

    // 拖拽时的节流控制，但跳过点击时的节流
    if (!skipThrottle) {
      const now = Date.now();
      if (isDragging && settings.enableDragThrottle && now - lastPlayTime < settings.dragThrottleDelay) {
        return;
      }
      setLastPlayTime(now);
    }

    try {
      // 找到对应的格子 - 不区分大小写匹配
      const cell = gridConfig.cells.find(c => c.key && c.key.toLowerCase() === key.toLowerCase());
      console.log('🎹 查找按键对应的格子:', {
        key,
        keyLower: key.toLowerCase(),
        foundCell: !!cell,
        cellDetails: cell,
        availableKeys: gridConfig.cells.filter(c => c.key).map(c => c.key)
      });

      if (cell) {
        console.log('🎹 开始播放音效:', { cell: cell.key, enabled: cell.enabled, volume: settings.volume });
        await audioManager.playEffect(cell, 1, settings.volume);

        // 更新交互计数
        setInteractionCount(prev => prev + 1);
        setLastKey(key);

        // 创建粒子效果
        if (settings.enableParticles) {
          const particleId = `${Date.now()}-${Math.random()}`;
          setParticles(prev => [...prev, {
            id: particleId,
            x: x || window.innerWidth / 2,
            y: y || window.innerHeight / 2,
            color: cell.color,
            life: settings.particleLifetime
          }]);

          // 移除粒子
          setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== particleId));
          }, settings.particleLifetime);
        }

        // 触发动画
        triggerCellAnimation(cell.id);

        // 触发全屏动画
        setActiveCell(cell);
        setFullscreenAnimationTrigger(Date.now());
      }
    } catch (error) {
      console.error('播放音效失败:', error);
    }
  }, [
    isAudioInitialized,
    gridConfig,
    settings,
    isDragging,
    lastPlayTime,
    isBackgroundMusicStarted,
    currentBgMusic,
    startBackgroundMusic,
    initializeAudio,
    setActiveCell,
    triggerCellAnimation,
  ]);

  /**
   * 根据单元格播放音效（简化版）
   */
  const playSoundByCell = useCallback(async (cell: GridCell, x: number, y: number, skipThrottle = false) => {
    if (!isAudioInitialized || !cell.enabled) return;

    // 拖拽时的节流控制，但跳过点击时的节流
    if (!skipThrottle) {
      const now = Date.now();
      if (isDragging && settings.enableDragThrottle && now - lastPlayTime < settings.dragThrottleDelay) {
        return;
      }
      setLastPlayTime(now);
    }

    try {
      // 播放音效
      await audioManager.playEffect(cell, 1, settings.volume);
      setInteractionCount(prev => prev + 1);
      setLastKey(cell.key || `(${cell.row},${cell.col})`);

      // 简化：所有音效播放都触发动画
      triggerCellAnimation(cell.id);

      // 触发全屏动画
      setActiveCell(cell);
      setFullscreenAnimationTrigger(prev => prev + 1);

      // 添加粒子效果
      if (settings.enableParticles) {
        const particleId = Math.random().toString(36);
        const newParticle = {
          id: particleId,
          x,
          y,
          color: cell.color,
          life: 1
        };

        setParticles(prev => [...prev, newParticle]);

        // 移除粒子
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== particleId));
        }, settings.particleLifetime);
      }

    } catch (error) {
      console.error('播放音效失败:', error);
    }
  }, [isAudioInitialized, isDragging, lastPlayTime, settings, triggerCellAnimation]);

  /**
   * 处理位置音效播放 - 根据配置的网格布局（简化版）
   * 这是鼠标/触摸交互的统一入口，负责处理初始化和播放。
   */
  const handlePlaySoundAtPosition = useCallback(async (x: number, y: number, skipThrottle = false) => {
    // 1. 初始化和启动
    if (!isAudioInitialized) {
      await initializeAudio();
    }
    if (!isBackgroundMusicStarted && currentBgMusic) {
      console.log('🎵 首次交互 (by position)，启动背景音乐...');
      await startBackgroundMusic();
    }

    // 2. 核心播放逻辑 (为避免stale state, 不再调用 playSoundByCell, 而是将逻辑内联)
    if (!gridConfig) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cols = gridConfig.cols;
    const rows = gridConfig.rows;
    const col = Math.floor((x / rect.width) * cols);
    const row = Math.floor((y / rect.height) * rows);
    const cell = gridConfig.cells.find(c => c.row === row && c.col === col && c.enabled);
    if (!cell) return;

    setLastTriggeredCellId(cell.id);

    // --- playSoundByCell 的内联逻辑开始 ---
    if (!cell.enabled) return;

    if (!skipThrottle) {
      const now = Date.now();
      if (isDragging && settings.enableDragThrottle && now - lastPlayTime < settings.dragThrottleDelay) {
        return;
      }
      setLastPlayTime(now);
    }

    try {
      await audioManager.playEffect(cell, 1, settings.volume);
      setInteractionCount(prev => prev + 1);
      setLastKey(cell.key || `(${cell.row},${cell.col})`);

      triggerCellAnimation(cell.id);

      setActiveCell(cell);
      setFullscreenAnimationTrigger(prev => prev + 1);

      if (settings.enableParticles) {
        const particleId = Math.random().toString(36);
        const newParticle = { id: particleId, x, y, color: cell.color, life: 1 };
        setParticles(prev => [...prev, newParticle]);
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== particleId));
        }, settings.particleLifetime);
      }
    } catch (error) {
      console.error('播放音效失败:', error);
    }
    // --- playSoundByCell 的内联逻辑结束 ---

  }, [
    isAudioInitialized,
    initializeAudio,
    isBackgroundMusicStarted,
    currentBgMusic,
    startBackgroundMusic,
    gridConfig,
    isDragging,
    lastPlayTime,
    settings,
    triggerCellAnimation,
    setActiveCell,
  ]);

  /**
   * 获取两点之间经过的所有格子
   */
  const getCellsBetweenPoints = useCallback((x1: number, y1: number, x2: number, y2: number): { row: number, col: number }[] => {
    if (!gridConfig || !containerRef.current) return [];

    const rect = containerRef.current.getBoundingClientRect();
    const cols = gridConfig.cols;
    const rows = gridConfig.rows;

    // 计算起点和终点的网格坐标
    const startCol = Math.floor((x1 / rect.width) * cols);
    const startRow = Math.floor((y1 / rect.height) * rows);
    const endCol = Math.floor((x2 / rect.width) * cols);
    const endRow = Math.floor((y2 / rect.height) * rows);

    // 如果起点和终点相同，直接返回
    if (startCol === endCol && startRow === endRow) {
      return [{ row: startRow, col: startCol }];
    }

    // 使用Bresenham算法计算两点之间的所有格子
    const cells: { row: number, col: number }[] = [];

    // 计算步进方向和距离
    const dx = Math.abs(endCol - startCol);
    const dy = Math.abs(endRow - startRow);
    const sx = startCol < endCol ? 1 : -1;
    const sy = startRow < endRow ? 1 : -1;
    let err = dx - dy;

    let x = startCol;
    let y = startRow;

    while (true) {
      cells.push({ row: y, col: x });

      if (x === endCol && y === endRow) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    return cells;
  }, [gridConfig]);

  /**
   * 处理鼠标按下
   */
  const handleMouseDown = useCallback(async (e: React.MouseEvent) => {
    if (!settings.mouseEnabled) return;

    setIsDragging(true);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 记录初始鼠标位置
    setLastMousePosition({ x, y });

    // 计算当前格子位置
    const col = Math.floor((x / rect.width) * gridConfig?.cols!);
    const row = Math.floor((y / rect.height) * gridConfig?.rows!);
    lastGridPositionRef.current = { row, col };

    await handlePlaySoundAtPosition(x, y, true);
  }, [settings.mouseEnabled, handlePlaySoundAtPosition, gridConfig]);

  /**
   * 处理鼠标移动（拖拽）- 简化版
   */
  const handleMouseMove = useCallback(async (e: React.MouseEvent) => {
    if (showHelpInfo) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }

    if (!settings.mouseEnabled || !isDragging || !lastMousePosition || !gridConfig) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 计算当前格子位置
    const col = Math.floor((x / rect.width) * gridConfig.cols);
    const row = Math.floor((y / rect.height) * gridConfig.rows);

    // 如果格子位置发生变化，才触发音效
    if (lastGridPositionRef.current &&
      (lastGridPositionRef.current.row !== row || lastGridPositionRef.current.col !== col)) {

      // 查找对应位置的单元格
      const cell = gridConfig.cells.find(c => c.row === row && c.col === col && c.enabled);
      if (cell) {
        // 更新最后触发的格子位置
        lastGridPositionRef.current = { row, col };
        setLastTriggeredCellId(cell.id);
        await handlePlaySoundAtPosition(x, y, false);
      }
    }

    // 更新上一次鼠标位置
    setLastMousePosition({ x, y });

  }, [settings.mouseEnabled, isDragging, showHelpInfo, lastMousePosition, gridConfig, handlePlaySoundAtPosition]);

  /**
   * 处理触摸开始
   */
  const handleTouchStart = useCallback(async (e: React.TouchEvent) => {
    if (!settings.mouseEnabled) return;

    e.preventDefault(); // 防止双击放大和其他默认行为
    setIsDragging(true);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !gridConfig) return;

    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // 记录初始触摸位置
    setLastMousePosition({ x, y });

    // 计算当前格子位置
    const col = Math.floor((x / rect.width) * gridConfig.cols);
    const row = Math.floor((y / rect.height) * gridConfig.rows);
    lastGridPositionRef.current = { row, col };

    await handlePlaySoundAtPosition(x, y, true);
  }, [settings.mouseEnabled, handlePlaySoundAtPosition, gridConfig]);

  /**
   * 处理触摸移动 - 简化版
   */
  const handleTouchMove = useCallback(async (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();

    if (showHelpInfo && rect) {
      setMousePosition({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    }

    if (!settings.mouseEnabled || !isDragging || !lastMousePosition || !gridConfig) return;

    e.preventDefault(); // 防止页面滚动

    if (!rect) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // 计算当前格子位置
    const col = Math.floor((x / rect.width) * gridConfig.cols);
    const row = Math.floor((y / rect.height) * gridConfig.rows);

    // 如果格子位置发生变化，才触发音效
    if (lastGridPositionRef.current &&
      (lastGridPositionRef.current.row !== row || lastGridPositionRef.current.col !== col)) {

      // 查找对应位置的单元格
      const cell = gridConfig.cells.find(c => c.row === row && c.col === col && c.enabled);
      if (cell) {
        // 更新最后触发的格子位置
        lastGridPositionRef.current = { row, col };
        setLastTriggeredCellId(cell.id);
        await handlePlaySoundAtPosition(x, y, false);
      }
    }

    // 更新上一次触摸位置
    setLastMousePosition({ x, y });

  }, [settings.mouseEnabled, isDragging, showHelpInfo, lastMousePosition, gridConfig, handlePlaySoundAtPosition]);

  /**
   * 处理触摸结束
   */
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // 重置最后触发的格子ID和触摸位置
    setLastTriggeredCellId(null);
    setLastMousePosition(null);
  }, []);

  /**
   * 处理键盘事件
   */
  const handleKeyPress = async (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();

    // 特殊按键处理
    if (key === 'escape') {
      setShowHelpInfo(false);
      return;
    }

    if (key === 'h' && e.ctrlKey) {
      e.preventDefault();
      setShowHelpInfo(!showHelpInfo);
      return;
    }

    if (key === 'f1') {
      e.preventDefault();
      setShowHelpInfo(!showHelpInfo);
      return;
    }

    // 配置页面快捷键
    if (key === 's' && e.ctrlKey) {
      e.preventDefault();
      const configUrl = new URL('/testField/mikutap/config', window.location.origin);
      configUrl.searchParams.set('tab', 'interface-settings');
      window.open(configUrl.toString(), '_blank');
      return;
    }

    if (!gridConfig || !settings.keyboardEnabled) return;

    const cell = gridConfig.cells.find(c => c.key?.toLowerCase() === key && c.enabled);
    if (!cell) return;

    e.preventDefault();

    const rect = containerRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.width / 2 : 400;
    const centerY = rect ? rect.height / 2 : 300;

    // 键盘按下时，不需要节流 (skipThrottle = true)
    await playSoundByKey(key, centerX, centerY, true);
  };

  // 监听键盘事件
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // 监听全局鼠标松开事件
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // 监听全局触摸结束事件
  useEffect(() => {
    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
      setMousePosition(null);
    };

    window.addEventListener('touchend', handleGlobalTouchEnd);
    window.addEventListener('touchcancel', handleGlobalTouchEnd);
    return () => {
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, []);

  // 处理背景音乐（现在由统一音频管理器处理，此函数已不需要）

  // 组件卸载时停止所有音频（这些清理现在由统一音频管理器处理）
  useEffect(() => {
    return () => {
      // 统一音频管理器会处理所有清理工作
      audioManager.destroy();
    };
  }, []);

  return (
    <div className={`w-full h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black relative overflow-hidden touch-optimized ${className}`}>
      {/* 主游戏区域 */}
      <div
        ref={containerRef}
        className={`relative w-full h-full select-none no-zoom ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => {
          // setIsDragging(false);
        }}
        onMouseLeave={() => {
          setMousePosition(null);
          setIsDragging(false); // 鼠标离开时停止拖拽
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 全屏动画效果 */}
        <FullscreenAnimation
          isTriggered={fullscreenAnimationTrigger}
          cell={activeCell}
          onAnimationEnd={() => {
            console.log('Fullscreen animation ended');
          }}
        />

        {/* 粒子效果 */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-4 h-4 rounded-full pointer-events-none animate-ping"
            style={{
              left: particle.x - 8,
              top: particle.y - 8,
              backgroundColor: particle.color,
              boxShadow: `0 0 20px ${particle.color}`
            }}
          />
        ))}

        {/* 隐藏的动画层 - 用于测试动画效果 */}
        {gridConfig && !showHelpInfo && (
          <div className="absolute inset-0 pointer-events-none z-5">
            {gridConfig.cells.map((cell) => {
              if (!cell.enabled) return null;

              const cols = gridConfig.cols;
              const rows = gridConfig.rows;

              return (
                <div
                  key={`hidden-animation-${cell.id}`}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${(cell.col / cols) * 100}%`,
                    top: `${(cell.row / rows) * 100}%`,
                    width: `${(1 / cols) * 100}%`,
                    height: `${(1 / rows) * 100}%`,
                  }}
                >
                  <TestAnimation
                    key={`test-animation-${cell.id}`}
                    isTriggered={animationTriggers[cell.id] || 0}
                    cellId={cell.id}
                    onAnimationEnd={() => {
                      console.log(`🎭 TestAnimation ended for ${cell.id}`);
                      // 动画结束后重置为0，为下次触发做准备
                      setAnimationTriggers(prev => ({
                        ...prev,
                        [cell.id]: 0
                      }));
                    }}
                  >
                    <div className="w-full h-full" />
                  </TestAnimation>
                </div>
              );
            })}
          </div>
        )}

        {/* 初始化提示 */}
        {!isAudioInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60">
            <div className="text-center text-white">
              <div className="text-5xl">🎵</div>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {audioError && (
          <div className="absolute top-4 left-4 right-4 bg-red-600 bg-opacity-90 text-white p-3 rounded-lg z-20">
            <div className="font-semibold">音频错误</div>
            <div className="text-sm">{audioError}</div>
          </div>
        )}



        {/* 网格蒙版 - 显示点击区域信息 */}
        {showHelpInfo && gridConfig && (
          <div className="absolute inset-0 bg-black bg-opacity-60 z-25 pointer-events-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => {
              // setIsDragging(false);
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ pointerEvents: 'auto' }}>

            {/* 网格边界线 */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* 使用配置的网格尺寸 */}
              {(() => {
                const cols = gridConfig.cols;
                const rows = gridConfig.rows;

                return (
                  <>
                    {/* 垂直分割线 */}
                    {Array.from({ length: cols - 1 }, (_, i) => (
                      <div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 w-0.5 bg-white bg-opacity-50"
                        style={{
                          left: `${((i + 1) / cols) * 100}%`,
                          boxShadow: '0 0 3px rgba(255,255,255,0.8)'
                        }}
                      />
                    ))}

                    {/* 水平分割线 */}
                    {Array.from({ length: rows - 1 }, (_, i) => (
                      <div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 h-0.5 bg-white bg-opacity-50"
                        style={{
                          top: `${((i + 1) / rows) * 100}%`,
                          boxShadow: '0 0 3px rgba(255,255,255,0.8)'
                        }}
                      />
                    ))}

                    {/* 网格单元格 */}
                    {gridConfig.cells.map((cell) => {
                      if (!cell.enabled) return null;

                      return (
                        <div
                          key={cell.id}
                          className="absolute pointer-events-none"
                          style={{
                            left: `${(cell.col / cols) * 100}%`,
                            top: `${(cell.row / rows) * 100}%`,
                            width: `${(1 / cols) * 100}%`,
                            height: `${(1 / rows) * 100}%`,
                          }}
                        >
                          <TestAnimation
                            key={`animation-${cell.id}`}
                            isTriggered={animationTriggers[cell.id] || 0}
                            cellId={cell.id}
                            onAnimationEnd={() => {
                              console.log(`🎭 TestAnimation ended for ${cell.id}`);
                              // 动画结束后重置为0，为下次触发做准备
                              setAnimationTriggers(prev => ({
                                ...prev,
                                [cell.id]: 0
                              }));
                            }}
                          >
                            <div
                              className={`w-full h-full flex flex-col items-center justify-center text-white border border-opacity-30 bg-opacity-10 hover:bg-opacity-20 transition-all duration-200`}
                              style={{
                                backgroundColor: cell.color + '20',
                                borderColor: cell.color,
                              }}
                            >
                              {/* 音效图标 */}
                              <div className="text-2xl md:text-3xl xl:text-4xl mb-2">
                                {cell.icon}
                              </div>

                              {/* 字母 */}
                              <div className="text-xl md:text-2xl xl:text-3xl font-bold font-mono">
                                {cell.key ? cell.key.toUpperCase() : ''}
                              </div>
                            </div>
                          </TestAnimation>
                        </div>
                      );
                    })}
                  </>
                );
              })()}

            </div>
          </div>
        )}

        {/* 功能按钮组 */}
        <div
          className="absolute bottom-20 right-4 z-50 flex flex-col gap-2 pointer-events-auto"
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <MikutapButton
            onClick={handleConfigClick}
            onTouchAction={handleConfigClick}
            icon="🎛️"
            text="配置"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            title="Mikutap配置中心"
            touchHandled={touchHandled}
            setTouchHandled={setTouchHandled}
          />

          <MikutapButton
            onClick={handleTestClick}
            onTouchAction={handleTestClick}
            icon={isAudioInitialized ? '🎹' : '🔊'}
            text={isAudioInitialized ? '播放音阶' : '初始化音频'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            touchHandled={touchHandled}
            setTouchHandled={setTouchHandled}
          />

          <MikutapButton
            onClick={handleMusicToggle}
            onTouchAction={handleMusicToggle}
            icon={isBackgroundMusicStarted ? '⏸️' : '▶️'}
            text={isBackgroundMusicStarted ? '暂停音乐' : '播放音乐'}
            className={`${currentBgMusic ? 
              (isBackgroundMusicStarted ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700') 
              : 'bg-gray-500 cursor-not-allowed'} text-white`}
            title={currentBgMusic ? 
              (isBackgroundMusicStarted ? '暂停背景音乐' : '播放背景音乐') 
              : '没有可用的背景音乐'}
            touchHandled={touchHandled}
            setTouchHandled={setTouchHandled}
          />

          <MikutapButton
            onClick={handleHelpClick}
            onTouchAction={handleHelpClick}
            icon={showHelpInfo ? '🙈' : '💡'}
            text={showHelpInfo ? '隐藏按键映射' : '显示按键映射'}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
            touchHandled={touchHandled}
            setTouchHandled={setTouchHandled}
          />
        </div>
      </div>

      {/* 开发调试信息 */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-10 bg-black bg-opacity-70 text-white p-2 rounded text-xs z-30">
          <div>音频状态: {isAudioInitialized ? '已初始化' : '未初始化'}</div>
          <div>活跃粒子: {particles.length}</div>
          <div>最后按键: {lastKey || '无'}</div>
          <div>拖拽状态: {isDragging ? '拖拽中' : '正常'}</div>
          <div>帮助蒙版: {showHelpInfo ? '显示' : '隐藏'}</div>
          <div>设置窗口: {showSettings ? '显示' : '隐藏'}</div>
          <div>音量: {Math.round(settings.volume * 100)}%</div>
        </div>
      )} */}

    </div>
  );
}