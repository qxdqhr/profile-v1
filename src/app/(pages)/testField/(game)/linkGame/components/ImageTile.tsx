import { Sprite } from '@pixi/react'
import { Tile, TILE_SIZE } from '../types'
import '@pixi/events';


interface ImageTileProps {
  tile: Tile
  onTileClick: (tile: Tile) => void
}

export const ImageTile = ({ tile, onTileClick }: ImageTileProps) => (
  <Sprite
    image={`/linkGame/icon/icon_${tile.type}.png`}
    width={tile.isSelected ? TILE_SIZE : TILE_SIZE - 4}
    height={tile.isSelected ? TILE_SIZE : TILE_SIZE - 4}
    x={TILE_SIZE / 2}
    y={TILE_SIZE / 2}
    anchor={0.5}
    alpha={tile.isMatched ? 0.3 : 1}
    interactive={true}
    mousedown={() => onTileClick(tile)}
    touchstart={() => onTileClick(tile)}
  />
) 