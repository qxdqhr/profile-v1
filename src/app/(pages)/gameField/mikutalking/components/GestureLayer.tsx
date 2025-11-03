'use client'

import React from 'react'

interface GestureLayerProps {
  dragPath: Array<{ x: number; y: number; timestamp: number }>
  isDragging: boolean
}

/**
 * 手势可视化层组件
 */
export default function GestureLayer({ dragPath, isDragging }: GestureLayerProps) {
  if (!isDragging || dragPath.length < 2) {
    return null
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-20"
      style={{ width: '100%', height: '100%' }}
    >
      {/* 绘制拖拽轨迹 */}
      <path
        d={dragPath.map((point, i) => {
          return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        }).join(' ')}
        stroke="rgba(59, 130, 246, 0.6)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 绘制拖拽点 */}
      {dragPath.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={3}
          fill="rgba(59, 130, 246, 0.8)"
        />
      ))}

      {/* 绘制当前位置的高亮 */}
      {dragPath.length > 0 && (
        <circle
          cx={dragPath[dragPath.length - 1].x}
          cy={dragPath[dragPath.length - 1].y}
          r={15}
          fill="none"
          stroke="rgba(59, 130, 246, 0.6)"
          strokeWidth="2"
          className="animate-ping"
        />
      )}
    </svg>
  )
}

