import { Sprite } from '@pixi/react'
import { Tile, TILE_SIZE } from '../types'
import '@pixi/events';


interface TileSpriteProps {
  tile: Tile
  onTileClick: (tile: Tile) => void
}

export const TileSprite = ({ tile, onTileClick }: TileSpriteProps) => (
  <Sprite
    image={`/linkGame/icon/icon_${tile.type}.png`}
    width={tile.isSelected ? TILE_SIZE : TILE_SIZE - 4}
    height={tile.isSelected ? TILE_SIZE : TILE_SIZE - 4}
    alpha={tile.isMatched ? 0.3 : 1}
    anchor={0.5}
    x={TILE_SIZE / 2}
    y={TILE_SIZE / 2}
    tint={0xffffff}
    interactive={true}
    mousedown={() => onTileClick(tile)}
    touchstart={() => onTileClick(tile)}
  />
) 