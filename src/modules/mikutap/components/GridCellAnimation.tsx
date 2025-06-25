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
  const [isAnimating, setIsAnimating] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  console.log('GridCellAnimation: Component created/rendered', {
    isTriggered,
    animationType,
    hasAnimationData: !!animationData,
    animationConfig,
    isAnimating,
    showOverlay
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
      isAnimating, 
      animationType,
      animationData: !!animationData,
      animationConfig,
      showOverlay 
    });
    if (isTriggered && !isAnimating) {
      console.log('GridCellAnimation: About to trigger animation');
      triggerAnimation();
    } else {
      console.log('GridCellAnimation: Skipping animation trigger', { 
        isTriggered, 
        isAnimating,
        reason: !isTriggered ? 'not triggered' : 'already animating'
      });
    }
  }, [isTriggered]);

  const triggerAnimation = () => {
    if (isAnimating) {
      console.log('GridCellAnimation: Animation already running, skipping');
      return;
    }

    console.log('GridCellAnimation: Triggering animation', { animationType, duration, scale, opacity });
    setIsAnimating(true);
    setShowOverlay(true);

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 设置动画完成的定时器
    timeoutRef.current = setTimeout(() => {
      console.log('GridCellAnimation: Animation completed');
      setIsAnimating(false);
      setShowOverlay(false);
      onAnimationComplete?.();
    }, duration / speed);
  };

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

  const renderOverlayAnimation = () => {
    console.log('GridCellAnimation: renderOverlayAnimation called', { showOverlay, animationType });
    if (!showOverlay) return null;

    // 如果是自定义Lottie动画
    if (animationType === 'custom' && animationData) {
      return (
        <div className="absolute inset-0 pointer-events-none z-10">
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

    // 预设动画覆盖层 - 使用简化的内联样式
    const animationStyle = {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none' as const,
      zIndex: 10,
      backgroundColor: 'rgba(255, 255, 0, 0.8)', // 明显的黄色用于测试
      borderRadius: '8px',
      border: '3px solid red', // 明显的红色边框用于测试
      animation: `pulse-test ${duration}ms ease-out`,
      transform: `scale(${scale})`,
      opacity: opacity
    };

    return (
      <>
        <div
          ref={overlayRef}
          style={animationStyle}
        />
        
        {/* 内联CSS动画定义 */}
        <style jsx>{`
          @keyframes pulse-test {
            0% { 
              transform: scale(1); 
              background-color: rgba(255, 255, 0, 0.3);
              border-color: yellow;
            }
            50% { 
              transform: scale(1.2); 
              background-color: rgba(255, 0, 0, 0.8);
              border-color: red;
            }
            100% { 
              transform: scale(1); 
              background-color: rgba(0, 255, 0, 0.3);
              border-color: green;
            }
          }
        `}</style>
      </>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* 原始内容 */}
      <div className={isAnimating && animationType !== 'custom' ? getCSSAnimationClass() : ''} style={getAnimationStyle()}>
        {children}
      </div>

      {/* 动画覆盖层 */}
      {renderOverlayAnimation()}


    </div>
  );
}

export default GridCellAnimation; 