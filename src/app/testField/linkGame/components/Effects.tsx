import { Graphics } from '@pixi/react'
import { TILE_SIZE, TILE_GAP, OUTER_PADDING, PathPoint, GameMode } from '../types'

interface SelectionEffectProps {
  gameMode: GameMode
}

export const SelectionEffect = ({ gameMode }: SelectionEffectProps) => {
  const padding = 4;
  
  if (gameMode === 'cube') {
    return (
      <Graphics
        draw={g => {
          g.clear();
          g.beginFill(0x00ff00, 0.2);
          g.drawRoundedRect(
            -TILE_SIZE/2 - padding, 
            TILE_SIZE/2 - TILE_SIZE/2 - padding, 
            TILE_SIZE + padding * 2, 
            TILE_SIZE + padding * 2,
            8
          );
          g.endFill();
          g.lineStyle(2, 0x00ff00, 0.8);
          g.drawRoundedRect(
            -TILE_SIZE/2 - padding/2, 
            TILE_SIZE/2 - TILE_SIZE/2 - padding/2, 
            TILE_SIZE + padding, 
            TILE_SIZE + padding,
            6
          );
        }}
      />
    )
  }

  return (
    <Graphics
      draw={g => {
        g.clear();
        g.beginFill(0x00ff00, 0.2);
        g.drawRoundedRect(
          -padding,
          -padding,
          TILE_SIZE + padding * 2,
          TILE_SIZE + padding * 2,
          8
        );
        g.endFill();
        g.lineStyle(2, 0x00ff00, 0.8);
        g.drawRoundedRect(
          -padding/2,
          -padding/2,
          TILE_SIZE + padding,
          TILE_SIZE + padding,
          6
        );
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