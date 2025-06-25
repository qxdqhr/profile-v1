 /**
 * 简化版 Mikutap 页面组件
 * 直接使用合成音效，无需加载音频文件
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getAudioGenerator } from '../utils/audioGenerator';
import { Modal } from '@/components/PopWindow';

interface SimpleMikutapPageProps {
  className?: string;
}

export default function SimpleMikutapPage({ className = '' }: SimpleMikutapPageProps) {
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const [lastKey, setLastKey] = useState<string>('');
  const [particles, setParticles] = useState<Array<{id: string, x: number, y: number, color: string, life: number}>>([]);
  const [showHelpInfo, setShowHelpInfo] = useState(false);
  const [mousePosition, setMousePosition] = useState<{x: number, y: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPlayTime, setLastPlayTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    volume: 0.7,
    enableParticles: true,
    enableDragThrottle: true,
    dragThrottleDelay: 50,
    particleLifetime: 1000,
    keyboardEnabled: true,
    mouseEnabled: true,
  });
  const [touchHandled, setTouchHandled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioGeneratorRef = useRef(getAudioGenerator());

  /**
   * 初始化音频系统
   */
  const initializeAudio = useCallback(async () => {
    try {
      setAudioError(null);
      const success = await audioGeneratorRef.current.initialize();
      setIsAudioInitialized(success);
      
      if (success) {
        // 播放测试音效确认音频工作
        audioGeneratorRef.current.playSoundById('q', 0.5, 0.5);
      }
      
      return success;
    } catch (error) {
      const errorMsg = (error as Error).message;
      setAudioError(errorMsg);
      console.error('音频初始化失败:', error);
      return false;
    }
  }, []);

  /**
   * 播放音效
   */
  const playSound = useCallback((key: string, x: number, y: number, skipThrottle = false) => {
    if (!isAudioInitialized) return;
    
    // 拖拽时的节流控制
    const now = Date.now();
    if (!skipThrottle && isDragging && settings.enableDragThrottle && now - lastPlayTime < settings.dragThrottleDelay) {
      return;
    }
    setLastPlayTime(now);
    
    try {
      audioGeneratorRef.current.playSoundById(key, 1, settings.volume);
      setInteractionCount(prev => prev + 1);
      setLastKey(key.toUpperCase());
      
      // 添加粒子效果
      if (settings.enableParticles) {
        const colors = {
          q: '#FF6B9D', w: '#C44569', e: '#F8B500', r: '#40E0D0', t: '#6C5CE7',
          y: '#A8E6CF', u: '#FFD93D', i: '#6BCF7F', o: '#4834DF', p: '#FF3838',
          a: '#FF9F1C', s: '#2ECC71', d: '#E74C3C', f: '#9B59B6', g: '#1ABC9C',
          h: '#F39C12', j: '#3498DB', k: '#E67E22', l: '#8E44AD',
          z: '#FF6B6B', x: '#4ECDC4', c: '#45B7D1', v: '#96CEB4', b: '#FFEAA7',
          n: '#DDA0DD', m: '#98D8C8'
        };
        
        const particleId = Math.random().toString(36);
        const newParticle = {
          id: particleId,
          x,
          y,
          color: colors[key as keyof typeof colors] || '#FFFFFF',
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
  }, [isAudioInitialized, isDragging, lastPlayTime]);

  /**
   * 处理位置音效播放 - 网格布局 (5列 x 6行)
   */
  const handlePlaySoundAtPosition = useCallback(async (x: number, y: number, skipThrottle = false) => {
    if (!isAudioInitialized) {
      await initializeAudio();
      return;
    }
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // 网格配置: 5列 x 6行 = 30个格子，使用前26个
    const cols = 5;
    const rows = 6;
    const keys = 'qwertyuiopasdfghjklzxcvbnm';
    
    // 计算网格位置
    const col = Math.floor((x / rect.width) * cols);
    const row = Math.floor((y / rect.height) * rows);
    const gridIndex = row * cols + col;
    
    // 确保在有效范围内
    const keyIndex = Math.min(gridIndex, keys.length - 1);
    const key = keys[keyIndex] || 'q';
    
    playSound(key, x, y, skipThrottle);
  }, [isAudioInitialized, initializeAudio, playSound]);

  /**
   * 处理鼠标点击和触摸
   */
  const handleClick = useCallback(async (e: React.MouseEvent) => {
    if (!settings.mouseEnabled || isDragging) return; // 鼠标禁用或拖拽时不处理点击
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    await handlePlaySoundAtPosition(x, y, true);
  }, [settings.mouseEnabled, isDragging, handlePlaySoundAtPosition]);

  /**
   * 处理触摸开始
   */
  const handleTouchStart = useCallback(async (e: React.TouchEvent) => {
    if (!settings.mouseEnabled) return;
    
    e.preventDefault(); // 防止双击放大和其他默认行为
    setIsDragging(true);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    await handlePlaySoundAtPosition(x, y, true);
  }, [settings.mouseEnabled, handlePlaySoundAtPosition]);

  /**
   * 处理触摸移动
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
    
    if (!settings.mouseEnabled || !isDragging) return;
    
    e.preventDefault(); // 防止页面滚动
    
    if (!rect) return;
    
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    await handlePlaySoundAtPosition(x, y);
  }, [settings.mouseEnabled, isDragging, showHelpInfo, handlePlaySoundAtPosition]);

  /**
   * 处理触摸结束
   */
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

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
    
    await handlePlaySoundAtPosition(x, y, true);
  }, [settings.mouseEnabled, handlePlaySoundAtPosition]);

  /**
   * 处理鼠标移动（拖拽）
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
    
    if (!settings.mouseEnabled || !isDragging) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    await handlePlaySoundAtPosition(x, y);
  }, [settings.mouseEnabled, isDragging, showHelpInfo, handlePlaySoundAtPosition]);

  /**
   * 处理鼠标松开
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * 处理键盘事件
   */
  const handleKeyPress = useCallback(async (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    
    // 特殊按键处理
    if (key === 'escape') {
      setShowHelpInfo(false);
      setShowSettings(false);
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
    
    // 设置快捷键
    if (key === 's' && e.ctrlKey) {
      e.preventDefault();
      setShowSettings(!showSettings);
      return;
    }
    
    const validKeys = 'qwertyuiopasdfghjklzxcvbnm';
    
    if (!validKeys.includes(key) || !settings.keyboardEnabled) return;
    
    if (!isAudioInitialized) {
      await initializeAudio();
      return;
    }
    
    e.preventDefault();
    
    const rect = containerRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.width / 2 : 400;
    const centerY = rect ? rect.height / 2 : 300;
    
    playSound(key, centerX, centerY, true);
  }, [isAudioInitialized, initializeAudio, playSound, showHelpInfo, showSettings, settings.keyboardEnabled]);

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

  return (
    <div className={`w-full h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black relative overflow-hidden touch-optimized ${className}`}>
      {/* 主游戏区域 */}
      <div
        ref={containerRef}
        className={`relative w-full h-full select-none no-zoom ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setMousePosition(null);
          setIsDragging(false); // 鼠标离开时停止拖拽
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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

        {/* 初始化提示 */}
        {!isAudioInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="text-center text-white">
              <div className="text-3xl mb-6">🎵 Mikutap</div>
              <div className="text-xl mb-4">点击任意位置开始演奏</div>
              <div className="text-sm opacity-75">
                使用合成音效，无需下载音频文件
              </div>
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

        {/* 游戏信息 */}
        {isAudioInitialized && (
          <>
            <div className="absolute top-4 left-4 text-white text-sm opacity-75 z-20">
              <div>🎵 Mikutap - 合成音效版</div>
              <div className="mt-1">
                <span className="hidden md:inline">点击鼠标 • 拖拽 • 按键盘字母开始演奏</span>
                <span className="md:hidden">触摸屏幕 • 拖拽 • 按键盘字母开始演奏</span>
              </div>
              <div className="mt-1">🔊 音频系统已激活</div>
              {isDragging && (
                <div className="mt-1 text-green-300">
                  <span className="hidden md:inline">🎨 拖拽模式 - 连续演奏中</span>
                  <span className="md:hidden">🎨 触摸模式 - 连续演奏中</span>
                </div>
              )}
              {!showHelpInfo && (
                <div className="mt-1 text-xs opacity-60">💡 点击左下角查看操作指南</div>
              )}
              {lastKey && (
                <div className="mt-1">最后按键: <span className="font-mono text-yellow-300">{lastKey}</span></div>
              )}
            </div>

            <div className="absolute top-4 right-4 text-white text-sm opacity-75 z-20">
              <div>交互次数: {interactionCount}</div>
            </div>
          </>
        )}

        {/* 网格蒙版 - 显示点击区域信息 */}
        {showHelpInfo && (
          <div className="absolute inset-0 bg-black bg-opacity-60 z-25 pointer-events-none"
               onClick={handleClick}
               onMouseDown={handleMouseDown}
               onMouseMove={handleMouseMove}
               onMouseUp={handleMouseUp}
               onTouchStart={handleTouchStart}
               onTouchMove={handleTouchMove}
               onTouchEnd={handleTouchEnd}
               style={{ pointerEvents: 'auto' }}>
            
            {/* 网格边界线 */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* 网格配置: 5列 x 6行 */}
              {(() => {
                const cols = 5;
                const rows = 6;
                const keys = 'qwertyuiopasdfghjklzxcvbnm';
                
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
                    {Array.from({ length: Math.min(26, cols * rows) }, (_, index) => {
                      const row = Math.floor(index / cols);
                      const col = index % cols;
                      const char = keys[index];
                      const soundName = index < 10 ? '钢琴' : index < 19 ? '鼓点' : '特效';
                      const bgColor = index < 10 ? 'bg-blue-500' : index < 19 ? 'bg-green-500' : 'bg-purple-500';
                      const borderColor = index < 10 ? 'border-blue-300' : index < 19 ? 'border-green-300' : 'border-purple-300';
                      
                      return (
                        <div
                          key={index}
                          className={`absolute flex flex-col items-center justify-center text-white border ${borderColor} border-opacity-30 ${bgColor} bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 pointer-events-none`}
                          style={{
                            left: `${(col / cols) * 100}%`,
                            top: `${(row / rows) * 100}%`,
                            width: `${(1 / cols) * 100}%`,
                            height: `${(1 / rows) * 100}%`,
                          }}
                        >
                          {/* 音效图标 */}
                          <div className="text-lg md:text-2xl xl:text-3xl mb-1">
                            {index < 10 ? '🎹' : index < 19 ? '🥁' : '🎛️'}
                          </div>
                          
                          {/* 字母 */}
                          <div className="text-xl md:text-2xl xl:text-4xl font-bold font-mono mb-1">
                            {char.toUpperCase()}
                          </div>
                          
                          {/* 音色类型 */}
                          <div className="text-xs md:text-sm xl:text-base font-semibold">
                            {soundName}
                          </div>
                          
                          {/* 波形类型 - 桌面端显示 */}
                          <div className="hidden md:block text-xs xl:text-sm opacity-75 mt-1">
                            {index < 10 ? '正弦波' : index < 19 ? '方波' : '锯齿波'}
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
              
              {/* 底部区域标识 */}
              <div className="absolute bottom-24 left-0 right-0 flex flex-wrap justify-center gap-2 pointer-events-none">
                <div className="bg-blue-500 bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  🎹 钢琴音色 (Q-P)
                </div>
                <div className="bg-green-500 bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  🥁 鼓点音色 (A-L)
                </div>
                <div className="bg-purple-500 bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  🎛️ 特效音色 (Z-M)
                </div>
              </div>
            </div>

      
            
            {/* 顶部说明 */}
            <div className="absolute top-2 md:top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white px-3 md:px-4 py-2 rounded-lg text-center pointer-events-auto max-w-[90vw]">
              <div className="text-sm md:text-lg font-bold mb-1">🎵 Mikutap 网格操作区域</div>
              <div className="text-xs md:text-sm opacity-75">
                5x6网格显示26个音效区域 • 点击任意网格演奏对应音效
              </div>
              <div className="text-xs opacity-60 mt-1">
                按ESC或💡按钮关闭蒙版 • 网格布局更适合触摸操作
              </div>
            </div>

            {/* 鼠标位置指示器 */}
            {mousePosition && (
              <div 
                className="absolute pointer-events-none bg-yellow-400 bg-opacity-80 text-black px-2 py-1 rounded text-xs font-bold z-50"
                style={{
                  left: mousePosition.x + 10,
                  top: mousePosition.y - 30,
                  transform: mousePosition.x > window.innerWidth - 100 ? 'translateX(-100%)' : 'none'
                }}
              >
                {(() => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (!rect) return '';
                  
                  // 网格计算: 5列 x 6行
                  const cols = 5;
                  const rows = 6;
                  const keys = 'qwertyuiopasdfghjklzxcvbnm';
                  
                  const col = Math.floor((mousePosition.x / rect.width) * cols);
                  const row = Math.floor((mousePosition.y / rect.height) * rows);
                  const gridIndex = row * cols + col;
                  const index = Math.min(gridIndex, keys.length - 1);
                  
                  const char = keys[index] || 'q';
                  const soundName = index < 10 ? '钢琴音' : index < 19 ? '鼓点音' : '特效音';
                  const icon = index < 10 ? '🎹' : index < 19 ? '🥁' : '🎛️';
                  return `${icon} ${char.toUpperCase()} - ${soundName} (行${row+1}列${col+1})`;
                })()}
              </div>
            )}
            
            {/* 底部快捷键提示 */}
            <div className="absolute bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white px-3 md:px-4 py-2 rounded-lg text-center pointer-events-auto max-w-[90vw]">
              <div className="text-xs md:text-sm">
                <div className="md:hidden space-y-1">
                  <div>⌨️ 键盘: 直接按字母键</div>
                  <div>🖱️ 鼠标: 点击或拖拽网格</div>
                  <div>📱 网格: 5列×6行布局</div>
                  <div>⚡ ESC关闭 / F1切换</div>
                </div>
                {/* <div className="hidden md:block space-x-3">
                  <span>⌨️ 键盘: 直接按字母键</span>
                  <span>🖱️ 鼠标: 点击或拖拽网格连续演奏</span>
                  <span>📱 网格: 5列×6行显示26个音效区域</span>
                  <span>⚡ 快捷键: ESC关闭 / F1切换</span>
                </div> */}
              </div>
            </div>
          </div>
        )}

        {/* 功能按钮组 */}
        <div 
          className="absolute bottom-20 right-4 z-50 flex flex-col gap-2 pointer-events-auto"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 设置按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (touchHandled) {
                setTouchHandled(false);
                return;
              }
              setShowSettings(true);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setTouchHandled(true);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowSettings(true);
              setTimeout(() => setTouchHandled(false), 100);
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mobile-button pointer-events-auto"
            title="打开设置 (Ctrl+S)"
          >
            <span>⚙️</span>
            <span className="hidden md:inline">设置</span>
          </button>
          
          {/* 测试按钮 */}
          <button
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              if (touchHandled) {
                setTouchHandled(false);
                return;
              }
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
                    playSound(note, x, y, true);
                  }, index * 200);
                });
              }
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setTouchHandled(true);
            }}
            onTouchEnd={async (e) => {
              e.stopPropagation();
              e.preventDefault();
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
                    playSound(note, x, y, true);
                  }, index * 200);
                });
              }
              setTimeout(() => setTouchHandled(false), 100);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mobile-button pointer-events-auto"
          >
            {isAudioInitialized ? '🎹 播放音阶' : '🔊 初始化音频'}
          </button>

          {/* 帮助信息切换按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              // 如果刚刚处理过触摸事件，跳过点击事件
              if (touchHandled) {
                setTouchHandled(false);
                return;
              }
              setShowHelpInfo(prev => !prev);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setTouchHandled(true);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.preventDefault();
              // 在触摸设备上处理状态切换
              setShowHelpInfo(prev => !prev);
              // 设置延时清除flag，防止后续的click事件被触发
              setTimeout(() => setTouchHandled(false), 100);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 z-50 flex items-center gap-2 mobile-button pointer-events-auto"
          >
          <span>{showHelpInfo ? '🙈' : '💡'}</span>
          <span>{showHelpInfo ? '隐藏帮助' : '显示帮助'}</span>
        </button> 
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

      {/* 设置弹窗 */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="🎵 Mikutap 设置"
        width={500}
        height="auto"
        className="settings-modal"
      >
        <div className="space-y-6 p-4">
          {/* 音频设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">🔊 音频设置</h3>
            
            {/* 音量控制 */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>音量</span>
                <span className="text-gray-500">{Math.round(settings.volume * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => setSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* 交互设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">🎮 交互设置</h3>
            
            {/* 键盘启用 */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">启用键盘操作</label>
              <input
                type="checkbox"
                checked={settings.keyboardEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, keyboardEnabled: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            {/* 鼠标启用 */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">启用鼠标操作</label>
              <input
                type="checkbox"
                checked={settings.mouseEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, mouseEnabled: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 拖拽设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">🖱️ 拖拽设置</h3>
            
            {/* 拖拽节流 */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">启用拖拽节流</label>
              <input
                type="checkbox"
                checked={settings.enableDragThrottle}
                onChange={(e) => setSettings(prev => ({ ...prev, enableDragThrottle: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            {/* 节流延迟 */}
            {settings.enableDragThrottle && (
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                  <span>拖拽延迟</span>
                  <span className="text-gray-500">{settings.dragThrottleDelay}ms</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={settings.dragThrottleDelay}
                  onChange={(e) => setSettings(prev => ({ ...prev, dragThrottleDelay: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* 视觉效果设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">✨ 视觉效果</h3>
            
            {/* 粒子效果 */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">启用粒子效果</label>
              <input
                type="checkbox"
                checked={settings.enableParticles}
                onChange={(e) => setSettings(prev => ({ ...prev, enableParticles: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            {/* 粒子生命周期 */}
            {settings.enableParticles && (
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                  <span>粒子持续时间</span>
                  <span className="text-gray-500">{settings.particleLifetime}ms</span>
                </label>
                <input
                  type="range"
                  min="200"
                  max="3000"
                  step="100"
                  value={settings.particleLifetime}
                  onChange={(e) => setSettings(prev => ({ ...prev, particleLifetime: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={() => {
                setSettings({
                  volume: 0.7,
                  enableParticles: true,
                  enableDragThrottle: true,
                  dragThrottleDelay: 50,
                  particleLifetime: 1000,
                  keyboardEnabled: true,
                  mouseEnabled: true,
                });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              重置默认
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>

          {/* 快捷键提示 */}
          <div className="text-xs text-gray-500 border-t pt-4">
            <div className="space-y-1">
              <div>• Ctrl+S: 打开/关闭设置</div>
              <div>• Ctrl+H 或 F1: 显示/隐藏帮助</div>
              <div>• ESC: 关闭所有弹窗</div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}