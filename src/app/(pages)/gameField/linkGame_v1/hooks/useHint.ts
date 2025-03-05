import { useState, useEffect, useRef, useCallback } from 'react'
import { GameStatus, Tile } from '../constant/types'
import { useGameLogic } from './useGameLogic'

export const useHint = (
  tiles: Tile[], // 所有图块数组
  gameStatus: GameStatus, // 当前游戏状态
  isFirstGame: boolean, // 是否是第一局游戏
  onTilesUpdate: (tiles: Tile[]) => void // 更新图块状态的回调函数
) => {
  // 从 useGameLogic hook 中获取判断连接的方法
  const { canConnect } = useGameLogic()
  // 存储当前提示的两个图块
  const [hintTiles, setHintTiles] = useState<[Tile, Tile] | null>(null)
  // 用于存储提示的定时器引用
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
      }
    }
  }, [])

  // 查找可以连接的图块对
  const findHint = useCallback(() => {
    // 获取所有未匹配的图块
    const unmatched = tiles.filter(t => !t.isMatched)

    // 遍历所有可能的图块组合
    for (let i = 0; i < unmatched.length; i++) {
      for (let j = i + 1; j < unmatched.length; j++) {
        const tile1 = unmatched[i]
        const tile2 = unmatched[j]

        // 检查两个图块是否类型相同且可以连接
        if (tile1.type === tile2.type && canConnect(tile1, tile2, tiles).canConnect) {
          return [tile1, tile2] as [Tile, Tile]
        }
      }
    }
    return null
  }, [tiles, canConnect])

  // 清除当前提示
  const clearHint = useCallback(() => {
    // 清除定时器
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current)
      hintTimeoutRef.current = null
    }
    // 清除提示状态
    setHintTiles(null)
  }, [])

  // 处理提示请求
  const handleHint = () => {
    // 只在游戏进行中且不是第一局时才能使用提示
    if (gameStatus !== GameStatus.Playing || isFirstGame) return

    // 清除之前的提示
    clearHint()

    // 查找可连接的图块对
    const hint = findHint()
    if (hint === null) return
    
    // 重置所有图块的选中状态
    onTilesUpdate(tiles.map(tile => ({
      ...tile,
      isSelected: false
    })))

    // 设置新的提示图块对
    setHintTiles(hint)

    // 3秒后自动清除提示
    hintTimeoutRef.current = setTimeout(() => {
      setHintTiles(null)
    }, 3000)
  }

  return {
    hintTiles,    // 当前提示的图块对
    clearHint,    // 清除提示的方法
    handleHint    // 触发提示的方法
  }
} 