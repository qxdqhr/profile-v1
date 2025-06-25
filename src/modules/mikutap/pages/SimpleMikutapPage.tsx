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
    
    // 拖拽时的节流控制（50ms间隔）
    const now = Date.now();
    if (!skipThrottle && isDragging && now - lastPlayTime < 50) {
      return;
    }
    setLastPlayTime(now);
    
    try {
      audioGeneratorRef.current.playSoundById(key, 1, 0.7);
      setInteractionCount(prev => prev + 1);
      setLastKey(key.toUpperCase());
      
      // 添加粒子效果
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
      }, 1000);
      
    } catch (error) {
      console.error('播放音效失败:', error);
    }
  }, [isAudioInitialized, isDragging, lastPlayTime]);

  /**
   * 处理位置音效播放
   */
  const handlePlaySoundAtPosition = useCallback(async (x: number, y: number, skipThrottle = false) => {
    if (!isAudioInitialized) {
      await initializeAudio();
      return;
    }
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // 根据位置选择音效
    const keys = 'qwertyuiopasdfghjklzxcvbnm';
    const index = Math.floor((x / rect.width) * keys.length);
    const key = keys[index] || 'q';
    
    playSound(key, x, y, skipThrottle);
  }, [isAudioInitialized, initializeAudio, playSound]);

  /**
   * 处理鼠标点击
   */
  const handleClick = useCallback(async (e: React.MouseEvent) => {
    if (isDragging) return; // 拖拽时不处理点击
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    await handlePlaySoundAtPosition(x, y, true);
  }, [isDragging, handlePlaySoundAtPosition]);

  /**
   * 处理鼠标按下
   */
  const handleMouseDown = useCallback(async (e: React.MouseEvent) => {
    setIsDragging(true);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    await handlePlaySoundAtPosition(x, y, true);
  }, [handlePlaySoundAtPosition]);

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
    
    if (!isDragging) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    await handlePlaySoundAtPosition(x, y);
  }, [isDragging, showHelpInfo, handlePlaySoundAtPosition]);

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
    
    const validKeys = 'qwertyuiopasdfghjklzxcvbnm';
    
    if (!validKeys.includes(key)) return;
    
    if (!isAudioInitialized) {
      await initializeAudio();
      return;
    }
    
    e.preventDefault();
    
    const rect = containerRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.width / 2 : 400;
    const centerY = rect ? rect.height / 2 : 300;
    
    playSound(key, centerX, centerY);
  }, [isAudioInitialized, initializeAudio, playSound, showHelpInfo]);

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

  return (
    <div className={`w-full h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black relative overflow-hidden ${className}`}>
      {/* 主游戏区域 */}
      <div
        ref={containerRef}
        className={`relative w-full h-full select-none ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setMousePosition(null);
          setIsDragging(false); // 鼠标离开时停止拖拽
        }}
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
              <div className="mt-1">点击鼠标 • 拖拽 • 按键盘字母开始演奏</div>
              <div className="mt-1">🔊 音频系统已激活</div>
              {isDragging && (
                <div className="mt-1 text-green-300">🎨 拖拽模式 - 连续演奏中</div>
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

                {/* 帮助信息切换按钮 */}
        <button
          onClick={() => setShowHelpInfo(!showHelpInfo)}
          className="absolute bottom-4 left-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 z-30 flex items-center gap-2"
        >
          <span>{showHelpInfo ? '🙈' : '💡'}</span>
          <span>{showHelpInfo ? '隐藏帮助' : '显示帮助'}</span>
        </button>

        {/* 网格蒙版 - 显示点击区域信息 */}
        {showHelpInfo && (
          <div className="absolute inset-0 bg-black bg-opacity-60 z-25 pointer-events-none"
               onClick={handleClick}
               onMouseDown={handleMouseDown}
               onMouseMove={handleMouseMove}
               onMouseUp={handleMouseUp}
               style={{ pointerEvents: 'auto' }}>
            
            {/* 点击区域边界线 */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* 背景颜色区域 */}
              <div className="absolute inset-0 flex">
                {/* 钢琴音色区域背景 */}
                <div 
                  className="bg-blue-500 bg-opacity-10 border-r-2 border-blue-300 border-opacity-50"
                  style={{ width: `${(10/26) * 100}%` }}
                />
                {/* 鼓点音色区域背景 */}
                <div 
                  className="bg-green-500 bg-opacity-10 border-r-2 border-green-300 border-opacity-50"
                  style={{ width: `${(9/26) * 100}%` }}
                />
                {/* 特效音色区域背景 */}
                <div 
                  className="bg-purple-500 bg-opacity-10"
                  style={{ width: `${(7/26) * 100}%` }}
                />
              </div>
              
              {/* 垂直分割线 */}
              {Array.from({ length: 25 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-0.5 bg-white bg-opacity-40"
                  style={{
                    left: `${((i + 1) / 26) * 100}%`,
                    boxShadow: '0 0 3px rgba(255,255,255,0.8)'
                  }}
                />
              ))}
              
              {/* 主要区域分割线 */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-blue-300 bg-opacity-80"
                style={{
                  left: `${(10/26) * 100}%`,
                  boxShadow: '0 0 5px rgba(59, 130, 246, 0.8)'
                }}
              />
              <div
                className="absolute top-0 bottom-0 w-1 bg-green-300 bg-opacity-80"
                style={{
                  left: `${(19/26) * 100}%`,
                  boxShadow: '0 0 5px rgba(34, 197, 94, 0.8)'
                }}
              />
              
              {/* 区域标识 */}
              {Array.from({ length: 26 }, (_, index) => {
                const char = 'qwertyuiopasdfghjklzxcvbnm'[index];
                const soundName = index < 10 ? '钢琴' : index < 19 ? '鼓点' : '特效';
                const bgColor = index < 10 ? 'bg-blue-500' : index < 19 ? 'bg-green-500' : 'bg-purple-500';
                
                return (
                  <div
                    key={index}
                    className={`absolute top-1/2 justify-center bg-clear text-white text-xs px-1 py-0.5 rounded font-mono font-bold pointer-events-none`}
                    style={{
                      left: `${((index + 0.5) / 26) * 100}%`,
                      transform: 'translateX(-50%)',
                      fontSize: '10px'
                    }}
                  >
                      {/* 音效图标 */}
                      <div className="text-lg md:text-2xl mb-1">
                      {index < 10 ? '🎹' : index < 19 ? '🥁' : '🎛️'}
                    </div>
                    
                    {/* 字母 */}
                    <div className="text-xl md:text-3xl font-bold font-mono mb-1">
                      {char.toUpperCase()}
                    </div>
                    
                    {/* 音色类型 */}
                    <div className="text-xs md:text-sm font-semibold">
                      {soundName}
                    </div>
                    
                    {/* 波形类型 - 桌面端显示 */}
                    <div className="hidden md:block text-xs opacity-75 mt-1">
                      {index < 10 ? '正弦波' : index < 19 ? '方波' : '锯齿波'}
                    </div>
                  </div>
                );
              })}
              
              {/* 底部区域标识 */}
              <div className="absolute bottom-24 left-0 right-0 flex pointer-events-none">
                <div className="flex-1 text-center">
                  <div className="bg-blue-500 bg-opacity-60 text-white text-xs px-2 py-1 rounded mx-auto inline-block">
                    🎹 钢琴音色区域 (Q-P)
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <div className="bg-green-500 bg-opacity-60 text-white text-xs px-2 py-1 rounded mx-auto inline-block">
                    🥁 鼓点音色区域 (A-L)
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <div className="bg-purple-500 bg-opacity-60 text-white text-xs px-2 py-1 rounded mx-auto inline-block">
                    🎛️ 特效音色区域 (Z-M)
                  </div>
                </div>
              </div>
            </div>

      
            
            {/* 顶部说明 */}
            <div className="absolute top-2 md:top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white px-3 md:px-4 py-2 rounded-lg text-center pointer-events-auto max-w-[90vw]">
              <div className="text-sm md:text-lg font-bold mb-1">🎵 Mikutap 操作区域划分</div>
              <div className="text-xs md:text-sm opacity-75">
                垂直线条显示26个音效区域边界 • 点击任意位置演奏对应音效
              </div>
              <div className="text-xs opacity-60 mt-1">
                按ESC或💡按钮关闭蒙版
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
                  const index = Math.floor((mousePosition.x / rect.width) * 26);
                  const char = 'qwertyuiopasdfghjklzxcvbnm'[index] || 'q';
                  const soundName = index < 10 ? '钢琴音' : index < 19 ? '鼓点音' : '特效音';
                  const icon = index < 10 ? '🎹' : index < 19 ? '🥁' : '🎛️';
                  return `${icon} ${char.toUpperCase()} - ${soundName}`;
                })()}
              </div>
            )}
            
            {/* 底部快捷键提示 */}
            <div className="absolute bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white px-3 md:px-4 py-2 rounded-lg text-center pointer-events-auto max-w-[90vw]">
              <div className="text-xs md:text-sm">
                <div className="md:hidden space-y-1">
                  <div>⌨️ 键盘: 直接按字母键</div>
                  <div>🖱️ 鼠标: 点击或拖拽任意位置</div>
                  <div>📏 白线显示区域边界</div>
                  <div>⚡ ESC关闭 / F1切换</div>
                </div>
                <div className="hidden md:block space-x-3">
                  <span>⌨️ 键盘: 直接按字母键</span>
                  <span>🖱️ 鼠标: 点击或拖拽任意位置连续演奏</span>
                  <span>📏 白线显示26个音效区域边界</span>
                  <span>⚡ 快捷键: ESC关闭 / F1切换</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 测试按钮 */}
        <div className="absolute bottom-20 right-4 z-20">
          <button
            onClick={async () => {
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
                    playSound(note, x, y);
                  }, index * 200);
                });
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isAudioInitialized ? '🎹 播放音阶' : '🔊 初始化音频'}
          </button>
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
        </div>
      )}
    </div>
  );
}