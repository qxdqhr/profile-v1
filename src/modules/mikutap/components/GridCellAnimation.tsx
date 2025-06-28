'use client';

import React, { useState, useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import { AnimationType, AnimationConfig } from '../types';
import styles from './GridCellAnimation.module.css';

interface GridCellAnimationProps {
  isTriggered: boolean;
  animationType: AnimationType;
  animationData?: any; // Lottie JSON数据
  animationConfig?: AnimationConfig;
  children: React.ReactNode;
  onAnimationComplete?: () => void;
}

// 预设动画数据
const PRESET_ANIMATIONS = {
  pulse: {
    v: "5.5.7",
    fr: 60,
    ip: 0,
    op: 30,
    w: 100,
    h: 100,
    nm: "Pulse",
    ddd: 0,
    assets: [],
    layers: [{
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
            { i: { x: [0.42], y: [1] }, o: { x: [0.58], y: [0] }, t: 0, s: [100, 100, 100] },
            { i: { x: [0.42], y: [1] }, o: { x: [0.58], y: [0] }, t: 15, s: [120, 120, 100] },
            { t: 30, s: [100, 100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [{
        ty: "gr",
        it: [{
          ty: "rc",
          d: 1,
          s: { a: 0, k: [50, 50] },
          p: { a: 0, k: [0, 0] },
          r: { a: 0, k: 8 }
        }, {
          ty: "fl",
          c: { a: 0, k: [1, 1, 1, 1] },
          o: { a: 0, k: 100 }
        }, {
          ty: "tr",
          p: { a: 0, k: [0, 0] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          r: { a: 0, k: 0 },
          o: { a: 0, k: 100 }
        }]
      }],
      ip: 0,
      op: 30,
      st: 0,
      bm: 0
    }]
  }
};

export function GridCellAnimation({
  isTriggered,
  animationType,
  animationData,
  animationConfig = {},
  children,
  onAnimationComplete
}: GridCellAnimationProps) {
  // 存储多个动画实例
  const [animations, setAnimations] = useState<{id: number, timestamp: number}[]>([]);
  const lastTriggeredTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<{[key: number]: NodeJS.Timeout}>({});

  console.log('GridCellAnimation: Component created/rendered', {
    isTriggered,
    animationType,
    hasAnimationData: !!animationData,
    animationConfig,
    animationsCount: animations.length
  });

  const {
    duration = 500,
    speed = 1,
    scale = 1.2,
    opacity = 0.8,
    direction = 'up',
    loop = false,
    autoplay = false,
    offset = { x: 0, y: 0 }
  } = animationConfig;

  useEffect(() => {
    console.log('GridCellAnimation: useEffect triggered', { 
      isTriggered, 
      animationType,
      animationData: !!animationData,
      animationConfig
    });
    
    if (isTriggered) {
      console.log('GridCellAnimation: About to trigger animation');
      triggerAnimation();
    }
  }, [isTriggered]);

  const triggerAnimation = () => {
    const now = Date.now();
    // 即使上次动画还在进行中，也创建新的动画实例
    const animationId = now;
    console.log('GridCellAnimation: Triggering new animation', { animationId, animationType, duration, scale, opacity });
    
    // 添加新的动画实例
    setAnimations(prev => [...prev, { id: animationId, timestamp: now }]);
    lastTriggeredTimeRef.current = now;

    // 设置动画完成的定时器
    timeoutsRef.current[animationId] = setTimeout(() => {
      console.log('GridCellAnimation: Animation completed', { animationId });
      // 移除此动画实例
      setAnimations(prev => prev.filter(a => a.id !== animationId));
      delete timeoutsRef.current[animationId];
      
      // 如果这是最后一个动画，通知完成
      if (animations.length <= 1 && onAnimationComplete) {
        onAnimationComplete();
      }
    }, duration / speed);
  };

  // 组件卸载时清理所有定时器
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const getCSSAnimationClass = () => {
    const baseClasses = [styles.animation];
    console.log('GridCellAnimation: getCSSAnimationClass called with', { animationType, styles });
    
    // 如果没有动画类型，使用默认的pulse动画
    const effectiveAnimationType = animationType || 'pulse';
    
    switch (effectiveAnimationType) {
      case 'pulse':
        baseClasses.push(styles.pulse);
        break;
      case 'slide':
        switch (direction) {
          case 'up':
            baseClasses.push(styles.slideUp);
            break;
          case 'down':
            baseClasses.push(styles.slideDown);
            break;
          case 'left':
            baseClasses.push(styles.slideLeft);
            break;
          case 'right':
            baseClasses.push(styles.slideRight);
            break;
          default:
            baseClasses.push(styles.slideUp);
        }
        break;
      case 'bounce':
        baseClasses.push(styles.bounce);
        break;
      case 'flash':
        baseClasses.push(styles.flash);
        break;
      case 'spin':
        baseClasses.push(styles.spin);
        break;
      case 'scale':
        baseClasses.push(styles.scale);
        break;
      case 'ripple':
        baseClasses.push(styles.ripple);
        break;
      case 'explosion':
        baseClasses.push(styles.explosion);
        break;
      case 'vortex':
        baseClasses.push(styles.vortex);
        break;
      case 'lightning':
        baseClasses.push(styles.lightning);
        break;
      case 'rainbow':
        baseClasses.push(styles.rainbow);
        break;
      case 'wave':
        baseClasses.push(styles.wave);
        break;
      default:
        // 如果没有匹配的动画类型，使用pulse作为后备
        baseClasses.push(styles.pulse);
        break;
    }
    
    const finalClass = baseClasses.join(' ');
    console.log('GridCellAnimation: Final animation class:', finalClass);
    return finalClass;
  };

  const getAnimationStyle = () => {
    return {
      '--animation-duration': `${duration}ms`,
      '--animation-speed': speed,
      '--animation-scale': scale,
      '--animation-opacity': opacity,
      '--animation-offset-x': `${offset.x}px`,
      '--animation-offset-y': `${offset.y}px`,
      animationDuration: `${duration}ms`,
    } as React.CSSProperties;
  };

  const renderAnimations = () => {
    return animations.map(animation => {
      // 自定义Lottie动画
      if (animationType === 'custom' && animationData) {
        return (
          <div 
            key={`lottie-animation-${animation.id}`} 
            className="absolute inset-0 pointer-events-none z-10"
          >
            <Lottie
              animationData={animationData}
              loop={loop}
              autoplay={true}
              style={{
                width: '100%',
                height: '100%',
                opacity,
                transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          </div>
        );
      }

      // CSS动画
      return (
        <div 
          key={`css-animation-${animation.id}`}
          className={getCSSAnimationClass()}
          style={getAnimationStyle()}
        >
          {/* 动画内容 */}
          <div className="absolute inset-0 bg-white bg-opacity-30 rounded-lg" />
        </div>
      );
    });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* 原始内容 */}
      <div>
        {children}
      </div>

      {/* 动画层 */}
      {renderAnimations()}
    </div>
  );
}

export default GridCellAnimation; 
