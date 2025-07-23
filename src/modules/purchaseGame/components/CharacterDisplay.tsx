/**
 * 人物立绘展示组件
 */

import React from 'react';
import { CharacterDisplayProps } from '../types';
import { ProductType } from '../types';

export const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  product,
  isAnimating,
}) => {
  if (!product) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <span className="text-gray-500 text-lg">等待商品出现...</span>
          </div>
        </div>
      </div>
    );
  }

  const isMoneyType = product.type === ProductType.MONEY;
  
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className={`text-center transition-all duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
        {/* 商品图片 */}
        <div className="relative mb-6">
          <div className={`w-64 h-64 rounded-lg overflow-hidden border-4 ${
            isMoneyType ? 'border-yellow-400 bg-yellow-50' : 'border-red-400 bg-red-50'
          } shadow-lg`}>
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 图片加载失败时显示默认图片
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            
            {/* 默认图片 */}
            <div className={`w-full h-full flex items-center justify-center ${
              product.imageUrl ? 'hidden' : ''
            }`}>
              <div className={`text-6xl ${
                isMoneyType ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {isMoneyType ? '💰' : '💀'}
              </div>
            </div>
          </div>
          
          {/* 商品类型标识 */}
          <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-white text-sm font-bold ${
            isMoneyType ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
            {isMoneyType ? '谋财' : '害命'}
          </div>
        </div>
        
        {/* 商品信息 */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-800">{product.name}</h3>
          <p className="text-gray-600 max-w-md mx-auto">{product.description}</p>
          
          {/* 价值显示 */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full font-bold ${
            isMoneyType 
              ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' 
              : 'bg-red-100 text-red-800 border-2 border-red-300'
          }`}>
            <span className="mr-2">
              {isMoneyType ? '💎' : '❤️'}
            </span>
            <span>
              {isMoneyType ? `${product.value} 源石锭` : `${product.value} 生命值`}
            </span>
          </div>
        </div>
        
        {/* 动画效果 */}
        {isAnimating && (
          <div className="absolute inset-0 bg-white opacity-20 animate-ping rounded-lg" />
        )}
      </div>
    </div>
  );
}; 