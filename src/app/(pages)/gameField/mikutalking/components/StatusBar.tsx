'use client'

import React, { useState } from 'react'
import type { EmotionState } from '../types'

interface StatusBarProps {
  emotion: EmotionState
}

/**
 * 状态栏组件 - 显示角色情绪和状态
 */
export default function StatusBar({ emotion }: StatusBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  // 获取情绪图标
  const getEmotionIcon = () => {
    switch (emotion.current) {
      case 'happy': return '😊'
      case 'excited': return '🤩'
      case 'sad': return '😢'
      case 'angry': return '😠'
      case 'tired': return '😴'
      case 'hungry': return '😋'
      case 'bored': return '😐'
      default: return '😌'
    }
  }

  // 获取进度条颜色
  const getBarColor = (value: number, type: 'happiness' | 'energy' | 'hunger') => {
    if (type === 'hunger') {
      if (value > 70) return 'bg-red-500'
      if (value > 40) return 'bg-yellow-500'
      return 'bg-green-500'
    }
    
    if (value > 70) return 'bg-green-500'
    if (value > 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="absolute top-0 left-0 right-0 z-30">
      {/* 整体容器 */}
      <div className="relative">
        {/* 状态栏内容 - 可展开/收起 */}
        <div
          className={`w-full bg-gradient-to-r from-purple-500/90 via-pink-500/90 to-blue-500/90 backdrop-blur-md shadow-lg px-3 py-2 transition-all duration-300 overflow-hidden ${
            isExpanded ? 'max-h-[12rem] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {/* 移动端布局 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              {/* 左侧：等级和情绪 */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                  <span className="text-2xl">{getEmotionIcon()}</span>
                  <div>
                    <div className="text-sm font-bold text-white">Lv.{emotion.level}</div>
                  </div>
                </div>
              </div>

              {/* 中间：状态条 */}
              <div className="flex-1 space-y-1 min-w-[180px]">
                {/* 快乐度 */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs w-10 text-white/90 font-medium">😊</span>
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(emotion.happiness, 'happiness')} transition-all duration-300`}
                      style={{ width: `${emotion.happiness}%` }}
                    />
                  </div>
                  <span className="text-xs w-7 text-right text-white/90 font-medium">{Math.round(emotion.happiness)}</span>
                </div>

                {/* 能量 */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs w-10 text-white/90 font-medium">⚡</span>
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(emotion.energy, 'energy')} transition-all duration-300`}
                      style={{ width: `${emotion.energy}%` }}
                    />
                  </div>
                  <span className="text-xs w-7 text-right text-white/90 font-medium">{Math.round(emotion.energy)}</span>
                </div>

                {/* 饥饿度 */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs w-10 text-white/90 font-medium">🍎</span>
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(emotion.hunger, 'hunger')} transition-all duration-300`}
                      style={{ width: `${emotion.hunger}%` }}
                    />
                  </div>
                  <span className="text-xs w-7 text-right text-white/90 font-medium">{Math.round(emotion.hunger)}</span>
                </div>
              </div>

              {/* 右侧：亲密度和经验 */}
              <div className="flex items-center gap-2">
                {/* 亲密度 */}
                <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
                  <span className="text-base">❤️</span>
                  <div className="text-xs font-bold text-white">{Math.round(emotion.affection)}</div>
                </div>

                {/* 经验值 */}
                <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
                  <span className="text-base">⭐</span>
                  <div className="text-xs font-bold text-white">{emotion.experience}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 展开/收起按钮 - 始终可见 */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-4 py-2 bg-white/90 backdrop-blur-md rounded-b-xl shadow-lg hover:bg-white transition-all ${
              isExpanded ? '' : 'rounded-xl'
            }`}
          >
            <span className="text-xl">{isExpanded ? '▲' : '▼'}</span>
            {isExpanded && <span className="ml-2 text-sm font-medium">收起</span>}
            {!isExpanded && <span className="ml-2 text-sm font-medium">状态栏</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

