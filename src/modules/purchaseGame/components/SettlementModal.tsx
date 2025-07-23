'use client';

/**
 * 结算弹窗组件
 */

import React from 'react';
import { SettlementModalProps } from '../types';

export const SettlementModal: React.FC<SettlementModalProps> = ({
  isOpen,
  onClose,
  finalScore,
  totalPurchases,
  gameDuration,
}) => {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  const getScoreLevel = (score: number) => {
    if (score >= 500) return { level: 'S', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (score >= 300) return { level: 'A', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 200) return { level: 'B', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 100) return { level: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'D', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const scoreLevel = getScoreLevel(finalScore);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">游戏结束</h2>
          <p className="text-gray-600">恭喜你完成了购买挑战！</p>
        </div>

        {/* 得分等级 */}
        <div className={`text-center mb-6 p-4 rounded-lg ${scoreLevel.bg}`}>
          <div className={`text-6xl font-bold ${scoreLevel.color} mb-2`}>
            {scoreLevel.level}
          </div>
          <div className={`text-2xl font-bold ${scoreLevel.color}`}>
            {finalScore} 分
          </div>
        </div>

        {/* 游戏统计 */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">总购买次数</span>
            <span className="font-bold text-gray-800">{totalPurchases} 次</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">游戏时长</span>
            <span className="font-bold text-gray-800">{formatTime(gameDuration)}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">平均得分</span>
            <span className="font-bold text-gray-800">
              {totalPurchases > 0 ? Math.round(finalScore / totalPurchases) : 0} 分/次
            </span>
          </div>
        </div>

        {/* 评价 */}
        <div className="text-center mb-6">
          <p className="text-gray-600">
            {finalScore >= 500 && "太棒了！你是购买大师！"}
            {finalScore >= 300 && finalScore < 500 && "很好！你的购买策略很出色！"}
            {finalScore >= 200 && finalScore < 300 && "不错！继续努力！"}
            {finalScore >= 100 && finalScore < 200 && "还可以，下次会更好！"}
            {finalScore < 100 && "加油！多练习会进步的！"}
          </p>
        </div>

        {/* 按钮 */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
          >
            确定
          </button>
        </div>

        {/* 装饰元素 */}
        <div className="absolute top-4 right-4 text-4xl">
          🎉
        </div>
        <div className="absolute bottom-4 left-4 text-4xl">
          🏆
        </div>
      </div>
    </div>
  );
}; 