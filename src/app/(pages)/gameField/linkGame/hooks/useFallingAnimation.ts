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
                        // Count all blocks below that aren't matched yet
                        const blocksBelow = prevTiles.filter(t =>
                            t.x === tile.x &&
                            t.y > tile.y &&
                            !t.isMatched
                        ).length
                        
                        // Calculate target Y position from the bottom
                        targetY = ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) -
                            blocksBelow * (TILE_SIZE + TILE_GAP)
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
                    } else if (gameType === 'leftrightsplit') {
                        // 计算中心点
                        const centerX = ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2
                        // 根据方块位置决定向左还是向右移动
                        if (tile.x < centerX) {
                            targetX = prevTiles.filter(t =>
                                !t.isMatched &&
                                t.y === tile.y &&
                                t.x < tile.x
                            ).length * (TILE_SIZE + TILE_GAP)
                        } else {
                            targetX = ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) -
                                prevTiles.filter(t =>
                                    !t.isMatched &&
                                    t.y === tile.y &&
                                    t.x > tile.x
                                ).length * (TILE_SIZE + TILE_GAP)
                        }
                    } else if (gameType === 'updownsplit') {
                        // 计算中心点
                        const centerY = ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2
                        // 根据方块位置决定向上还是向下移动
                        if (tile.y < centerY) {
                            targetY = prevTiles.filter(t =>
                                !t.isMatched &&
                                t.x === tile.x &&
                                t.y < tile.y
                            ).length * (TILE_SIZE + TILE_GAP)
                        } else {
                            targetY = ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) -
                                prevTiles.filter(t =>
                                    !t.isMatched &&
                                    t.x === tile.x &&
                                    t.y > tile.y
                                ).length * (TILE_SIZE + TILE_GAP)
                        }
                    } else if (gameType === 'clockwise') {
                        // 计算中心点
                        const centerX = ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2
                        const centerY = ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2
                        
                        // 判断方块在哪个象限，决定移动方向
                        if (tile.x >= centerX && tile.y < centerY) {
                            // 第一象限：向右移动
                            targetX = ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) -
                                prevTiles.filter(t =>
                                    !t.isMatched &&
                                    t.y === tile.y &&
                                    t.x > tile.x
                                ).length * (TILE_SIZE + TILE_GAP)
                        } else if (tile.x > centerX && tile.y >= centerY) {
                            // 第四象限：向下移动
                            targetY = ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) -
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
                    } else if (gameType === 'counterclockwise') {
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

                    const movingUp = gameType === 'upfalling' || 
                        (gameType === 'updownsplit' && tile.y < ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2) ||
                        (gameType === 'clockwise' && tile.x <= ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2 && tile.y <= ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2) ||
                        (gameType === 'counterclockwise' && tile.x >= ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2 && tile.y < ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2)
                    
                    const movingDown = gameType === 'downfalling' || 
                        (gameType === 'updownsplit' && tile.y >= ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2) ||
                        (gameType === 'clockwise' && tile.x > ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2 && tile.y >= ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2) ||
                        (gameType === 'counterclockwise' && tile.x <= ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2 && tile.y > ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2)
                    
                    const movingLeft = gameType === 'leftfalling' || 
                        (gameType === 'leftrightsplit' && tile.x < ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2) ||
                        (gameType === 'clockwise' && tile.x <= ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2 && tile.y > ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2) ||
                        (gameType === 'counterclockwise' && tile.x <= ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2 && tile.y <= ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2)
                    
                    const movingRight = gameType === 'rightfalling' || 
                        (gameType === 'leftrightsplit' && tile.x >= ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2) ||
                        (gameType === 'clockwise' && tile.x >= ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2 && tile.y <= ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2) ||
                        (gameType === 'counterclockwise' && tile.x > ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2 && tile.y >= ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2)
                    
                    const shouldMoveVertical = movingUp ? tile.y > targetY : movingDown ? tile.y < targetY : false
                    const shouldMoveHorizontal = movingLeft ? tile.x > targetX : movingRight ? tile.x < targetX : false
                    
                    if (shouldMoveVertical || shouldMoveHorizontal) {
                        needsUpdate = true
                        return {
                            ...tile,
                            y: movingUp
                                ? Math.max(tile.y - Math.max(4, Math.abs(tile.y - targetY) / 8), targetY)  // 向上移动，速度与距离相关
                                : movingDown
                                    ? Math.min(tile.y + Math.max(4, Math.abs(targetY - tile.y) / 8), targetY)  // 向下移动，速度与距离相关
                                    : tile.y,  // 保持不变
                            x: movingLeft
                                ? Math.max(tile.x - Math.max(4, Math.abs(tile.x - targetX) / 8), targetX)  // 向左移动，速度与距离相关
                                : movingRight
                                    ? Math.min(tile.x + Math.max(4, Math.abs(targetX - tile.x) / 8), targetX)  // 向右移动，速度与距离相关
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
        if ((gameType === 'downfalling' || gameType === 'upfalling' || gameType === 'leftfalling' || 
            gameType === 'rightfalling' || gameType === 'leftrightsplit' || gameType === 'updownsplit' || 
            gameType === 'clockwise' || gameType === 'counterclockwise') && !animationFrameRef.current) {
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
        if (gameStatus === 'playing' && (gameType === 'downfalling' || gameType === 'upfalling' || 
            gameType === 'leftfalling' || gameType === 'rightfalling' || gameType === 'leftrightsplit' || 
            gameType === 'updownsplit' || gameType === 'clockwise' || gameType === 'counterclockwise')) {
            startFalling()
        }
        return clearAnimation
    }, [gameStatus, gameType])

    // 检测方块匹配状态变化并触发移动
    useEffect(() => {
        if (gameStatus === 'playing') {
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