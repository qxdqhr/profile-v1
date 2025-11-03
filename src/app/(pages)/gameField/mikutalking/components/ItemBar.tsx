'use client'

import React, { useState } from 'react'
import type { ItemInventory } from '../types'
import { ITEMS } from '../constants/items'

interface ItemBarProps {
  inventory: ItemInventory
  onUseItem: (itemId: string) => void
}

/**
 * 道具栏组件
 */
export default function ItemBar({ inventory, onUseItem }: ItemBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'food' | 'toy' | 'gift' | 'decoration'>('all')

  // 过滤道具
  const filteredItems = ITEMS.filter(item => {
    if (selectedCategory === 'all') return true
    return item.type === selectedCategory
  })

  // 获取分类标签
  const getCategoryLabel = (category: typeof selectedCategory) => {
    switch (category) {
      case 'all': return '全部'
      case 'food': return '食物'
      case 'toy': return '玩具'
      case 'gift': return '礼物'
      case 'decoration': return '装饰'
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      {/* 整体容器 */}
      <div className="relative">
        {/* 展开/收起按钮 - 始终可见 */}
        <div className="flex justify-center mb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-t-xl shadow-lg hover:bg-white transition-colors"
          >
            <span className="text-xl">{isExpanded ? '▼' : '▲'}</span>
            <span className="ml-2 text-sm font-medium">道具箱</span>
          </button>
        </div>

        {/* 道具栏内容 - 可展开/收起 */}
        <div
          className={`bg-white/95 backdrop-blur-md shadow-2xl transition-all duration-300 overflow-hidden ${
            isExpanded ? 'max-h-[20rem] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* 分类标签 */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {(['all', 'food', 'toy', 'gift', 'decoration'] as const).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>

          {/* 道具网格 */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-48 overflow-y-auto">
            {filteredItems.map(item => {
              const quantity = inventory[item.id] || 0
              const isAvailable = quantity > 0

              return (
                <button
                  key={item.id}
                  onClick={() => isAvailable && onUseItem(item.id)}
                  disabled={!isAvailable}
                  className={`relative aspect-square rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition-all ${
                    isAvailable
                      ? 'bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 shadow-md hover:shadow-lg hover:scale-105 cursor-pointer'
                      : 'bg-gray-100 opacity-50 cursor-not-allowed'
                  }`}
                  title={item.description}
                >
                  {/* 道具图标 */}
                  <span className="text-3xl">{item.icon}</span>
                  
                  {/* 道具名称 */}
                  <span className="text-xs font-medium text-gray-700 text-center line-clamp-1">
                    {item.name}
                  </span>

                  {/* 数量标识 */}
                  {item.consumable && (
                    <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isAvailable ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
                    }`}>
                      {quantity}
                    </div>
                  )}

                  {/* 不可消耗道具标识 */}
                  {!item.consumable && isAvailable && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-xs">∞</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* 道具说明 */}
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-sm">该分类下暂无道具</div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

