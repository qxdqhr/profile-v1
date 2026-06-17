/**
 * 倒计时进度条组件
 */

import React from 'react';
import { CountdownBarProps } from '../types';

export const CountdownBar: React.FC<CountdownBarProps> = ({
  timeRemaining,
  totalTime,
  isActive,
}) => {
  const progress = (timeRemaining / totalTime) * 100;
  
  // 根据剩余时间计算颜色
  const getProgressColor = () => {
    if (progress > 60) return 'bg-green-500';
    if (progress > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 mb-6 relative overflow-hidden">
      {/* 背景进度条 */}
      <div 
        className={`h-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
        style={{ width: `${progress}%` }}
      />
      
      {/* 时间显示 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold text-sm drop-shadow-lg">
          {formatTime(timeRemaining)}
        </span>
      </div>
      
      {/* 闪烁效果（最后10秒） */}
      {timeRemaining <= 10 && isActive && (
        <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
      )}
      
      {/* 进度条动画效果 */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
      )}
    </div>
  );
}; 