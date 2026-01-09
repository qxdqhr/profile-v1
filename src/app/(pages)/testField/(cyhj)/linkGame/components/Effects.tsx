'use client'
import { useCallback } from 'react'
import { extend } from '@pixi/react'
import { Graphics } from 'pixi.js'
import { TILE_SIZE, PathPoint, GameType, GameMode } from '../types'

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

interface ConnectionLineProps {
    path: PathPoint[]
    gameMode: GameMode
    gameType: GameType
}

export const ConnectionLine = ({ path }: ConnectionLineProps) => {
  const draw = useCallback((g: Graphics) => {
    g.clear()
    g.setStrokeStyle({ width: 3, color: 0x00ff00, alpha: 1 })

    // 直接使用路径点坐标（已经包含了所有必要的偏移）
    g.moveTo(path[0].x, path[0].y)

    for (let i = 1; i < path.length; i++) {
      g.lineTo(path[i].x, path[i].y)
    }
    g.stroke()
  }, [path])

  return <pixiGraphics draw={draw} />
}
