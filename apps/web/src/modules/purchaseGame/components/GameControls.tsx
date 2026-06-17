'use client';

/**
 * 游戏控制按钮组件
 */

import React, { useState } from 'react';
import { GameControlsProps } from '../types';
import { ProductType } from '../types';

export const GameControls: React.FC<GameControlsProps> = ({
  onPurchase,
  onSkip,
  disabled,
  currentProduct,
  currentLife,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePurchase = () => {
    if (disabled || !currentProduct) return;
    
    setIsAnimating(true);
    onPurchase();
    
    // 重置动画状态
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleSkip = () => {
    if (disabled) return;
    onSkip();
  };

  const isMoneyType = currentProduct?.type === ProductType.MONEY;

  return (
    <div className="w-full flex flex-col items-center">
      {/* 按钮容器 - 水平居中 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
        {/* 购买按钮 */}
        <button
          onClick={handlePurchase}
          disabled={disabled || !currentProduct}
          className={`
            relative px-8 py-4 rounded-lg font-bold text-white text-lg
            transition-all duration-300 transform hover:scale-105 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            ${isMoneyType 
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/30' 
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30'
            }
            ${isAnimating ? 'animate-pulse' : ''}
          `}
        >
          <span className="flex items-center">
            <span className="mr-2 text-xl">
              {isMoneyType ? '💰' : '💀'}
            </span>
            购买
          </span>
          
          {/* 按钮点击效果 */}
          {isAnimating && (
            <div className="absolute inset-0 bg-white opacity-30 rounded-lg animate-ping" />
          )}
        </button>

        {/* 跳过按钮 */}
        <button
          onClick={handleSkip}
          disabled={disabled}
          className="
            px-8 py-4 rounded-lg font-bold text-gray-700 text-lg
            bg-gradient-to-r from-gray-100 to-gray-200 
            hover:from-gray-200 hover:to-gray-300
            transition-all duration-300 transform hover:scale-105 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            border-2 border-gray-300 hover:border-gray-400
          "
        >
          <span className="flex items-center">
            <span className="mr-2 text-xl">⏭️</span>
            不买
          </span>
        </button>
      </div>

      {/* 提示信息 */}
      {currentProduct && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {isMoneyType 
              ? `点击购买将消耗 ${currentProduct.value} 源石锭` 
              : currentLife === currentProduct.value
                ? `⚠️ 点击购买将消耗 ${currentProduct.value} 生命值，游戏将结束！`
                : `点击购买将消耗 ${currentProduct.value} 生命值`
            }
          </p>
        </div>
      )}
    </div>
  );
}; 