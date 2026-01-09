import { useState, useEffect, useRef, useCallback } from 'react'
import { Tile } from '../types'
import { canConnect } from '../gameLogic'

export const useHint = (
  tiles: Tile[],
  gameStatus: string,
  isFirstGame: boolean,
  onTilesUpdate: (tiles: Tile[]) => void
) => {
  const [hintTiles, setHintTiles] = useState<[Tile, Tile] | null>(null)
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearHint =  useCallback(() => {
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current)
      hintTimeoutRef.current = null
    }
    setHintTiles(null)
  },[])
  

  const findHint = () => {
    // 获取所有未匹配的图块
    const unmatched = tiles.filter(t => !t.isMatched)
    
    // 遍历所有可能的组合
    for (let i = 0; i < unmatched.length; i++) {
      for (let j = i + 1; j < unmatched.length; j++) {
        const tile1 = unmatched[i]
        const tile2 = unmatched[j]
        
        if (tile1.type === tile2.type) {
          const result = canConnect(tile1, tile2, tiles)
          if (result.canConnect) {
            return [tile1, tile2] as [Tile, Tile]
          }
        }
      }
    }
    return null
  }

  const handleHint = () => {
    if (gameStatus !== 'playing' || isFirstGame) return
    
    // 先清除之前的提示
    clearHint()
    
    const hint = findHint()
    if (hint) {
      // 强制更新所有图块的状态
      onTilesUpdate(tiles.map(tile => ({
        ...tile,
        isSelected: false // 清除之前的选中状态
      })))
      
      // 设置新的提示
      setHintTiles(hint)
      
      // 3秒后清除提示
      hintTimeoutRef.current = setTimeout(() => {
        setHintTiles(null)
      }, 3000)
    }
  }

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
      }
    }
  }, [])

  return {
    hintTiles,
    clearHint,
    handleHint
  }
} 