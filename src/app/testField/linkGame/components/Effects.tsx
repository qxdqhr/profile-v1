import { Graphics } from '@pixi/react'
import { TILE_SIZE, OUTER_PADDING, PathPoint } from '../types'

export const SelectionEffect = () => (
  <Graphics
    draw={g => {
      g.clear();
      const padding = 4;
      g.beginFill(0x00ff00, 0.2);
      g.drawRoundedRect(-padding, -padding, 
        TILE_SIZE + padding * 2, 
        TILE_SIZE + padding * 2,
        8
      );
      g.endFill();
      g.lineStyle(2, 0x00ff00, 0.8);
      g.drawRoundedRect(-padding/2, -padding/2, 
        TILE_SIZE + padding, 
        TILE_SIZE + padding,
        6
      );
    }}
  />
)

export const ConnectionLine = ({ path }: { path: PathPoint[] }) => (
  <Graphics
    draw={g => {
      g.clear();
      g.lineStyle(3, 0x00ff00, 1);
      g.moveTo(path[0].x - OUTER_PADDING * TILE_SIZE, path[0].y - OUTER_PADDING * TILE_SIZE);
      for (let i = 1; i < path.length; i++) {
        g.lineTo(
          path[i].x - OUTER_PADDING * TILE_SIZE, 
          path[i].y - OUTER_PADDING * TILE_SIZE
        );
      }
    }}
  />
) 