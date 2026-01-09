'use client'
import { useCallback, useState, useEffect } from 'react'
import { extend } from '@pixi/react'
import { Container, Graphics, Sprite, Assets, Texture } from 'pixi.js'
import { Tile } from '../constant/types'
import { TILE_SIZE } from '../constant/const'

// 注册 PixiJS 组件
extend({ Container, Graphics, Sprite })

// 纹理缓存
const textureCache: Map<string, Texture> = new Map()

interface CubeTileProps {
  tile: Tile
  onTileClick: (tile: Tile) => void
}

export const CubeTile = ({ tile, onTileClick }: CubeTileProps) => {
  const tileSize = TILE_SIZE - 4
  const depth = TILE_SIZE * 0.2
  const [texture, setTexture] = useState<Texture | null>(null)

  // 加载纹理
  useEffect(() => {
    const imagePath = `/linkGame/icon/icon_${tile.type}.png`
    
    // 检查缓存
    if (textureCache.has(imagePath)) {
      setTexture(textureCache.get(imagePath)!)
      return
    }

    // 使用 Assets API 加载
    Assets.load(imagePath).then((loadedTexture: Texture) => {
      // 设置纹理缩放模式为线性插值，使图像更平滑
      loadedTexture.source.scaleMode = 'linear'
      textureCache.set(imagePath, loadedTexture)
      setTexture(loadedTexture)
    }).catch((err) => {
      console.error('Failed to load texture:', imagePath, err)
    })
  }, [tile.type])

  // 阴影绘制回调
  const drawShadow = useCallback((g: Graphics) => {
    g.clear()
    g.ellipse(0, tileSize / 2 + 2, tileSize / 2, depth / 2)
    g.fill({ color: 0x000000, alpha: 0.1 })
  }, [tileSize, depth])

  // 立方体绘制回调
  const drawCube = useCallback((g: Graphics) => {
    g.clear()

    // 正面（浅橙色）
    g.rect(-tileSize / 2, -tileSize / 2, tileSize, tileSize)
    g.fill(0xFFDAB9)

    // 顶面（更浅的橙色）
    g.moveTo(-tileSize / 2, -tileSize / 2)
    g.lineTo(-tileSize / 2 + depth, -tileSize / 2 - depth)
    g.lineTo(tileSize / 2 + depth, -tileSize / 2 - depth)
    g.lineTo(tileSize / 2, -tileSize / 2)
    g.closePath()
    g.fill(0xFFE4C4)

    // 右侧面（深橙色）
    g.moveTo(tileSize / 2, -tileSize / 2)
    g.lineTo(tileSize / 2 + depth, -tileSize / 2 - depth)
    g.lineTo(tileSize / 2 + depth, tileSize / 2 - depth)
    g.lineTo(tileSize / 2, tileSize / 2)
    g.closePath()
    g.fill(0xDEB887)

    // 边框
    g.setStrokeStyle({ width: 1, color: 0x8B4513, alpha: 0.5 })

    // 正面边框
    g.rect(-tileSize / 2, -tileSize / 2, tileSize, tileSize)
    g.stroke()

    // 顶面边框
    g.moveTo(-tileSize / 2, -tileSize / 2)
    g.lineTo(-tileSize / 2 + depth, -tileSize / 2 - depth)
    g.lineTo(tileSize / 2 + depth, -tileSize / 2 - depth)
    g.lineTo(tileSize / 2, -tileSize / 2)
    g.stroke()

    // 右侧面边框
    g.moveTo(tileSize / 2, -tileSize / 2)
    g.lineTo(tileSize / 2 + depth, -tileSize / 2 - depth)
    g.lineTo(tileSize / 2 + depth, tileSize / 2 - depth)
    g.lineTo(tileSize / 2, tileSize / 2)
    g.stroke()
  }, [tileSize, depth])

  // 选中效果绘制回调
  const drawSelection = useCallback((g: Graphics) => {
    g.clear()
    // 发光效果 - 正面
    g.rect(-tileSize / 2 - 4, -tileSize / 2 - 4, tileSize + 8, tileSize + 8)
    g.fill({ color: 0x00ff00, alpha: 0.2 })

    // 顶面发光
    g.moveTo(-tileSize / 2 - 4, -tileSize / 2 - 4)
    g.lineTo(-tileSize / 2 + depth - 4, -tileSize / 2 - depth - 4)
    g.lineTo(tileSize / 2 + depth + 4, -tileSize / 2 - depth - 4)
    g.lineTo(tileSize / 2 + 4, -tileSize / 2 - 4)
    g.closePath()
    g.fill({ color: 0x00ff00, alpha: 0.2 })

    // 右侧面发光
    g.moveTo(tileSize / 2 + 4, -tileSize / 2 - 4)
    g.lineTo(tileSize / 2 + depth + 4, -tileSize / 2 - depth - 4)
    g.lineTo(tileSize / 2 + depth + 4, tileSize / 2 - depth + 4)
    g.lineTo(tileSize / 2 + 4, tileSize / 2 + 4)
    g.closePath()
    g.fill({ color: 0x00ff00, alpha: 0.2 })
  }, [tileSize, depth])

  const handlePointerDown = useCallback(() => {
    onTileClick(tile)
  }, [onTileClick, tile])

  // 如果方块已经匹配，则不渲染 - 必须在所有 hooks 之后
  if (tile.isMatched) {
    return null
  }

  return (
    <pixiContainer
      x={TILE_SIZE / 2}
      y={TILE_SIZE / 2}
      eventMode="static"
      onPointerDown={handlePointerDown}
    >
      {/* 阴影效果 */}
      <pixiGraphics draw={drawShadow} />

      {/* 绘制立方体的三个面 */}
      <pixiGraphics draw={drawCube} />

      {/* 图标 - 只有纹理加载完成后才渲染 */}
      {texture && (
        <pixiSprite
          texture={texture}
          width={tileSize * 0.8}
          height={tileSize * 0.8}
          anchor={0.5}
          roundPixels={true}
        />
      )}
      
      {/* 选中效果 */}
      {tile.isSelected && (
        <pixiGraphics draw={drawSelection} />
      )}
    </pixiContainer>
  )
}
