import { useRef, useEffect, useState } from 'react'
import { Tile, GameType, GameStatus } from '../constant/types'
import { GRID_HEIGHT, GRID_WIDTH, TILE_SIZE, TILE_GAP } from '../constant/const'

export const useFallingAnimation = (
  gameType: GameType,
  gameStatus: string,
  tiles: Tile[],
  onTilesUpdate: (updater: (prevTiles: Tile[]) => Tile[]) => void
) => {
  const animationFrameRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef<number>(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // 处理方块移动的逻辑
  const updateFallingTiles = (timestamp: number) => {
    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = timestamp
    }

    const deltaTime = timestamp - lastUpdateTimeRef.current
    if (deltaTime >= 16) { // 约60fps
      lastUpdateTimeRef.current = timestamp

      onTilesUpdate((prevTiles: Tile[]) => {
        let needsUpdate = false
        const newTiles = prevTiles.map((tile: Tile) => {
          if (tile.isMatched) return tile

          // 计算目标坐标
          let targetY = tile.y
          let targetX = tile.x
            // 计算中心点
          const centerX = ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2
          const centerY = ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2
          
          // 简化位置判断
          const isAboveCenter = tile.y < centerY
          const isBelowCenter = tile.y >= centerY
          const isLeftOfCenter = tile.x < centerX
          const isRightOfCenter = tile.x >= centerX

          const movingUp = gameType === GameType.UpFalling || 
                        (gameType === GameType.UpDownSplit && isAboveCenter) ||
                        (gameType === GameType.Clockwise && isLeftOfCenter && isAboveCenter) ||
                        (gameType === GameType.CounterClockwise && isRightOfCenter && isAboveCenter)
                    
          const movingDown = gameType === GameType.DownFalling || 
                        (gameType === GameType.UpDownSplit && isBelowCenter) ||
                        (gameType === GameType.Clockwise && isRightOfCenter && isBelowCenter) ||
                        (gameType === GameType.CounterClockwise && isLeftOfCenter && isBelowCenter)
                    
          const movingLeft = gameType === GameType.LeftFalling || 
                        (gameType === GameType.LeftRightSplit && isLeftOfCenter) ||
                        (gameType === GameType.Clockwise && isLeftOfCenter && isBelowCenter) ||
                        (gameType === GameType.CounterClockwise && isLeftOfCenter && isAboveCenter)
                    
          const movingRight = gameType === GameType.RightFalling || 
                        (gameType === GameType.LeftRightSplit && isRightOfCenter) ||
                        (gameType === GameType.Clockwise && isRightOfCenter && isAboveCenter) ||
                        (gameType === GameType.CounterClockwise && isRightOfCenter && isBelowCenter)


          if (gameType === GameType.DownFalling) {
            // Count all blocks below that aren't matched yet
            const blocksBelow = prevTiles.filter(t =>
              t.x === tile.x &&
                            t.y > tile.y &&
                            !t.isMatched
            ).length
                        
            // Calculate target Y position from the bottom
            targetY = ((GRID_HEIGHT) * (TILE_SIZE + TILE_GAP)) -
                            blocksBelow * (TILE_SIZE + TILE_GAP)
          } else if (gameType === GameType.UpFalling) {
            targetY = prevTiles.filter(t =>
              !t.isMatched &&
                            t.x === tile.x &&
                            t.y < tile.y
            ).length * (TILE_SIZE + TILE_GAP)
          } else if (gameType === GameType.LeftFalling) {
            targetX = prevTiles.filter(t =>
              !t.isMatched &&
                            t.y === tile.y &&
                            t.x < tile.x
            ).length * (TILE_SIZE + TILE_GAP)
          } else if (gameType === GameType.RightFalling) {
            targetX = ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) -
                            prevTiles.filter(t =>
                              !t.isMatched &&
                                t.y === tile.y &&
                                t.x > tile.x
                            ).length * (TILE_SIZE + TILE_GAP)
          } else if (gameType === GameType.LeftRightSplit) {
            // 计算中心点
            const centerX = ((GRID_WIDTH + 1) * (TILE_SIZE + TILE_GAP)) / 2
            // 根据方块位置决定向左还是向右移动
            if (tile.x < centerX) {
              targetX = prevTiles.filter(t =>
                !t.isMatched &&
                                t.y === tile.y &&
                                t.x < tile.x
              ).length * (TILE_SIZE + TILE_GAP)
            } else {
              targetX = ((GRID_WIDTH + 1) * (TILE_SIZE + TILE_GAP)) -
                                prevTiles.filter(t =>
                                  !t.isMatched &&
                                    t.y === tile.y &&
                                    t.x > tile.x
                                ).length * (TILE_SIZE + TILE_GAP)
            }
          } else if (gameType === GameType.UpDownSplit) {
            // 计算中心点
            const centerY = ((GRID_HEIGHT) * (TILE_SIZE + TILE_GAP)) / 2
            // 根据方块位置决定向上还是向下移动
            if (tile.y < centerY) {
              targetY = prevTiles.filter(t =>
                !t.isMatched &&
                                t.x === tile.x &&
                                t.y < tile.y
              ).length * (TILE_SIZE + TILE_GAP)
            } else {
              targetY = ((GRID_HEIGHT) * (TILE_SIZE + TILE_GAP)) -
                                prevTiles.filter(t =>
                                  !t.isMatched &&
                                    t.x === tile.x &&
                                    t.y > tile.y
                                ).length * (TILE_SIZE + TILE_GAP)
            }
          } else if (gameType === GameType.Clockwise) {
            // 计算中心点
            const centerX = ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2
            const centerY = ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2
                        
            // 判断方块在哪个象限，决定移动方向
            if (tile.x >= centerX && tile.y < centerY) {
              // 第一象限：向右移动
              targetX = ((GRID_WIDTH + 1) * (TILE_SIZE + TILE_GAP)) -
                                prevTiles.filter(t =>
                                  !t.isMatched &&
                                    t.y === tile.y &&
                                    t.x > tile.x
                                ).length * (TILE_SIZE + TILE_GAP)
            } else if (tile.x > centerX && tile.y >= centerY) {
              // 第四象限：向下移动
              targetY = ((GRID_HEIGHT) * (TILE_SIZE + TILE_GAP)) -
                                prevTiles.filter(t =>
                                  !t.isMatched &&
                                    t.x === tile.x &&
                                    t.y > tile.y
                                ).length * (TILE_SIZE + TILE_GAP)
            } else if (tile.x <= centerX && tile.y > centerY) {
              // 第三象限：向左移动
              targetX = prevTiles.filter(t =>
                !t.isMatched &&
                                t.y === tile.y &&
                                t.x < tile.x
              ).length * (TILE_SIZE + TILE_GAP)
            } else {
              // 第二象限：向上移动
              targetY = prevTiles.filter(t =>
                !t.isMatched &&
                                t.x === tile.x &&
                                t.y < tile.y
              ).length * (TILE_SIZE + TILE_GAP)
            }
          } else if (gameType === GameType.CounterClockwise) {
            // 计算中心点
            const centerX = ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2
            const centerY = ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2
                        
            // 判断方块在哪个象限，决定移动方向（逆时针）
            if (tile.x >= centerX && tile.y < centerY) {
              // 第一象限：向上移动
              targetY = prevTiles.filter(t =>
                !t.isMatched &&
                                t.x === tile.x &&
                                t.y < tile.y
              ).length * (TILE_SIZE + TILE_GAP)
            } else if (tile.x > centerX && tile.y >= centerY) {
              // 第四象限：向右移动
              targetX = ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) -
                                prevTiles.filter(t =>
                                  !t.isMatched &&
                                    t.y === tile.y &&
                                    t.x > tile.x
                                ).length * (TILE_SIZE + TILE_GAP)
            } else if (tile.x <= centerX && tile.y > centerY) {
              // 第三象限：向下移动
              targetY = ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) -
                                prevTiles.filter(t =>
                                  !t.isMatched &&
                                    t.x === tile.x &&
                                    t.y > tile.y
                                ).length * (TILE_SIZE + TILE_GAP)
            } else {
              // 第二象限：向左移动
              targetX = prevTiles.filter(t =>
                !t.isMatched &&
                                t.y === tile.y &&
                                t.x < tile.x
              ).length * (TILE_SIZE + TILE_GAP)
            }
          } else {
            return tile
          }
                    
          const shouldMoveVertical = movingUp ? tile.y > targetY : movingDown ? tile.y < targetY : false
          const shouldMoveHorizontal = movingLeft ? tile.x > targetX : movingRight ? tile.x < targetX : false
                    
          const calculateNewPosition = (current: number, target: number) => {
            const distance = Math.abs(target - current)
            const speed = Math.max(4, distance / 8)
            return current < target
              ? Math.min(current + speed, target)
              : Math.max(current - speed, target)
          }

          if (shouldMoveVertical || shouldMoveHorizontal) {
            needsUpdate = true
            return {
              ...tile,
              y: (movingUp || movingDown) ? calculateNewPosition(tile.y, targetY) : tile.y,
              x: (movingLeft || movingRight) ? calculateNewPosition(tile.x, targetX) : tile.x
            }
          }
          return tile
        })

        if (!needsUpdate) {
          cancelAnimationFrame(animationFrameRef.current!)
          animationFrameRef.current = null
        }

        return newTiles
      })
    }

    if (animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateFallingTiles)
    }
  }

  // 开始移动动画
  const startFalling = () => {
    if (GameType.isGaming(gameType) && !animationFrameRef.current) {
      setIsAnimating(true)  // 动画开始
      animationFrameRef.current = requestAnimationFrame(updateFallingTiles)
    }
  }

  // 清除动画
  const clearAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
      setIsAnimating(false)  // 动画清除
    }
  }

  // 在游戏状态改变时处理移动
  useEffect(() => {
      if (gameStatus === GameStatus.Playing && GameType.isGaming(gameType)) {
      startFalling()
    }
    return clearAnimation
  }, [gameStatus, gameType])

  // 检测方块匹配状态变化并触发移动
  useEffect(() => {
    if (gameStatus === GameStatus.Playing) {
      const matchedTiles = tiles.filter(t => t.isMatched).length;
      const hasUnmatchedTiles = tiles.some(t => !t.isMatched);
            
      if (matchedTiles > 0 && hasUnmatchedTiles) {
        // 延迟一帧启动动画，确保DOM更新完成
        requestAnimationFrame(() => {
          startFalling();
        });
      }
    }
  }, [tiles, gameStatus]);

  return {
    startFalling,
    clearAnimation,
    isAnimating
  }
} 