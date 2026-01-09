'use client'
import { useCallback, useState, useEffect } from 'react'
import { extend } from '@pixi/react'
import { Sprite, Assets, Texture } from 'pixi.js'
import { Tile } from '../constant/types'
import { TILE_SIZE } from '../constant/const'

// 注册 PixiJS 组件
extend({ Sprite })

// 纹理缓存
const textureCache: Map<string, Texture> = new Map()

interface ImageTileProps {
  tile: Tile
  onTileClick: (tile: Tile) => void
}

export const ImageTile = ({ tile, onTileClick }: ImageTileProps) => {
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

  const handlePointerDown = useCallback(() => {
    onTileClick(tile)
  }, [onTileClick, tile])

  if (!texture) return null

  return (
    <pixiSprite
      texture={texture}
      width={tile.isSelected ? TILE_SIZE : TILE_SIZE - 4}
      height={tile.isSelected ? TILE_SIZE : TILE_SIZE - 4}
      x={TILE_SIZE / 2}
      y={TILE_SIZE / 2}
      anchor={0.5}
      alpha={tile.isMatched ? 0.3 : 1}
      eventMode="static"
      onPointerDown={handlePointerDown}
      roundPixels={true}
    />
  )
}
