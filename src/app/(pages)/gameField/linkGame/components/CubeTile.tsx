import { Container, Graphics, Sprite, Text } from '@pixi/react'
import { Tile, TILE_SIZE } from '../types'
import '@pixi/events'

interface CubeTileProps {
    tile: Tile
    onTileClick: (tile: Tile) => void
}

export const CubeTile = ({ tile, onTileClick }: CubeTileProps) => {
  const tileSize = TILE_SIZE - 4
  const depth = TILE_SIZE * 0.2

  // 如果方块已经匹配，则不渲染
  if (tile.isMatched) {
    return null
  }

  return (
    <Container
      x={TILE_SIZE / 2}
      y={TILE_SIZE / 2}
      interactive={true}
      mousedown={() => onTileClick(tile)}
      touchstart={() => onTileClick(tile)}
    >
      {/* 阴影效果 */}
      <Graphics
        draw={g => {
          g.clear()
          g.beginFill(0x000000, 0.1)
          g.drawEllipse(0, tileSize / 2 + 2, tileSize / 2, depth / 2)
          g.endFill()
        }}
      />

      {/* 绘制立方体的三个面 */}
      <Graphics
        draw={g => {
          g.clear()

          // 正面（浅橙色）
          g.beginFill(0xFFDAB9)
          g.drawRect(-tileSize / 2, -tileSize / 2, tileSize, tileSize)
          g.endFill()

          // 顶面（更浅的橙色）
          g.beginFill(0xFFE4C4)
          g.moveTo(-tileSize / 2, -tileSize / 2)
          g.lineTo(-tileSize / 2 + depth, -tileSize / 2 - depth)
          g.lineTo(tileSize / 2 + depth, -tileSize / 2 - depth)
          g.lineTo(tileSize / 2, -tileSize / 2)
          g.endFill()

          // 右侧面（深橙色）
          g.beginFill(0xDEB887)
          g.moveTo(tileSize / 2, -tileSize / 2)
          g.lineTo(tileSize / 2 + depth, -tileSize / 2 - depth)
          g.lineTo(tileSize / 2 + depth, tileSize / 2 - depth)
          g.lineTo(tileSize / 2, tileSize / 2)
          g.endFill()

          // 边框
          g.lineStyle(1, 0x8B4513, 0.5)

          // 正面边框
          g.drawRect(-tileSize / 2, -tileSize / 2, tileSize, tileSize)

          // 顶面边框
          g.moveTo(-tileSize / 2, -tileSize / 2)
          g.lineTo(-tileSize / 2 + depth, -tileSize / 2 - depth)
          g.lineTo(tileSize / 2 + depth, -tileSize / 2 - depth)
          g.lineTo(tileSize / 2, -tileSize / 2)

          // 右侧面边框
          g.moveTo(tileSize / 2, -tileSize / 2)
          g.lineTo(tileSize / 2 + depth, -tileSize / 2 - depth)
          g.lineTo(tileSize / 2 + depth, tileSize / 2 - depth)
          g.lineTo(tileSize / 2, tileSize / 2)
        }}
      />

      {/* 图标 */}
      <Sprite
        image={
          `/linkGame/icon/icon_${tile.type}.png`
        }
        width={tileSize * 0.8}
        height={tileSize * 0.8}
        anchor={0.5}
      />
      {/* <Text text={`${tile.type}`} /> */}
      {/* 选中效果 */}
      {tile.isSelected && (
        <Graphics
          draw={g => {
            g.clear()
            // 发光效果
            g.beginFill(0x00ff00, 0.2)
            // 正面发光
            g.drawRect(-tileSize / 2 - 4, -tileSize / 2 - 4, tileSize + 8, tileSize + 8)
            // 顶面发光
            g.moveTo(-tileSize / 2 - 4, -tileSize / 2 - 4)
            g.lineTo(-tileSize / 2 + depth - 4, -tileSize / 2 - depth - 4)
            g.lineTo(tileSize / 2 + depth + 4, -tileSize / 2 - depth - 4)
            g.lineTo(tileSize / 2 + 4, -tileSize / 2 - 4)
            g.lineTo(-tileSize / 2 - 4, -tileSize / 2 - 4)
            // 右侧面发光
            g.moveTo(tileSize / 2 + 4, -tileSize / 2 - 4)
            g.lineTo(tileSize / 2 + depth + 4, -tileSize / 2 - depth - 4)
            g.lineTo(tileSize / 2 + depth + 4, tileSize / 2 - depth + 4)
            g.lineTo(tileSize / 2 + 4, tileSize / 2 + 4)
            g.lineTo(tileSize / 2 + 4, -tileSize / 2 - 4)
            g.endFill()
          }}
        />
      )}
    </Container>
  )
} 