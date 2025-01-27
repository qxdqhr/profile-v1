import { useRef, useEffect, useState } from 'react'
import { Tile, GameType, GRID_HEIGHT, GRID_WIDTH, TILE_SIZE, TILE_GAP } from '../types'

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

                    if (gameType === 'downfalling') {
                        targetY = ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) -
                            prevTiles.filter(t =>
                                !t.isMatched &&
                                t.x === tile.x &&
                                t.y > tile.y
                            ).length * (TILE_SIZE + TILE_GAP)
                    } else if (gameType === 'upfalling') {
                        targetY = prevTiles.filter(t =>
                            !t.isMatched &&
                            t.x === tile.x &&
                            t.y < tile.y
                        ).length * (TILE_SIZE + TILE_GAP)
                    } else if (gameType === 'leftfalling') {
                        targetX = prevTiles.filter(t =>
                            !t.isMatched &&
                            t.y === tile.y &&
                            t.x < tile.x
                        ).length * (TILE_SIZE + TILE_GAP)
                    } else if (gameType === 'rightfalling') {
                        targetX = ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) -
                            prevTiles.filter(t =>
                                !t.isMatched &&
                                t.y === tile.y &&
                                t.x > tile.x
                            ).length * (TILE_SIZE + TILE_GAP)
                    } else {
                        return tile
                    }

                    const movingUp = gameType === 'upfalling'
                    const movingLeft = gameType === 'leftfalling'
                    const movingRight = gameType === 'rightfalling'
                    const shouldMoveVertical = movingUp ? tile.y > targetY : tile.y < targetY
                    const shouldMoveHorizontal = movingLeft ? tile.x > targetX : movingRight ? tile.x < targetX : false
                    
                    if (shouldMoveVertical || shouldMoveHorizontal) {
                        needsUpdate = true
                        return {
                            ...tile,
                            y: movingUp 
                                ? Math.max(tile.y - 2, targetY)  // 向上移动
                                : gameType === 'downfalling' 
                                    ? Math.min(tile.y + 2, targetY)  // 向下移动
                                    : tile.y,  // 保持不变
                            x: movingLeft
                                ? Math.max(tile.x - 2, targetX)  // 向左移动
                                : movingRight
                                    ? Math.min(tile.x + 2, targetX)  // 向右移动
                                    : tile.x  // 保持不变
                        }
                    }
                    return tile
                })

                if (!needsUpdate) {
                    cancelAnimationFrame(animationFrameRef.current!)
                    animationFrameRef.current = null
                    setIsAnimating(false)  // 动画结束
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
        if ((gameType === 'downfalling' || gameType === 'upfalling' || gameType === 'leftfalling' || gameType === 'rightfalling') && !animationFrameRef.current) {
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
        if (gameStatus === 'playing' && (gameType === 'downfalling' || gameType === 'upfalling' || gameType === 'leftfalling' || gameType === 'rightfalling')) {
            startFalling()
        }
        return clearAnimation
    }, [gameStatus, gameType])

    // 在方块匹配后触发移动
    useEffect(() => {
        if ((gameType === 'downfalling' || gameType === 'upfalling' || gameType === 'leftfalling' || gameType === 'rightfalling') && gameStatus === 'playing') {
            startFalling()
        }
    }, [tiles.filter(t => t.isMatched).length])

    return {
        startFalling,
        clearAnimation,
        isAnimating
    }
} 