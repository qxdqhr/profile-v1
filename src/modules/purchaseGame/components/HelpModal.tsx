'use client';

/**
 * 帮助弹窗组件
 */

import React from 'react';

export interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-3 text-3xl">❓</span>
            游戏规则
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* 游戏规则内容 */}
        <div className="space-y-6">
          {/* 基本规则 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">🎮 游戏目标</h3>
            <p className="text-blue-700">
              在30秒倒计时内尽可能多地购买商品，每次购买都会影响你的生命值或源石锭。
              生命值为0时游戏结束，看看你能获得多少积分！
            </p>
          </div>

          {/* 商品类型 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                <span className="mr-2 text-xl">💎</span>
                谋财商品
              </h4>
              <p className="text-yellow-700 text-sm">
                消耗源石锭购买，源石锭越多得分越高。每次购买会扣减相应的源石锭数量。
              </p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                <span className="mr-2 text-xl">💀</span>
                害命商品
              </h4>
              <p className="text-red-700 text-sm">
                消耗生命值购买，生命值越少得分越高。生命值为0时游戏结束！
              </p>
            </div>
          </div>

          {/* 游戏机制 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <span className="mr-2 text-xl">⏰</span>
                时间限制
              </h4>
              <p className="text-green-700 text-sm">
                30秒倒计时，时间到游戏结束。倒计时进度条会显示剩余时间。
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                <span className="mr-2 text-xl">🏆</span>
                得分规则
              </h4>
              <p className="text-purple-700 text-sm">
                根据商品价值和当前状态计算得分。购买次数越多，总积分越高。
              </p>
            </div>
          </div>

          {/* 操作说明 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <span className="mr-2 text-xl">🎯</span>
                操作说明
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-medium mb-1">购买按钮：</p>
                <p>点击购买当前商品，会消耗相应资源并获得积分</p>
              </div>
              <div>
                <p className="font-medium mb-1">不买按钮：</p>
                <p>跳过当前商品，不消耗任何资源，但也不获得积分</p>
              </div>
            </div>
          </div>

          {/* 游戏结束条件 */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
              <span className="mr-2 text-xl">⚠️</span>
                游戏结束条件
            </h4>
            <ul className="text-orange-700 text-sm space-y-1">
              <li>• 生命值降为0</li>
              <li>• 倒计时时间结束</li>
              <li>• 游戏结束后会显示最终得分和统计信息</li>
            </ul>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-center mt-8">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
          >
            知道了
          </button>
        </div>

        {/* 装饰元素 */}
        <div className="absolute top-4 right-4 text-4xl opacity-20">
          🎮
        </div>
        <div className="absolute bottom-4 left-4 text-4xl opacity-20">
          🏆
        </div>
      </div>
    </div>
  );
}; 