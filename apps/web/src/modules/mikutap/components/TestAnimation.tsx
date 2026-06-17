'use client';

import React, { useRef, useEffect } from 'react';
import { AnimationType, AnimationConfig } from '../types';

interface TestAnimationProps {
  isTriggered: number; // 动画触发次数，>0 表示需要播放动画
  cellId: string;
  children: React.ReactNode;
  onAnimationEnd?: () => void;
  // 新增动画配置参数
  animationEnabled?: boolean;
  animationType?: AnimationType;
  animationConfig?: AnimationConfig;
  cellColor?: string;
  // 新增音效类型参数，用于显示对应的背景形状
  soundType?: string;
}

export function TestAnimation({ 
  isTriggered, 
  cellId, 
  children, 
  onAnimationEnd,
  animationEnabled = true,
  animationType = 'pulse',
  animationConfig = {
    duration: 500,
    speed: 1,
    scale: 1.2,
    opacity: 0.8,
    direction: 'up',
    loop: false,
    autoplay: false,
    offset: { x: 0, y: 0 }
  },
  cellColor = '#8b5cf6',
  soundType = 'piano'
}: TestAnimationProps) {
  
  // 如果动画被禁用，则不显示动画效果
  if (!animationEnabled) {
    return <div className="relative w-full h-full">{children}</div>;
  }

  // 记录上一次触发的值，用于检测变化
  const prevTriggeredRef = useRef(isTriggered);
  // 存储多个动画实例的状态
  const [animations, setAnimations] = React.useState<{id: number, timestamp: number}[]>([]);
  
  // 当isTriggered变化时创建新的动画实例
  useEffect(() => {
    // 只有当触发值增加时才添加新动画
    if (isTriggered > prevTriggeredRef.current) {
      const newAnimationId = Date.now();
      
      setAnimations(prev => [...prev, { id: newAnimationId, timestamp: Date.now() }]);
      
      // 根据配置的持续时间设置动画结束定时器
      const duration = animationConfig.duration || 500;
      setTimeout(() => {
        setAnimations(prev => prev.filter(anim => anim.id !== newAnimationId));
        
        // 如果这是最后一个动画，通知父组件动画结束
        if (onAnimationEnd && animations.length <= 1) {
          onAnimationEnd();
        }
      }, duration);
    }
    
    prevTriggeredRef.current = isTriggered;
  }, [isTriggered, cellId, animationConfig.duration, onAnimationEnd, animations.length]);

  // 根据音效类型生成对应的背景形状
  const getBackgroundShape = (soundType: string, color: string, animationId: number) => {
    const duration = animationConfig.duration || 500;
    const scale = animationConfig.scale || 1.2;
    
    switch (soundType) {
      case 'piano':
        // 钢琴 - 多个方块
        return (
          <div key={`piano-${animationId}`} className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={`square-${i}`}
                className="absolute"
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: color,
                  borderRadius: '4px',
                  left: `${20 + i * 12}%`,
                  top: `${30 + (i % 2) * 20}%`,
                  opacity: 0.8,
                  animation: `pianoSquare${i} ${duration}ms ease-out forwards`,
                  boxShadow: `0 0 15px ${color}`
                }}
              />
            ))}
            <style jsx>{`
              ${[...Array(6)].map(
                (_, i) => `
                @keyframes pianoSquare${i} {
                  0% { 
                    transform: scale(0) rotate(0deg); 
                    opacity: 0.9; 
                  }
                  50% { 
                    transform: scale(${scale}) rotate(${45 + i * 15}deg); 
                    opacity: 0.7; 
                  }
                  100% { 
                    transform: scale(1.2) rotate(${90 + i * 15}deg); 
                    opacity: 0; 
                  }
                }
              `
              ).join('')}
            `}</style>
          </div>
        );

      case 'drum':
        // 鼓 - 扩散圆形
        return (
          <div key={`drum-${animationId}`} className="absolute inset-0 flex items-center justify-center">
            {[...Array(4)].map((_, i) => (
              <div
                key={`circle-${i}`}
                className="absolute rounded-full border-4"
                style={{
                  width: `${30 + i * 15}px`,
                  height: `${30 + i * 15}px`,
                  borderColor: color,
                  backgroundColor: i === 0 ? color : 'transparent',
                  opacity: 0.8 - i * 0.15,
                  animation: `drumCircle${i} ${duration}ms ease-out forwards`,
                  animationDelay: `${i * 100}ms`
                }}
              />
            ))}
            <style jsx>{`
              ${[...Array(4)].map(
                (_, i) => `
                @keyframes drumCircle${i} {
                  0% { 
                    transform: scale(0.2); 
                    opacity: ${0.9 - i * 0.1}; 
                  }
                  50% { 
                    transform: scale(${1.5 + i * 0.3}); 
                    opacity: ${0.6 - i * 0.1}; 
                  }
                  100% { 
                    transform: scale(${2.5 + i * 0.5}); 
                    opacity: 0; 
                  }
                }
              `
              ).join('')}
            `}</style>
          </div>
        );

      case 'synth':
      case 'fx':
        // 合成器/效果器 - 旋转星星
        return (
          <div key={`synth-${animationId}`} className="absolute inset-0 flex items-center justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={`star-${i}`}
                className="absolute"
                style={{
                  width: `${25 + i * 10}px`,
                  height: `${25 + i * 10}px`,
                  animation: `synthStar${i} ${duration}ms ease-out forwards`,
                  animationDelay: `${i * 150}ms`
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                  fill={color}
                  style={{
                    filter: `drop-shadow(0 0 8px ${color})`,
                    opacity: 0.8 - i * 0.2
                  }}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            ))}
            <style jsx>{`
              ${[...Array(3)].map(
                (_, i) => `
                @keyframes synthStar${i} {
                  0% { 
                    transform: scale(0) rotate(0deg); 
                    opacity: ${0.9 - i * 0.15}; 
                  }
                  50% { 
                    transform: scale(${1.2 + i * 0.3}) rotate(${180 + i * 60}deg); 
                    opacity: ${0.7 - i * 0.1}; 
                  }
                  100% { 
                    transform: scale(${0.8 + i * 0.2}) rotate(${360 + i * 60}deg); 
                    opacity: 0; 
                  }
                }
              `
              ).join('')}
            `}</style>
          </div>
        );

      default:
        // 默认 - 简单脉冲效果
        return (
          <div
            key={`default-${animationId}`}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle, ${color}80, ${color}40, transparent)`,
              opacity: animationConfig.opacity || 0.8,
              animation: `defaultPulse ${duration}ms ease-out forwards`
            }}
          />
        );
    }
  };

  // 根据动画类型生成CSS动画
  const getAnimationStyle = (animationType: AnimationType, config: AnimationConfig) => {
    const duration = config.duration || 500;
    const scale = config.scale || 1.2;
    const opacity = config.opacity || 0.8;
    const direction = config.direction || 'up';

    switch (animationType) {
      case 'pulse':
        return {
          animation: `pulseEffect ${duration}ms ease-out forwards`
        };
      
      case 'bounce':
        return {
          animation: `bounceEffect ${duration}ms ease-out forwards`
        };
      
      case 'flash':
        return {
          animation: `flashEffect ${duration}ms ease-out forwards`
        };
      
      case 'spin':
        return {
          animation: `spinEffect ${duration}ms ease-out forwards`
        };
      
      case 'scale':
        return {
          animation: `scaleEffect ${duration}ms ease-out forwards`
        };
      
      case 'slide':
        const slideDirection = direction === 'up' ? 'translateY(-20px)' :
                             direction === 'down' ? 'translateY(20px)' :
                             direction === 'left' ? 'translateX(-20px)' :
                             direction === 'right' ? 'translateX(20px)' : 'translateY(-20px)';
        return {
          animation: `slideEffect-${direction} ${duration}ms ease-out forwards`
        };
      
      case 'ripple':
        return {
          animation: `rippleEffect ${duration}ms ease-out forwards`
        };
      
      case 'explosion':
        return {
          animation: `explosionEffect ${duration}ms ease-out forwards`
        };
      
      case 'vortex':
        return {
          animation: `vortexEffect ${duration}ms ease-out forwards`
        };
      
      case 'lightning':
        return {
          animation: `lightningEffect ${duration}ms ease-out forwards`
        };
      
      case 'rainbow':
        return {
          animation: `rainbowEffect ${duration}ms ease-out forwards`
        };
      
      case 'wave':
        return {
          animation: `waveEffect ${duration}ms ease-out forwards`
        };
      
      default:
        return {
          animation: `pulseEffect ${duration}ms ease-out forwards`
        };
    }
  };

  // 根据单元格颜色生成渐变背景
  const getBackgroundStyle = (baseColor: string) => {
    // 如果是彩虹效果，使用多彩渐变
    if (animationType === 'rainbow') {
      return 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)';
    }
    
    // 其他效果使用基于单元格颜色的渐变
    return `linear-gradient(45deg, ${baseColor}, ${baseColor}80, ${baseColor}40)`;
  };

  return (
    <div className="relative w-full h-full">
      {children}
      
      {/* 渲染所有活跃的背景形状动画实例 */}
      {animations.map(animation => (
        <div
          key={`bg-shape-${animation.id}`}
          className="absolute inset-0 pointer-events-none z-50"
        >
          {getBackgroundShape(soundType, cellColor, animation.id)}
        </div>
      ))}
      
      {/* 保留原有的动画效果作为备选 */}
      {animations.map(animation => (
        <div
          key={`animation-${animation.id}`}
          className="absolute inset-0 pointer-events-none z-40 opacity-30"
          style={{
            background: getBackgroundStyle(cellColor),
            opacity: (animationConfig.opacity || 0.8) * 0.3,
            ...getAnimationStyle(animationType, animationConfig)
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes defaultPulse {
          0% { transform: scale(0.8); opacity: 0.9; }
          50% { transform: scale(1.4); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        
        @keyframes pulseEffect {
          0% { transform: scale(0.8); opacity: 0.9; }
          50% { transform: scale(${animationConfig.scale || 1.2}); opacity: 0.6; }
          100% { transform: scale(1); opacity: 0; }
        }
        
        @keyframes bounceEffect {
          0% { transform: translateY(0) scale(1); opacity: 0.9; }
          25% { transform: translateY(-10px) scale(1.1); opacity: 0.8; }
          50% { transform: translateY(0) scale(${animationConfig.scale || 1.2}); opacity: 0.6; }
          75% { transform: translateY(-5px) scale(1.05); opacity: 0.4; }
          100% { transform: translateY(0) scale(1); opacity: 0; }
        }
        
        @keyframes flashEffect {
          0% { opacity: 0; }
          20% { opacity: 0.9; }
          40% { opacity: 0.3; }
          60% { opacity: 0.8; }
          80% { opacity: 0.2; }
          100% { opacity: 0; }
        }
        
        @keyframes spinEffect {
          0% { transform: rotate(0deg) scale(0.8); opacity: 0.9; }
          50% { transform: rotate(180deg) scale(${animationConfig.scale || 1.2}); opacity: 0.6; }
          100% { transform: rotate(360deg) scale(1); opacity: 0; }
        }
        
        @keyframes scaleEffect {
          0% { transform: scale(0); opacity: 0.9; }
          50% { transform: scale(${animationConfig.scale || 1.2}); opacity: 0.6; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        
        @keyframes slideEffect-up {
          0% { transform: translateY(0) scale(1); opacity: 0.9; }
          100% { transform: translateY(-30px) scale(1.1); opacity: 0; }
        }
        
        @keyframes slideEffect-down {
          0% { transform: translateY(0) scale(1); opacity: 0.9; }
          100% { transform: translateY(30px) scale(1.1); opacity: 0; }
        }
        
        @keyframes slideEffect-left {
          0% { transform: translateX(0) scale(1); opacity: 0.9; }
          100% { transform: translateX(-30px) scale(1.1); opacity: 0; }
        }
        
        @keyframes slideEffect-right {
          0% { transform: translateX(0) scale(1); opacity: 0.9; }
          100% { transform: translateX(30px) scale(1.1); opacity: 0; }
        }
        
        @keyframes rippleEffect {
          0% { transform: scale(0.5); opacity: 0.9; border-radius: 50%; }
          50% { transform: scale(${animationConfig.scale || 1.2}); opacity: 0.6; border-radius: 20%; }
          100% { transform: scale(2); opacity: 0; border-radius: 0%; }
        }
        
        @keyframes explosionEffect {
          0% { transform: scale(0.2); opacity: 1; }
          30% { transform: scale(${animationConfig.scale || 1.2}); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
        
        @keyframes vortexEffect {
          0% { transform: rotate(0deg) scale(1); opacity: 0.9; }
          50% { transform: rotate(360deg) scale(${animationConfig.scale || 1.2}); opacity: 0.6; }
          100% { transform: rotate(720deg) scale(0.3); opacity: 0; }
        }
        
        @keyframes lightningEffect {
          0%, 90%, 100% { opacity: 0; }
          5%, 15%, 25%, 35% { opacity: 0.9; transform: scale(${animationConfig.scale || 1.2}); }
          10%, 20%, 30% { opacity: 0.3; transform: scale(1); }
        }
        
        @keyframes rainbowEffect {
          0% { opacity: 0.9; filter: hue-rotate(0deg); }
          50% { opacity: 0.6; filter: hue-rotate(180deg); }
          100% { opacity: 0; filter: hue-rotate(360deg); }
        }
        
        @keyframes waveEffect {
          0% { transform: scale(1) rotateX(0deg); opacity: 0.9; }
          50% { transform: scale(${animationConfig.scale || 1.2}) rotateX(180deg); opacity: 0.6; }
          100% { transform: scale(1) rotateX(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default TestAnimation; 