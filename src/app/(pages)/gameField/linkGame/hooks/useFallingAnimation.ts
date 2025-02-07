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

        const deltaTime = timestamp - lastUpdateTimeRef.current;
        // 限制最小和最大帧率，确保动画平滑性
        if (deltaTime >= 16 && deltaTime <= 32) { // 在30-60fps之间
            lastUpdateTimeRef.current = timestamp;

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
                        
                        // 重新定义象限判断和移动方向
                        const isInFirstQuadrant = tile.x >= centerX && tile.y <= centerY;
                        const isInSecondQuadrant = tile.x < centerX && tile.y <= centerY;
                        const isInThirdQuadrant = tile.x < centerX && tile.y > centerY;
                        const isInFourthQuadrant = tile.x >= centerX && tile.y > centerY;

                        if (isInFirstQuadrant) {
                            // 第一象限：向右移动
                            const blocksToRight = prevTiles.filter(t =>
                                !t.isMatched &&
                                t.y === tile.y &&
                                t.x > tile.x
                            ).length;
                            targetX = ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) - blocksToRight * (TILE_SIZE + TILE_GAP);
                        } else if (isInFourthQuadrant) {
                            // 第四象限：向下移动
                            const blocksBelow = prevTiles.filter(t =>
                                !t.isMatched &&
                                t.x === tile.x &&
                                t.y > tile.y
                            ).length;
                            targetY = ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) - blocksBelow * (TILE_SIZE + TILE_GAP);
                        } else if (isInThirdQuadrant) {
                            // 第三象限：向左移动
                            const blocksToLeft = prevTiles.filter(t =>
                                !t.isMatched &&
                                t.y === tile.y &&
                                t.x < tile.x
                            ).length;
                            targetX = blocksToLeft * (TILE_SIZE + TILE_GAP);
                        } else if (isInSecondQuadrant) {
                            // 第二象限：向上移动
                            const blocksAbove = prevTiles.filter(t =>
                                !t.isMatched &&
                                t.x === tile.x &&
                                t.y < tile.y
                            ).length;
                            targetY = blocksAbove * (TILE_SIZE + TILE_GAP);
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

                    const centerX = ((GRID_WIDTH - 1) * (TILE_SIZE + TILE_GAP)) / 2;
                    const centerY = ((GRID_HEIGHT - 1) * (TILE_SIZE + TILE_GAP)) / 2;
                    
                    // Define quadrants for both clockwise and counter-clockwise
                    const isInFirstQuadrant = tile.x >= centerX && tile.y <= centerY;
                    const isInSecondQuadrant = tile.x < centerX && tile.y <= centerY;
                    const isInThirdQuadrant = tile.x < centerX && tile.y > centerY;
                    const isInFourthQuadrant = tile.x >= centerX && tile.y > centerY;

                    const movingUp = gameType === 'upfalling' ||
                        (gameType === 'updownsplit' && tile.y < centerY) ||
                        (gameType === 'clockwise' && isInSecondQuadrant) ||
                        (gameType === 'counterclockwise' && isInFirstQuadrant)
                    
                    const movingDown = gameType === 'downfalling' ||
                        (gameType === 'updownsplit' && tile.y >= centerY) ||
                        (gameType === 'clockwise' && isInFourthQuadrant) ||
                        (gameType === 'counterclockwise' && isInThirdQuadrant)
                    
                    const movingLeft = gameType === 'leftfalling' ||
                        (gameType === 'leftrightsplit' && tile.x < centerX) ||
                        (gameType === 'clockwise' && isInThirdQuadrant) ||
                        (gameType === 'counterclockwise' && isInSecondQuadrant)
                    
                    const movingRight = gameType === 'rightfalling' ||
                        (gameType === 'leftrightsplit' && tile.x >= centerX) ||
                        (gameType === 'clockwise' && isInFirstQuadrant) ||
                        (gameType === 'counterclockwise' && isInFourthQuadrant)
                    
                    const shouldMoveVertical = movingUp ? tile.y > targetY : movingDown ? tile.y < targetY : false
                    const shouldMoveHorizontal = movingLeft ? tile.x > targetX : movingRight ? tile.x < targetX : false
                    
                    if (shouldMoveVertical || shouldMoveHorizontal) {
                        needsUpdate = true
                        return {
                            ...tile,
                            y: movingUp
                                ? Math.max(tile.y - Math.min(8, Math.max(2, Math.abs(tile.y - targetY) / 12)), targetY)  // 向上移动，限制最大和最小速度
                                : movingDown
                                    ? Math.min(tile.y + Math.min(8, Math.max(2, Math.abs(targetY - tile.y) / 12)), targetY)  // 向下移动，限制最大和最小速度
                                    : tile.y,  // 保持不变
                            x: movingLeft
                                ? Math.max(tile.x - Math.min(8, Math.max(2, Math.abs(tile.x - targetX) / 12)), targetX)  // 向左移动，限制最大和最小速度
                                : movingRight
                                    ? Math.min(tile.x + Math.min(8, Math.max(2, Math.abs(targetX - tile.x) / 12)), targetX)  // 向右移动，限制最大和最小速度
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
            const matchedTiles = tiles.filter(t => t.isMatched);
            const unmatchedTiles = tiles.filter(t => !t.isMatched);
            
            // 只有在有匹配的方块且还有未匹配方块时才触发动画
            if (matchedTiles.length > 0 && unmatchedTiles.length > 0) {
                // 先清除现有动画
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
                
                // 确保所有DOM更新完成后再开始新的动画
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        setIsAnimating(true);
                        startFalling();
                    });
                }, 16); // 等待一帧的时间
            }
        }
    }, [tiles, gameStatus]);

    // 在组件卸载时清理
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return {
        startFalling,
        clearAnimation,
        isAnimating
    }
} 