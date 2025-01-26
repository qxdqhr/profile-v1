import { Graphics } from '@pixi/react'
import { TILE_SIZE, TILE_GAP, OUTER_PADDING, PathPoint, GameMode } from '../types'

interface SelectionEffectProps {
  gameMode: GameMode
  isHint?: boolean
}

export const SelectionEffect = ({ gameMode, isHint = false }: SelectionEffectProps) => {
  const padding = 4
  const color = isHint ? 0xffd700 : 0x4CAF50 // 提示时使用金色，选中时使用绿色

  return (
    <Graphics
      draw={g => {
        g.clear()
        g.lineStyle(2, color, 0.8)
        g.beginFill(color, 0.2)
        g.drawRoundedRect(
          -padding,
          TILE_SIZE/2 - TILE_SIZE/2 - padding,
          TILE_SIZE + padding * 2,
          TILE_SIZE + padding * 2,
          8
        )
        g.endFill()
      }}
    />
  )
}

interface ConnectionLineProps {
  path: PathPoint[]
  gameMode: GameMode
}

export const ConnectionLine = ({ path, gameMode }: ConnectionLineProps) => (
  <Graphics
    draw={g => {
      g.clear();
      g.lineStyle(3, 0x00ff00, 1);
      
      // 直接使用路径点坐标（已经包含了所有必要的偏移）
      g.moveTo(path[0].x, path[0].y);
      
      for (let i = 1; i < path.length; i++) {
        g.lineTo(path[i].x, path[i].y);
      }
    }}
  />
) 