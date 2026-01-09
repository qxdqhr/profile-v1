'use client'
import { useCallback } from 'react'
import { extend } from '@pixi/react'
import { Graphics } from 'pixi.js'
import { GameType, GameMode } from '../constant/types'
import { TILE_SIZE } from '../constant/const'

// 注册 PixiJS 组件
extend({ Graphics })

interface SelectionEffectProps {
  gameType: GameType
  gameMode: GameMode
  isHint?: boolean
}

export const SelectionEffect = ({ isHint = false }: SelectionEffectProps) => {
  const padding = 4
  const color = isHint ? 0xffd700 : 0x4CAF50 // 提示时使用金色，选中时使用绿色

  const draw = useCallback((g: Graphics) => {
    if (isHint) {
      g.clear()
      g.roundRect(
        -padding,
        TILE_SIZE / 2 - TILE_SIZE / 2 - padding,
        TILE_SIZE + padding * 2,
        TILE_SIZE + padding * 2,
        8
      )
      g.fill({ color, alpha: 0.2 })
      g.setStrokeStyle({ width: 2, color, alpha: 0.8 })
      g.stroke()
    }
  }, [isHint, color])

  return <pixiGraphics draw={draw} />
}
