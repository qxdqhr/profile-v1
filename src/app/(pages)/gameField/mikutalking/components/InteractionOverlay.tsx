'use client'

import React, { useRef, useState } from 'react'
import type { BodyPart } from '../types'

interface InteractionOverlayProps {
  onBodyPartClick: (bodyPart: BodyPart) => void
  debugMode?: boolean
}

/**
 * 交互覆盖层组件 - 捕获用户点击并映射到身体部位
 */
export default function InteractionOverlay({
  onBodyPartClick,
  debugMode = false,
}: InteractionOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const [nextRippleId, setNextRippleId] = useState(0)

  // 定义交互区域（基于屏幕百分比）
  const interactionZones = [
    { id: 'head' as BodyPart, label: '头部', x: 50, y: 20, width: 20, height: 15 },
    { id: 'face' as BodyPart, label: '脸部', x: 50, y: 28, width: 18, height: 12 },
    { id: 'body' as BodyPart, label: '身体', x: 50, y: 50, width: 25, height: 20 },
    { id: 'leftArm' as BodyPart, label: '左手', x: 35, y: 50, width: 12, height: 20 },
    { id: 'rightArm' as BodyPart, label: '右手', x: 65, y: 50, width: 12, height: 20 },
    { id: 'leftLeg' as BodyPart, label: '左腿', x: 43, y: 75, width: 10, height: 20 },
    { id: 'rightLeg' as BodyPart, label: '右腿', x: 57, y: 75, width: 10, height: 20 },
  ]

  // 处理点击事件
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!overlayRef.current) return

    const rect = overlayRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    // 添加涟漪效果
    const ripple = { id: nextRippleId, x: event.clientX - rect.left, y: event.clientY - rect.top }
    setRipples(prev => [...prev, ripple])
    setNextRippleId(prev => prev + 1)

    // 移除涟漪
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id))
    }, 800)

    // 检测点击位置属于哪个区域
    let clickedZone: BodyPart = 'none'
    for (const zone of interactionZones) {
      const halfWidth = zone.width / 2
      const halfHeight = zone.height / 2
      
      if (
        x >= zone.x - halfWidth &&
        x <= zone.x + halfWidth &&
        y >= zone.y - halfHeight &&
        y <= zone.y + halfHeight
      ) {
        clickedZone = zone.id
        break
      }
    }

    console.log('点击位置:', { x: x.toFixed(1), y: y.toFixed(1) }, '区域:', clickedZone)
    onBodyPartClick(clickedZone)
  }

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-10 cursor-pointer"
      onClick={handleClick}
    >
      {/* 涟漪效果 */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-16 h-16 rounded-full border-4 border-blue-400 animate-ping opacity-75" />
        </div>
      ))}

      {/* 调试模式：显示交互区域 */}
      {debugMode && (
        <div className="absolute inset-0 pointer-events-none">
          {interactionZones.map(zone => (
            <div
              key={zone.id}
              className="absolute border-2 border-dashed border-red-500 bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-600"
              style={{
                left: `${zone.x - zone.width / 2}%`,
                top: `${zone.y - zone.height / 2}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
              }}
            >
              {zone.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

