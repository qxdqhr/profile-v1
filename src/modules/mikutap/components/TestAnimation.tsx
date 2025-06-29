'use client';

import React, { useRef, useEffect } from 'react';

interface TestAnimationProps {
  isTriggered: number; // 动画触发次数，>0 表示需要播放动画
  cellId: string;
  children: React.ReactNode;
  onAnimationEnd?: () => void;
}

export function TestAnimation({ isTriggered, cellId, children, onAnimationEnd }: TestAnimationProps) {
  
  // 判断是否应该显示动画
  const shouldShowAnimation = isTriggered > 0;
  // 记录上一次触发的值，用于检测变化
  const prevTriggeredRef = useRef(isTriggered);
  // 存储多个动画实例的状态
  const [animations, setAnimations] = React.useState<{id: number, timestamp: number}[]>([]);
  
  // 当isTriggered变化时创建新的动画实例
  useEffect(() => {
    // console.log('TestAnimation: useEffect triggered', { isTriggered, prevTriggered: prevTriggeredRef.current, cellId });
    
    // 只有当触发值增加时才添加新动画
    if (isTriggered > prevTriggeredRef.current) {
      const newAnimationId = Date.now();
      // console.log('TestAnimation: Creating new animation', { id: newAnimationId, cellId });
      
      setAnimations(prev => [...prev, { id: newAnimationId, timestamp: Date.now() }]);
      
      // 为新动画设置自动结束定时器
      setTimeout(() => {
        // console.log('TestAnimation: Removing animation', { id: newAnimationId, cellId });
        setAnimations(prev => prev.filter(anim => anim.id !== newAnimationId));
        
        // 如果这是最后一个动画，通知父组件动画结束
        if (onAnimationEnd && animations.length <= 1) {
          onAnimationEnd();
        }
      }, 800);
    }
    
    prevTriggeredRef.current = isTriggered;
  }, [isTriggered, cellId]);

  return (
    <div className="relative w-full h-full">
      {children}
      
      {/* 渲染所有活跃的动画实例 */}
      {animations.map(animation => (
        <div
          key={`animation-${animation.id}`}
          className="absolute inset-0 pointer-events-none z-50"
          style={{
            background: 'linear-gradient(45deg, #8b5cf6, #ec4899, #ef4444)',
            opacity: 0.7,
            animation: 'pulseCustom 800ms ease-out forwards'
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes pulseCustom {
          0% {
            transform: scale(0.8);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.6;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default TestAnimation; 