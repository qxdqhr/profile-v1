/**
 * 简化版 Mikutap 页面组件
 * 使用统一音频管理器解决音频冲突问题
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { audioManager } from '../utils/audioManager';
import { Modal } from '@/components/PopWindow';
import { GridConfig, GridCell, BackgroundMusic, InterfaceSettings, DEFAULT_INTERFACE_SETTINGS, AnimationType } from '../types';
import { useConfigDatabase } from '../hooks/useConfigDatabase';
import TestAnimation from '../components/TestAnimation';
import FullscreenAnimation from '../components/FullscreenAnimation';
import MikutapButton from '../components/MikutapButton';
import { RhythmGenerator } from '../utils/rhythmGenerator';
import { FloatingMenu } from '@/components/FloatingMenu';
import MikutapMusicPlayer, { type MikutapMusicTrack } from '@/components/MusicPlayer/MikutapMusicPlayer';

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
  const [config, setConfig] = useState<GridConfig | null>(null);
  const [touchHandled, setTouchHandled] = useState(false);
  const [gridConfig, setGridConfig] = useState<GridConfig | null>(null);
  
  // 获取界面设置的便捷方法
  const getInterfaceSettings = useCallback(() => {
    return gridConfig?.interfaceSettings || DEFAULT_INTERFACE_SETTINGS;
  }, [gridConfig]);
  
  // 生成随机颜色的函数
  const generateRandomColor = useCallback(() => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#EE5A24', '#FFC312', '#C44569', '#F79F1F', '#A3CB38',
      '#1DD1A1', '#FD79A8', '#FDCB6E', '#6C5CE7', '#A29BFE',
      '#74B9FF', '#00B894', '#E17055', '#81ECEC', '#FAB1A0',
      '#E84393', '#00CEC9', '#FDCB6E', '#6C5CE7', '#DDA0DD'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);
  
  // 生成随机动效类型的函数
  const generateRandomAnimationType = useCallback((): AnimationType => {
    const animationTypes: AnimationType[] = [
      'pulse', 'bounce', 'flash', 'spin', 'scale', 'slide', 
      'ripple', 'explosion', 'vortex', 'lightning', 'rainbow', 'wave'
    ];
    return animationTypes[Math.floor(Math.random() * animationTypes.length)];
  }, []);
  const [triggeredCells, setTriggeredCells] = useState<Set<string>>(new Set());
  const [lastTriggeredCellId, setLastTriggeredCellId] = useState<string | null>(null);
  const [lastMousePosition, setLastMousePosition] = useState<{ x: number, y: number } | null>(null);
  // 多点触控状态
  const [activeTouches, setActiveTouches] = useState<Map<number, { x: number, y: number, cellId: string | null }>>(new Map());
  const activeTouchesRef = useRef<Map<number, { x: number, y: number, cellId: string | null }>>(new Map());
  
  // 同步activeTouches状态和ref
  useEffect(() => {
    activeTouchesRef.current = activeTouches;
  }, [activeTouches]);
  const containerRef = useRef<HTMLDivElement>(null);
  // 移除旧的音频生成器引用，现在使用统一音频管理器
  const { loadConfig: loadConfigFromDB } = useConfigDatabase();
  const [animationTriggers, setAnimationTriggers] = useState<Record<string, number>>({});
  const [backgroundMusics, setBackgroundMusics] = useState<BackgroundMusic[]>([]);
  const [currentBgMusic, setCurrentBgMusic] = useState<BackgroundMusic | undefined>();
  const [isBackgroundMusicStarted, setIsBackgroundMusicStarted] = useState(false);
  const [isUserDisabledMusic, setIsUserDisabledMusic] = useState(false); // 用户是否禁用了自动播放音乐
  const [musicPlayerVolume, setMusicPlayerVolume] = useState(0.7);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);

  // 记录上一次触发的格子位置
  const lastGridPositionRef = useRef<{ row: number, col: number } | null>(null);
  
  // 用于避免音乐状态更新无限循环的ref
  const lastMusicStateRef = useRef({
    isPlaying: false,
    currentTime: 0,
    duration: 0
  });

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
          
          // 测试音频数据是否有效
          console.log('🎵 音频数据长度:', firstMusic.file?.url?.length || 0);
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

  // 恢复背景音乐播放（当有暂停的音乐时）
  const resumeBackgroundMusicIfPaused = useCallback(async () => {
    // 如果用户主动暂停了音乐，则不自动恢复
    if (isUserDisabledMusic) {
      console.log('🎵 用户已主动暂停音乐，不自动恢复');
      return false;
    }

    const state = audioManager.getMusicPlaybackState();
    // 如果有音乐但当前处于暂停状态，则恢复播放
    if (state.duration > 0 && !state.isPlaying) {
      console.log('🎵 检测到暂停的音乐，恢复播放...');
      await audioManager.resumeBackgroundMusic();
      return true;
    }
    return false;
  }, [isUserDisabledMusic]);

  // 启动背景音乐的函数
  const startBackgroundMusic = useCallback(async () => {
    console.log('🎵 尝试启动背景音乐...');
    console.log('🎵 当前背景音乐:', currentBgMusic);
    console.log('🎵 背景音乐是否已启动:', isBackgroundMusicStarted);
    console.log('🎵 用户是否主动暂停:', isUserDisabledMusic);
    
    if (!currentBgMusic) {
      console.log('🎵 跳过启动背景音乐 - 没有音乐');
      return;
    }
    
    // 首先尝试恢复暂停的音乐（只有在用户没有主动暂停的情况下）
    const resumed = await resumeBackgroundMusicIfPaused();
    if (resumed) {
      setIsBackgroundMusicStarted(true);
      return;
    }

    // 如果没有暂停的音乐且未启动，则启动新音乐
    if (!isBackgroundMusicStarted) {
    try {
      // 使用统一音频管理器播放背景音乐
      await audioManager.playBackgroundMusic(currentBgMusic);
      setIsBackgroundMusicStarted(true);
        setIsUserDisabledMusic(false); // 启动新音乐时重置用户禁用标志
      console.log('🎵 背景音乐已通过统一管理器启动:', currentBgMusic.name);
    } catch (error) {
      console.error('❌ 启动背景音乐失败:', error);
    }
    }
  }, [currentBgMusic, isBackgroundMusicStarted, isUserDisabledMusic, resumeBackgroundMusicIfPaused]);

  // 停止背景音乐
  const stopBackgroundMusic = useCallback(() => {
    audioManager.stopBackgroundMusic();
    setIsBackgroundMusicStarted(false);
    console.log('🎵 停止背景音乐');
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
      // 当前正在播放，停止音乐并设置禁用标志
      stopBackgroundMusic();
      setIsUserDisabledMusic(true);
      console.log('🎵 通过toggle停止背景音乐，设置禁用标志');
    } else {
      // 当前暂停中，强制重新开始播放音乐
      try {
        await audioManager.playBackgroundMusic(currentBgMusic);
        setIsBackgroundMusicStarted(true);
        setIsUserDisabledMusic(false); // 强制重置用户禁用标志
        console.log('🎵 通过toggle强制启动背景音乐:', currentBgMusic.name);
      } catch (error: any) {
        // 捕获AbortError，这通常不是真正的错误
        if (error?.name === 'AbortError') {
          console.log('🎵 Toggle播放被中断 (AbortError)，这是正常的浏览器行为');
          return;
        }
        console.error('❌ Toggle启动背景音乐失败:', error);
      }
    }
  };

  // 音乐播放器控制函数
  const handleMusicPlayerPlay = useCallback(async () => {
    // 手动播放背景音乐并重置禁用状态
    if (!currentBgMusic) {
      console.log('🎵 没有可用的背景音乐');
      return;
    }
    
    try {
      await audioManager.playBackgroundMusic(currentBgMusic);
      setIsBackgroundMusicStarted(true);
      setIsUserDisabledMusic(false); // 重置用户禁用标志
      console.log('🎵 用户手动开启背景音乐:', currentBgMusic.name);
    } catch (error: any) {
      // 捕获AbortError，这通常不是真正的错误
      if (error?.name === 'AbortError') {
        console.log('🎵 手动播放被中断 (AbortError)，这是正常的浏览器行为');
        return;
      }
      console.error('❌ 手动播放背景音乐失败:', error);
    }
  }, [currentBgMusic]);

  const handleMusicPlayerPause = useCallback(() => {
    // 暂停背景音乐但保持位置
    audioManager.pauseBackgroundMusic();
    setIsUserDisabledMusic(true); // 标记用户主动暂停
    console.log('🎵 用户主动暂停背景音乐');
  }, []);

  const handleMusicPlayerVolumeChange = useCallback((volume: number) => {
    setMusicPlayerVolume(volume);
    // 同步更新audioManager的音量
    audioManager.setMusicVolume(volume);
    console.log('🎵 设置音乐音量:', volume);
  }, []);

  const handleMusicPlayerSeek = useCallback((time: number) => {
    // 跳转到指定时间
    audioManager.seekMusic(time);
    setMusicCurrentTime(time);
    console.log('🎵 跳转音乐位置:', time);
  }, []);

  // 转换BackgroundMusic为MikutapMusicTrack格式
  const currentMusicTrack: MikutapMusicTrack | undefined = currentBgMusic && currentBgMusic.file ? {
    id: currentBgMusic.id,
    name: currentBgMusic.name,
    audioUrl: currentBgMusic.file.url,
    duration: currentBgMusic.duration
  } : undefined;

  // 当背景音乐发生变化时，重置用户禁用标志
  useEffect(() => {
    if (currentBgMusic) {
      setIsUserDisabledMusic(false);
      console.log('🎵 背景音乐切换，重置用户禁用标志');
    }
  }, [currentBgMusic?.id]); // 只监听音乐ID的变化

  // 定期更新音乐播放状态
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const updateMusicState = () => {
      const state = audioManager.getMusicPlaybackState();
      
      // 只有当状态真正发生变化时才更新
      if (Math.abs(state.currentTime - lastMusicStateRef.current.currentTime) > 0.1) {
        setMusicCurrentTime(state.currentTime);
        lastMusicStateRef.current.currentTime = state.currentTime;
      }
      
      if (Math.abs(state.duration - lastMusicStateRef.current.duration) > 0.1) {
        setMusicDuration(state.duration);
        lastMusicStateRef.current.duration = state.duration;
      }
      
      // 播放状态变化时才更新
      if (state.isPlaying !== lastMusicStateRef.current.isPlaying) {
        setIsBackgroundMusicStarted(state.isPlaying);
        lastMusicStateRef.current.isPlaying = state.isPlaying;
      }
    };

    // 只有当音乐相关状态需要监听时才启动定时器
    if (currentBgMusic) {
      // 立即更新一次
      updateMusicState();

      // 定期更新
      interval = setInterval(updateMusicState, 250);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentBgMusic]); // 只依赖currentBgMusic，避免循环

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
    
    // 2. 处理背景音乐：优先恢复暂停的音乐，否则启动新音乐
    if (currentBgMusic) {
      const resumed = await resumeBackgroundMusicIfPaused();
      if (resumed) {
        setIsBackgroundMusicStarted(true);
        console.log('🎵 通过音效触发恢复暂停的背景音乐');
      } else if (!isBackgroundMusicStarted && !isUserDisabledMusic) {
      console.log('🎵 首次交互 (by key)，启动背景音乐...');
      await startBackgroundMusic();
      } else if (isUserDisabledMusic) {
        console.log('🎵 用户已主动暂停音乐（键盘交互），不启动新音乐');
      }
    }

    // 2. 检查配置
    if (!gridConfig) return;
    
    console.log('🎹 播放音效 - 按键:', key);
    
    // 拖拽时的节流控制，但跳过点击时的节流
    if (!skipThrottle) {
      const now = Date.now();
      const interfaceSettings = getInterfaceSettings();
      if (isDragging && interfaceSettings.enableDragThrottle && now - lastPlayTime < interfaceSettings.dragThrottleDelay) {
        return;
      }
      setLastPlayTime(now);
    }
    
    try {
      const interfaceSettings = getInterfaceSettings();
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
        console.log('🎹 开始播放音效:', { cell: cell.key, enabled: cell.enabled, volume: interfaceSettings.volume });
        await audioManager.playEffect(cell, 1, interfaceSettings.volume);
        
        // 更新交互计数
        setInteractionCount(prev => prev + 1);
        setLastKey(key);
        
        // 创建粒子效果
        if (interfaceSettings.enableParticles) {
          const particleId = `${Date.now()}-${Math.random()}`;
          // 根据设置决定使用原色还是随机颜色
          const particleColor = interfaceSettings.randomColors ? generateRandomColor() : cell.color;
          
          setParticles(prev => [...prev, {
            id: particleId,
            x: x || window.innerWidth / 2,
            y: y || window.innerHeight / 2,
            color: particleColor,
            life: interfaceSettings.particleLifetime
          }]);
          
          // 移除粒子
          setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== particleId));
          }, interfaceSettings.particleLifetime);
        }
        
        // 触发动画
        triggerCellAnimation(cell.id);
        
        // 触发全屏动画（仅在启用背景动效时）
        if (interfaceSettings.enableBackgroundAnimations) {
          // 如果启用了随机颜色，创建一个带随机颜色的cell副本
          const cellForAnimation = interfaceSettings.randomColors ? {
            ...cell,
            color: generateRandomColor()
          } : cell;
          setActiveCell(cellForAnimation);
          setFullscreenAnimationTrigger(Date.now());
        }
        
        // 如果启用了背景动画，设置背景动画类型
        if (cell.backgroundAnimationEnabled && cell.backgroundAnimationType && cell.backgroundAnimationType !== 'none') {
          // 这里可以设置特定的背景动画类型，FullscreenAnimation会根据cell的配置显示
          console.log('🎭 触发背景动画:', cell.backgroundAnimationType);
        }
      }
    } catch (error) {
      console.error('播放音效失败:', error);
    }
  }, [
    isAudioInitialized, 
    currentBgMusic,
    resumeBackgroundMusicIfPaused,
    isBackgroundMusicStarted,
    startBackgroundMusic,
    isUserDisabledMusic,
    gridConfig, 
    getInterfaceSettings, 
    isDragging, 
    lastPlayTime, 
    initializeAudio,
    setActiveCell,
    triggerCellAnimation,
  ]);

  /**
   * 根据单元格播放音效（简化版）
   */
  const playSoundByCell = useCallback(async (cell: GridCell, x: number, y: number, skipThrottle = false) => {
    if (!isAudioInitialized || !cell.enabled) return;

    const interfaceSettings = getInterfaceSettings();

    // 处理背景音乐：优先恢复暂停的音乐，否则启动新音乐
    if (currentBgMusic) {
      const resumed = await resumeBackgroundMusicIfPaused();
      if (resumed) {
        setIsBackgroundMusicStarted(true);
        console.log('🎵 通过音效触发恢复暂停的背景音乐');
      } else if (!isBackgroundMusicStarted && !isUserDisabledMusic) {
        console.log('🎵 通过单元格触发启动背景音乐...');
        await startBackgroundMusic();
      } else if (isUserDisabledMusic) {
        console.log('🎵 用户已主动暂停音乐（单元格交互），不启动新音乐');
      }
    }
    
    // 拖拽时的节流控制，但跳过点击时的节流
    if (!skipThrottle) {
      const now = Date.now();
      if (isDragging && interfaceSettings.enableDragThrottle && now - lastPlayTime < interfaceSettings.dragThrottleDelay) {
        return;
      }
      setLastPlayTime(now);
    }
    
    try {
      // 播放音效
      await audioManager.playEffect(cell, 1, interfaceSettings.volume);
      setInteractionCount(prev => prev + 1);
      setLastKey(cell.key || `(${cell.row},${cell.col})`);
      
      // 简化：所有音效播放都触发动画
      triggerCellAnimation(cell.id);
      
      // 触发全屏动画（仅在启用背景动效时）
      if (interfaceSettings.enableBackgroundAnimations) {
        // 如果启用了随机颜色或随机动效，创建一个修改后的cell副本
        const cellForAnimation = (() => {
          let modifiedCell = { ...cell };
          
          // 应用随机颜色
          if (interfaceSettings.randomColors) {
            modifiedCell.color = generateRandomColor();
          }
          
          // 应用随机动效 - 影响背景动画类型
          if (interfaceSettings.randomEffects) {
            const randomAnimationType = generateRandomAnimationType();
            modifiedCell.backgroundAnimationType = randomAnimationType as any;
            modifiedCell.animationType = randomAnimationType;
          }
          
          return modifiedCell;
        })();
        setActiveCell(cellForAnimation);
        setFullscreenAnimationTrigger(prev => prev + 1);
      }
      
      // 如果启用了背景动画，设置背景动画类型
      if (cell.backgroundAnimationEnabled && cell.backgroundAnimationType && cell.backgroundAnimationType !== 'none') {
        console.log('🎭 触发背景动画 (playSoundByCell):', cell.backgroundAnimationType);
      }
      
      // 添加粒子效果
      if (interfaceSettings.enableParticles) {
        const particleId = Math.random().toString(36);
        // 根据设置决定使用原色还是随机颜色
        const particleColor = interfaceSettings.randomColors ? generateRandomColor() : cell.color;
        const newParticle = {
          id: particleId,
          x,
          y,
          color: particleColor,
          life: 1
        };
        
        setParticles(prev => [...prev, newParticle]);
        
        // 移除粒子
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== particleId));
        }, interfaceSettings.particleLifetime);
      }
      
    } catch (error) {
      console.error('播放音效失败:', error);
    }
  }, [isAudioInitialized, currentBgMusic, resumeBackgroundMusicIfPaused, isBackgroundMusicStarted, startBackgroundMusic, isUserDisabledMusic, isDragging, lastPlayTime, getInterfaceSettings, triggerCellAnimation]);

  /**
   * 处理位置音效播放 - 根据配置的网格布局（简化版）
   * 这是鼠标/触摸交互的统一入口，负责处理初始化和播放。
   */
  const handlePlaySoundAtPosition = useCallback(async (x: number, y: number, skipThrottle = false) => {
    // 1. 初始化
    if (!isAudioInitialized) {
      await initializeAudio();
    }
    
    // 2. 处理背景音乐：优先恢复暂停的音乐，否则启动新音乐
    if (currentBgMusic) {
      const resumed = await resumeBackgroundMusicIfPaused();
      if (resumed) {
        setIsBackgroundMusicStarted(true);
        console.log('🎵 通过位置交互恢复暂停的背景音乐');
      } else if (!isBackgroundMusicStarted && !isUserDisabledMusic) {
      console.log('🎵 首次交互 (by position)，启动背景音乐...');
      await startBackgroundMusic();
      } else if (isUserDisabledMusic) {
        console.log('🎵 用户已主动暂停音乐（位置交互），不启动新音乐');
      }
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

    const interfaceSettings = getInterfaceSettings();
    
    if (!skipThrottle) {
      const now = Date.now();
      if (isDragging && interfaceSettings.enableDragThrottle && now - lastPlayTime < interfaceSettings.dragThrottleDelay) {
        return;
      }
      setLastPlayTime(now);
    }

    try {
      await audioManager.playEffect(cell, 1, interfaceSettings.volume);
      setInteractionCount(prev => prev + 1);
      setLastKey(cell.key || `(${cell.row},${cell.col})`);

      triggerCellAnimation(cell.id);

      // 触发全屏动画（仅在启用背景动效时）
      if (interfaceSettings.enableBackgroundAnimations) {
        // 如果启用了随机颜色或随机动效，创建一个修改后的cell副本
        const cellForAnimation = (() => {
          let modifiedCell = { ...cell };
          
          // 应用随机颜色
          if (interfaceSettings.randomColors) {
            modifiedCell.color = generateRandomColor();
          }
          
          // 应用随机动效 - 影响背景动画类型
          if (interfaceSettings.randomEffects) {
            const randomAnimationType = generateRandomAnimationType();
            modifiedCell.backgroundAnimationType = randomAnimationType as any;
            modifiedCell.animationType = randomAnimationType;
          }
          
          return modifiedCell;
        })();
        setActiveCell(cellForAnimation);
        setFullscreenAnimationTrigger(prev => prev + 1);
      }

      // 如果启用了背景动画，设置背景动画类型
      if (cell.backgroundAnimationEnabled && cell.backgroundAnimationType && cell.backgroundAnimationType !== 'none') {
        console.log('🎭 触发背景动画 (handlePlaySoundAtPosition):', cell.backgroundAnimationType);
      }

      if (interfaceSettings.enableParticles) {
        const particleId = Math.random().toString(36);
        // 根据设置决定使用原色还是随机颜色
        const particleColor = interfaceSettings.randomColors ? generateRandomColor() : cell.color;
        const newParticle = { id: particleId, x, y, color: particleColor, life: 1 };
        setParticles(prev => [...prev, newParticle]);
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== particleId));
        }, interfaceSettings.particleLifetime);
      }
    } catch (error) {
      console.error('播放音效失败:', error);
    }
    // --- playSoundByCell 的内联逻辑结束 ---

  }, [
    isAudioInitialized, 
    initializeAudio, 
    currentBgMusic, 
    resumeBackgroundMusicIfPaused,
    isBackgroundMusicStarted,
    startBackgroundMusic, 
    isUserDisabledMusic,
    gridConfig,
    isDragging,
    lastPlayTime,
    getInterfaceSettings,
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
    const interfaceSettings = getInterfaceSettings();
    if (!interfaceSettings.mouseEnabled) return;
    
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
  }, [getInterfaceSettings, handlePlaySoundAtPosition, gridConfig]);

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
    
    const interfaceSettings = getInterfaceSettings();
    if (!interfaceSettings.mouseEnabled || !isDragging || !lastMousePosition || !gridConfig) return;
    
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
    
  }, [getInterfaceSettings, isDragging, showHelpInfo, lastMousePosition, gridConfig, handlePlaySoundAtPosition]);

  /**
   * 处理单个触摸点的音效播放
   */
  const handleSingleTouchPlay = useCallback(async (touchId: number, x: number, y: number, isStart: boolean = false) => {
    if (!gridConfig) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // 计算当前格子位置
    const col = Math.floor((x / rect.width) * gridConfig.cols);
    const row = Math.floor((y / rect.height) * gridConfig.rows);
    const cell = gridConfig.cells.find(c => c.row === row && c.col === col && c.enabled);
    
    if (!cell) return;
    
    // 检查这个触摸点是否已经在这个格子上
    const currentTouch = activeTouchesRef.current.get(touchId);
    if (currentTouch && currentTouch.cellId === cell.id && !isStart) {
      return; // 如果还在同一个格子上，不重复播放
    }
    
    // 更新触摸点信息
    const newTouchInfo = { x, y, cellId: cell.id };
    activeTouchesRef.current.set(touchId, newTouchInfo);
    setActiveTouches(new Map(activeTouchesRef.current));
    
    // 播放音效
    await handlePlaySoundAtPosition(x, y, isStart);
  }, [gridConfig, handlePlaySoundAtPosition]);

  /**
   * 处理触摸开始 - 支持多点触控
   */
  const handleTouchStart = useCallback(async (e: React.TouchEvent) => {
    const interfaceSettings = getInterfaceSettings();
    if (!interfaceSettings.mouseEnabled) return;
    
    e.preventDefault(); // 防止双击放大和其他默认行为
    setIsDragging(true);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !gridConfig) return;
    
    // 处理所有新增的触摸点
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // 处理每个触摸点
      await handleSingleTouchPlay(touch.identifier, x, y, true);
    }
    
    // 如果是第一个触摸点，记录为主要触摸位置（用于帮助信息显示）
    if (e.touches.length === 1) {
      const primaryTouch = e.touches[0];
      const x = primaryTouch.clientX - rect.left;
      const y = primaryTouch.clientY - rect.top;
      setLastMousePosition({ x, y });
      
      // 计算主要触摸点的格子位置
      const col = Math.floor((x / rect.width) * gridConfig.cols);
      const row = Math.floor((y / rect.height) * gridConfig.rows);
      lastGridPositionRef.current = { row, col };
    }
  }, [getInterfaceSettings, handleSingleTouchPlay, gridConfig]);

  /**
   * 处理触摸移动 - 支持多点触控
   */
  const handleTouchMove = useCallback(async (e: React.TouchEvent) => {
    const interfaceSettings = getInterfaceSettings();
    if (!interfaceSettings.mouseEnabled || !isDragging || !gridConfig) return;
    
    e.preventDefault(); // 防止页面滚动
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // 处理所有活动的触摸点
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // 处理每个触摸点的移动
      await handleSingleTouchPlay(touch.identifier, x, y, false);
    }
    
    // 更新主要触摸点位置（用于帮助信息显示）
    if (showHelpInfo && e.touches.length > 0) {
      const primaryTouch = e.touches[0];
      setMousePosition({
        x: primaryTouch.clientX - rect.left,
        y: primaryTouch.clientY - rect.top
      });
    }
    
    // 如果只有一个触摸点，更新主要触摸位置
    if (e.touches.length === 1) {
      const primaryTouch = e.touches[0];
      const x = primaryTouch.clientX - rect.left;
      const y = primaryTouch.clientY - rect.top;
      setLastMousePosition({ x, y });
      
      // 计算主要触摸点的格子位置
      const col = Math.floor((x / rect.width) * gridConfig.cols);
      const row = Math.floor((y / rect.height) * gridConfig.rows);
      lastGridPositionRef.current = { row, col };
    }
    
  }, [getInterfaceSettings, isDragging, showHelpInfo, gridConfig, handleSingleTouchPlay]);

  /**
   * 处理触摸结束 - 支持多点触控
   */
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    // 清理结束的触摸点
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      activeTouchesRef.current.delete(touch.identifier);
    }
    setActiveTouches(new Map(activeTouchesRef.current));
    
    // 如果没有活动触摸点，重置拖拽状态
    if (e.touches.length === 0) {
      setIsDragging(false);
      setLastTriggeredCellId(null);
      setLastMousePosition(null);
      activeTouchesRef.current.clear();
      setActiveTouches(new Map());
    }
  }, []);

  /**
   * 处理键盘事件
   */
  const handleKeyPress = useCallback(async (e: KeyboardEvent) => {
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
    
    const interfaceSettings = getInterfaceSettings();
    if (!gridConfig || !interfaceSettings.keyboardEnabled) return;
    
    const cell = gridConfig.cells.find(c => c.key?.toLowerCase() === key && c.enabled);
    if (!cell) return;
    
    e.preventDefault();
    
    const rect = containerRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.width / 2 : 400;
    const centerY = rect ? rect.height / 2 : 300;
    
    // 键盘按下时，不需要节流 (skipThrottle = true)
    await playSoundByKey(key, centerX, centerY, true);
  }, [gridConfig, getInterfaceSettings, showHelpInfo, playSoundByKey]);

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
        {(gridConfig?.interfaceSettings?.enableBackgroundAnimations ?? DEFAULT_INTERFACE_SETTINGS.enableBackgroundAnimations) && (
          <FullscreenAnimation 
            isTriggered={fullscreenAnimationTrigger}
            cell={activeCell}
            onAnimationEnd={() => {
              console.log('Fullscreen animation ended');
            }}
          />
        )}

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

        {/* 多点触控指示器 */}
        {Array.from(activeTouches.entries()).map(([touchId, touchInfo]) => (
          <div
            key={`touch-${touchId}`}
            className="absolute w-6 h-6 rounded-full pointer-events-none border-2 border-white bg-white bg-opacity-30 animate-pulse"
            style={{
              left: touchInfo.x - 12,
              top: touchInfo.y - 12,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              {touchId}
            </div>
          </div>
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
                    animationEnabled={cell.animationEnabled && (gridConfig?.interfaceSettings?.enableRegionAnimations ?? DEFAULT_INTERFACE_SETTINGS.enableRegionAnimations)}
                    animationType={cell.animationType}
                    animationConfig={cell.animationConfig}
                    cellColor={cell.color}
                    soundType={cell.soundType}
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
                            animationEnabled={cell.animationEnabled && (gridConfig?.interfaceSettings?.enableRegionAnimations ?? DEFAULT_INTERFACE_SETTINGS.enableRegionAnimations)}
                            animationType={(() => {
                              const interfaceSettings = getInterfaceSettings();
                              // 如果启用了随机动效，生成随机动效类型
                              if (interfaceSettings.randomEffects) {
                                return generateRandomAnimationType();
                              }
                              return cell.animationType;
                            })()}
                            animationConfig={cell.animationConfig}
                            cellColor={(() => {
                              const interfaceSettings = getInterfaceSettings();
                              // 如果启用了随机颜色，生成随机颜色
                              if (interfaceSettings.randomColors) {
                                return generateRandomColor();
                              }
                              return cell.color;
                            })()}
                            soundType={cell.soundType}
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
        <div className="absolute bottom-20 right-4 z-50 flex flex-col gap-2 pointer-events-auto">
          <div
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
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
              </div>

          <div
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            <MikutapButton
              onClick={handleTestClick}
              onTouchAction={handleTestClick}
              icon={isAudioInitialized ? '🎹' : '🔊'}
              text={isAudioInitialized ? '播放音阶' : '初始化音频'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              touchHandled={touchHandled}
              setTouchHandled={setTouchHandled}
            />
          </div>

                    {/* 音乐播放器 - 使用FloatingMenu */}
          <div style={{ pointerEvents: 'auto' }}>
            <FloatingMenu
              trigger={
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105">
                  <span className="text-xl">🎵</span>
                </div>
              }
              menu={
                <MikutapMusicPlayer
                  track={currentMusicTrack}
                  onPlay={handleMusicPlayerPlay}
                  onPause={handleMusicPlayerPause}
                  onSeek={handleMusicPlayerSeek}
                  isPlaying={isBackgroundMusicStarted}
                  currentTime={musicCurrentTime}
                  duration={musicDuration}
                />
              }
              initialPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 100 : 300, y: typeof window !== 'undefined' ? window.innerHeight - 200 : 200 }}
              triggerClassName="transition-all hover:scale-105"
              menuClassName="!bg-transparent !shadow-none !border-none"
            />
          </div>

          <div
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
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
      </div>

      {/* 开发调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-10 bg-black bg-opacity-70 text-white p-2 rounded text-xs z-30">
          <div>音频状态: {isAudioInitialized ? '已初始化' : '未初始化'}</div>
          <div>活跃粒子: {particles.length}</div>
          <div>最后按键: {lastKey || '无'}</div>
          <div>拖拽状态: {isDragging ? '拖拽中' : '正常'}</div>
          <div>帮助蒙版: {showHelpInfo ? '显示' : '隐藏'}</div>
          <div>活动触摸点: {activeTouches.size}</div>
          <div>音量: {Math.round((gridConfig?.interfaceSettings?.volume ?? DEFAULT_INTERFACE_SETTINGS.volume) * 100)}%</div>
        </div>
      )}

    </div>
  );
}