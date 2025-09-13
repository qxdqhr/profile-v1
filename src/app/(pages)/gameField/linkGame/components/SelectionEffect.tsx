import { Graphics } from '@pixi/react'
import { GameType, GameMode } from '../constant/types'
import { TILE_SIZE } from '../constant/const'

interface SelectionEffectProps {
  gameType: GameType
  gameMode: GameMode
  isHint?: boolean
}

export const SelectionEffect = ({ isHint = false }: SelectionEffectProps) => {
  const padding = 4
  const color = isHint ? 0xffd700 : 0x4CAF50 // 提示时使用金色，选中时使用绿色

  return (
    <Graphics
      draw={g => {
        if (isHint) {
          g.clear()
          g.lineStyle(2, color, 0.8)
          g.beginFill(color, 0.2)
          g.drawRoundedRect(
            -padding,
            TILE_SIZE / 2 - TILE_SIZE / 2 - padding,
            TILE_SIZE + padding * 2,
            TILE_SIZE + padding * 2,
            8
          )
          g.endFill()
        }
      }}
    />
  )
}

