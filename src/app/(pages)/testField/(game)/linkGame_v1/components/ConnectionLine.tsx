import { Graphics } from '@pixi/react'
import { PathPoint, GameType, GameMode } from '../constant/types'

interface ConnectionLineProps {
    path: PathPoint[]
    gameMode: GameMode
    gameType: GameType
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