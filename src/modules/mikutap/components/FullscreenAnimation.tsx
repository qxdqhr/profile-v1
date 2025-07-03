'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Lottie from 'lottie-react';
import { GridCell } from '../types';

interface FullscreenAnimationProps {
  isTriggered: number; // 动画触发次数，>0 表示需要播放动画
  cell: GridCell | null; // 触发动画的单元格
  onAnimationEnd?: () => void;
}

// 动画实例类型
interface AnimationInstance {
  id: string; // 使用字符串ID确保唯一性
  cell: GridCell;
  position: {x: number, y: number};
  size: number;
  animationData: any;
  createdAt: number; // 创建时间戳
  duration: number; // 动画持续时间
  completed: boolean; // 标记动画是否已完成
}

// 动画类型映射 - 将按钮动效类型映射到lottie动画文件
const ANIMATION_TYPE_MAPPING: Record<string, string> = {
  // 直接对应的动画
  'explosion': 'explosion',
  'vortex': 'vortex', 
  'lightning': 'lightning',
  'rainbow': 'rainbow',
  'wave': 'wave',
  'custom': 'fx', // custom使用fx效果
  
  // 按钮动效映射到音效类型的动画
  'pulse': 'piano',      // 脉冲 -> 钢琴动画
  'slide': 'synth',      // 滑动 -> 合成器动画  
  'bounce': 'drum',      // 弹跳 -> 鼓点动画
  'flash': 'lightning',  // 闪烁 -> 闪电动画
  'spin': 'vortex',      // 旋转 -> 漩涡动画
  'scale': 'bass',       // 缩放 -> 低音动画
  'ripple': 'wave',      // 涟漪 -> 波纹动画
  
  // 音效类型保持映射
  'piano': 'piano',
  'drum': 'drum', 
  'synth': 'synth',
  'bass': 'bass',
  'lead': 'lead',
  'pad': 'pad',
  'fx': 'fx',
  'vocal': 'vocal'
};

// 加载动画数据
const loadAnimationData = async (type: string) => {
  try {
    // 动态导入动画数据
    const response = await fetch(`/mikutap/animations/animations.json`);
    const animations = await response.json();
    
    // 使用映射表获取实际的动画文件名
    const mappedType = ANIMATION_TYPE_MAPPING[type] || 'piano';
    
    // 检查映射后的动画类型是否存在
    if (animations[mappedType]) {
      console.log(`🎬 按钮动效类型 "${type}" 映射到 Lottie动画 "${mappedType}"`);
      return animations[mappedType];
    }
    
    // 如果找不到对应类型，返回默认的piano动画
    console.log(`找不到动画类型: ${mappedType}，使用默认piano动画`);
    return animations.piano;
  } catch (error) {
    console.error('Failed to load animation data:', error);
    // 返回一个简单的默认动画
    return {
      v: "5.5.7",
      fr: 60,
      ip: 0,
      op: 30,
      w: 100,
      h: 100,
      nm: "Default Animation",
      ddd: 0,
      assets: [],
      layers: [
        {
          ddd: 0,
          ind: 1,
          ty: 4,
          nm: "Shape Layer",
          sr: 1,
          ks: {
            o: { a: 0, k: 100 },
            r: { a: 0, k: 0 },
            p: { a: 0, k: [50, 50, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: {
              a: 1,
              k: [
                { i: { x: [0.42], y: [1] }, "o": { "x": [0.58], "y": [0] }, "t": 0, "s": [100, 100, 100] },
                { i: { x: [0.42], y: [1] }, "o": { "x": [0.58], "y": [0] }, "t": 15, "s": [150, 150, 100] },
                { "t": 30, "s": [100, 100, 100] }
              ]
            }
          },
          ao: 0,
          shapes: [
            {
              ty: "gr",
              it: [
                {
                  ty: "rc",
                  d: 1,
                  s: { a: 0, k: [50, 50] },
                  p: { a: 0, k: [0, 0] },
                  r: { a: 0, k: 8 }
                },
                {
                  ty: "fl",
                  c: { a: 0, k: [0.3, 0.7, 1, 1] },
                  o: { a: 0, k: 100 }
                },
                {
                  ty: "tr",
                  p: { a: 0, k: [0, 0] },
                  a: { a: 0, k: [0, 0] },
                  s: { a: 0, k: [100, 100] },
                  r: { a: 0, k: 0 },
                  o: { a: 0, k: 100 }
                }
              ]
            }
          ],
          ip: 0,
          op: 30,
          st: 0,
          bm: 0
        }
      ]
    };
  }
};

// 将HEX颜色转换为RGB数组 (0-1范围)
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
    1
  ] : [0.5, 0.5, 0.5, 1];
};

// 修改动画颜色
const modifyAnimationColor = (animation: any, color: number[]) => {
  try {
    // 创建动画的深拷贝
    const modifiedAnimation = JSON.parse(JSON.stringify(animation));
    
    // 查找并修改填充颜色
    modifiedAnimation.layers.forEach((layer: any) => {
      if (layer.shapes) {
        layer.shapes.forEach((shape: any) => {
          if (shape.it) {
            shape.it.forEach((item: any) => {
              if (item.ty === 'fl' || item.ty === 'st') {
                item.c.k = color;
              }
            });
          }
        });
      }
    });
    
    return modifiedAnimation;
  } catch (e) {
    console.error('Error modifying animation color:', e);
    return animation;
  }
};

// 动画数据缓存
const animationCache: Record<string, any> = {};

// 获取动画持续时间（毫秒）
const getAnimationDuration = (animData: any): number => {
  try {
    // Lottie 动画的持续时间 = op / fr * 1000
    const frames = animData.op || 60;
    const frameRate = animData.fr || 60;
    return Math.ceil((frames / frameRate) * 1000) + 300; // 添加300ms缓冲
  } catch (e) {
    return 1500; // 默认1.5秒
  }
};

// 生成唯一ID
const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
};

// 最大同时存在的动画实例数
const MAX_ANIMATIONS = 30;
// 动画组批次大小
const BATCH_SIZE = 3;

export function FullscreenAnimation({ isTriggered, cell, onAnimationEnd }: FullscreenAnimationProps) {
  // 记录上一次触发的值，用于检测变化
  const prevTriggeredRef = useRef(isTriggered);
  // 存储动画批次的状态，每次触发创建一个批次
  const [animationBatches, setAnimationBatches] = useState<{
    batchId: string,
    animations: AnimationInstance[],
    expiresAt: number
  }[]>([]);
  // 记录当前正在播放的动画总数
  const [totalAnimationCount, setTotalAnimationCount] = useState(0);
  // 全局定时器引用
  const timersRef = useRef<{[key: string]: NodeJS.Timeout}>({});
  // 动画加载状态
  const [isLoading, setIsLoading] = useState(false);
  
  // 清理定时器
  const clearTimers = useCallback(() => {
    Object.values(timersRef.current).forEach(timer => clearTimeout(timer));
    timersRef.current = {};
  }, []);
  
  // 组件卸载时清理所有资源
  useEffect(() => {
    return () => {
      clearTimers();
      setAnimationBatches([]);
    };
  }, [clearTimers]);
  
  // 添加一个定期清理机制，每秒检查一次过期的批次
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setAnimationBatches(prev => {
        const newBatches = prev.filter(batch => now < batch.expiresAt);
        if (newBatches.length !== prev.length) {
          console.log(`清理了 ${prev.length - newBatches.length} 个过期批次，剩余 ${newBatches.length} 个批次`);
        }
        return newBatches;
      });
      
      // 更新总动画数
      updateTotalCount();
    }, 1000);
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
  // 更新总动画数
  const updateTotalCount = useCallback(() => {
    const count = animationBatches.reduce((sum, batch) => sum + batch.animations.length, 0);
    setTotalAnimationCount(count);
  }, [animationBatches]);
  
  // 当批次数量变化时更新总动画数
  useEffect(() => {
    updateTotalCount();
  }, [animationBatches, updateTotalCount]);
  
  // 强制清理所有动画
  const forceCleanupAllAnimations = useCallback(() => {
    clearTimers();
    setAnimationBatches([]);
    console.log('强制清理了所有动画');
  }, [clearTimers]);
  
  // 键盘事件监听，用于强制清理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 按下ESC键时强制清理所有动画
      if (e.key === 'Escape') {
        forceCleanupAllAnimations();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [forceCleanupAllAnimations]);
  
  // 当isTriggered变化时创建新的动画实例
  useEffect(() => {
    // 只有当触发值增加且有有效的单元格时才添加新动画
    if (isTriggered > prevTriggeredRef.current && cell && !isLoading) {
      setIsLoading(true);
      
      // 创建新的动画批次
      const createAnimationBatch = async () => {
        try {
          // 生成批次ID
          const batchId = generateUniqueId();
          
          // 优先使用背景动画类型，否则使用按钮动画类型
          let animationType: string;
          if (cell.backgroundAnimationEnabled && 
              cell.backgroundAnimationType && 
              cell.backgroundAnimationType !== 'none') {
            animationType = cell.backgroundAnimationType;
            console.log(`🎭 使用配置的背景动画类型: ${animationType}`);
          } else if (cell.animationType) {
            // 使用按钮动效的类型作为背景动效
            animationType = cell.animationType;
            console.log(`🎭 使用按钮动效类型作为背景动效: ${animationType}`);
          } else {
            // 最后fallback到默认的pulse动画
            animationType = 'pulse';
            console.log(`🎭 使用默认动画类型: ${animationType}`);
          }
          
          // 决定颜色覆盖
          const effectiveColor = (cell.backgroundAnimationConfig?.colorOverride) || cell.color;
          const cacheKey = `${animationType}_${effectiveColor}`;
          
          // 检查缓存中是否已有该动画
          if (!animationCache[cacheKey]) {
            // 加载动画数据
            const baseAnimation = await loadAnimationData(animationType);
            // 修改颜色
            const coloredAnimation = modifyAnimationColor(baseAnimation, hexToRgb(effectiveColor));
            // 存入缓存
            animationCache[cacheKey] = coloredAnimation;
          }
          
          // 从缓存获取动画数据
          const animationData = animationCache[cacheKey];
          // 计算动画持续时间
          const duration = getAnimationDuration(animationData);
          
          // 创建新的动画实例
          const newAnimations: AnimationInstance[] = [];
          for (let i = 0; i < BATCH_SIZE; i++) {
            // 随机生成动画起始位置
            const position = {
              x: 10 + Math.random() * 80, // 随机X位置（10%-90%范围内）
              y: 10 + Math.random() * 80  // 随机Y位置（10%-90%范围内）
            };
            
            // 随机大小
            const size = 150 + Math.random() * 200; // 随机大小，150-350px
            
            newAnimations.push({ 
              id: generateUniqueId(), 
              cell, 
              position, 
              size, 
              animationData,
              createdAt: Date.now(),
              duration,
              completed: false
            });
          }
          
          // 计算批次过期时间
          const expiresAt = Date.now() + duration + 500; // 添加500ms缓冲
          
          // 添加新批次到状态
          setAnimationBatches(prev => {
            // 如果已有太多批次，移除最旧的
            let updatedBatches = [...prev];
            if (updatedBatches.length >= MAX_ANIMATIONS / BATCH_SIZE) {
              updatedBatches = updatedBatches.slice(-Math.floor(MAX_ANIMATIONS / BATCH_SIZE) + 1);
            }
            
            return [...updatedBatches, { batchId, animations: newAnimations, expiresAt }];
          });
          
          // 设置自动清理定时器
          timersRef.current[batchId] = setTimeout(() => {
            // 移除这个批次
            setAnimationBatches(prev => prev.filter(batch => batch.batchId !== batchId));
            // 清理定时器引用
            delete timersRef.current[batchId];
            
            console.log(`批次 ${batchId} 已过期并被清理`);
          }, duration + 500);
          
          // 通知父组件动画结束
          setTimeout(() => {
            if (onAnimationEnd) {
              onAnimationEnd();
            }
          }, duration);
          
        } catch (error) {
          console.error('创建动画批次时出错:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      createAnimationBatch();
    }
    
    prevTriggeredRef.current = isTriggered;
  }, [isTriggered, cell, onAnimationEnd, isLoading]);

  // 标记动画完成
  const handleAnimationComplete = useCallback((batchId: string, animId: string) => {
    setAnimationBatches(prev => 
      prev.map(batch => {
        if (batch.batchId !== batchId) return batch;
        
        return {
          ...batch,
          animations: batch.animations.map(anim => 
            anim.id === animId ? { ...anim, completed: true } : anim
          )
        };
      })
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* 渲染所有批次的动画 */}
      {animationBatches.map(batch => (
        <React.Fragment key={`batch-${batch.batchId}`}>
          {batch.animations.map(animation => (
            <div
              key={`animation-${animation.id}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${animation.position.x}%`,
                top: `${animation.position.y}%`,
                width: `${animation.size}px`,
                height: `${animation.size}px`,
                transform: 'translate(-50%, -50%)',
                opacity: animation.completed ? 0 : 1,
                transition: 'opacity 0.2s ease-out'
              }}
            >
              <Lottie
                animationData={animation.animationData}
                loop={false}
                autoplay={true}
                style={{
                  width: '100%',
                  height: '100%',
                  mixBlendMode: 'screen',
                }}
                onComplete={() => handleAnimationComplete(batch.batchId, animation.id)}
              />
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

export default FullscreenAnimation; 