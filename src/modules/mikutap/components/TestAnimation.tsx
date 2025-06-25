'use client';

import React from 'react';

interface TestAnimationProps {
  isTriggered: number; // 动画触发次数，>0 表示需要播放动画
  cellId: string;
  children: React.ReactNode;
  onAnimationEnd?: () => void;
}

export function TestAnimation({ isTriggered, cellId, children, onAnimationEnd }: TestAnimationProps) {
  console.log('TestAnimation: Component rendered', { isTriggered, cellId });
  
  // 判断是否应该显示动画
  const shouldShowAnimation = isTriggered > 0;
  
  React.useEffect(() => {
    console.log('TestAnimation: useEffect triggered', { isTriggered, cellId, shouldShowAnimation });
    
    if (shouldShowAnimation && onAnimationEnd) {
      // 800ms后自动结束动画，但只在当前触发状态下执行
      const timer = setTimeout(() => {
        console.log('TestAnimation: Auto ending animation for', cellId);
        onAnimationEnd();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [shouldShowAnimation, cellId, onAnimationEnd]);

  return (
    <div className="relative w-full h-full">
      {children}
      {shouldShowAnimation && (
        <div
          key={`animation-${isTriggered}`} // 使用次数作为key确保每次都是新动画
          className="absolute inset-0 pointer-events-none z-50"
          style={{
            background: 'linear-gradient(45deg, #8b5cf6, #ec4899, #ef4444)',
            opacity: 0.7,
            animation: 'pulseCustom 800ms ease-out forwards'
          }}
        />
      )}
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