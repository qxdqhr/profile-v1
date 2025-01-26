import { useRef, useEffect } from 'react'
import { Tile, GameType, GRID_SIZE, TILE_SIZE, TILE_GAP } from '../types'

export const useFallingAnimation = (
    gameType: GameType,
    gameStatus: string,
    tiles: Tile[],
    onTilesUpdate: (updater: (prevTiles: Tile[]) => Tile[]) => void
) => {
    const animationFrameRef = useRef<number | null>(null)
    const lastUpdateTimeRef = useRef<number>(0)

    // 处理方块下落的逻辑
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

                    // 计算目标Y坐标
                    const targetY = ((GRID_SIZE - 1) * (TILE_SIZE + TILE_GAP)) -
                        prevTiles.filter(t =>
                            !t.isMatched &&
                            t.x === tile.x &&
                            t.y > tile.y
                        ).length * (TILE_SIZE + TILE_GAP)

                    if (tile.y < targetY) {
                        needsUpdate = true
                        return {
                            ...tile,
                            y: Math.min(tile.y + 2, targetY) // 每帧下落2像素
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

    // 开始下落动画
    const startFalling = () => {
        if (gameType === 'downfalling' && !animationFrameRef.current) {
            animationFrameRef.current = requestAnimationFrame(updateFallingTiles)
        }
    }

    // 清除动画
    const clearAnimation = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = null
        }
    }

    // 在游戏状态改变时处理下落
    useEffect(() => {
        if (gameStatus === 'playing' && gameType === 'downfalling') {
            startFalling()
        }
        return clearAnimation
    }, [gameStatus, gameType])

    // 在方块匹配后触发下落
    useEffect(() => {
        if (gameType === 'downfalling' && gameStatus === 'playing') {
            startFalling()
        }
    }, [tiles.filter(t => t.isMatched).length])

    return {
        startFalling,
        clearAnimation
    }
} 