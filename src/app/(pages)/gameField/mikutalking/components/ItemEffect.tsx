'use client'

import React, { useEffect, useState } from 'react'

interface ItemEffectProps {
  icon: string
  x: number
  y: number
  onComplete?: () => void
}

/**
 * 道具使用效果组件
 */
export default function ItemEffect({ icon, x, y, onComplete }: ItemEffectProps) {
  const [opacity, setOpacity] = useState(1)
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    // 淡出和上升动画
    const startTime = Date.now()
    const duration = 1000 // 1秒

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      setOpacity(1 - progress)
      setOffsetY(-progress * 100)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        onComplete?.()
      }
    }

    animate()
  }, [onComplete])

  return (
    <div
      className="absolute pointer-events-none text-4xl"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, ${offsetY}px)`,
        opacity,
        transition: 'transform 0.1s, opacity 0.1s',
      }}
    >
      {icon}
    </div>
  )
}

