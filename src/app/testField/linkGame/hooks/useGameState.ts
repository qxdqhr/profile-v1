import { useState, useEffect, useCallback } from 'react'
import { Tile, GameType, GameStatus } from '../types'
import { TILE_SIZE, TILE_GAP } from '../types'

export const useGameState = (
    onGameEnd: () => void,
    gridWidth: number,
    gridHeight: number,
    typesCount: number
) => {
    const [tiles, setTiles] = useState<Tile[]>([])
    const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
    const [score, setScore] = useState(0)
    const [connectionPath, setConnectionPath] = useState<{ x: number; y: number }[]>([])
    const [timeLeft, setTimeLeft] = useState(300)
    const [gameStatus, setGameStatus] = useState<GameStatus>('playing')
    const [gameType, setGameType] = useState<GameType>('disvariable')
    const [isFirstGame, setIsFirstGame] = useState(true)
    const [isFirstClick, setIsFirstClick] = useState(true)

    // 初始化游戏
    const initializeGame = useCallback(() => {
        const newTiles: Tile[] = []
        const types = Array.from({ length: Math.floor(gridWidth * gridHeight / 2) }, (_, i) => 
            i % typesCount
        )
        const allTypes = [...types, ...types]

        // 随机排序
        for (let i = allTypes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allTypes[i], allTypes[j]] = [allTypes[j], allTypes[i]]
        }

        let id = 0
        for (let row = 0; row < gridHeight; row++) {
            for (let col = 0; col < gridWidth; col++) {
                newTiles.push({
                    id: id,
                    type: allTypes[id],
                    x: col * (TILE_SIZE + TILE_GAP),
                    y: row * (TILE_SIZE + TILE_GAP),
                    isSelected: false,
                    isMatched: false
                })
                id++
            }
        }

        setTiles(newTiles)
        setSelectedTile(null)
        setScore(0)
        setConnectionPath([])
        setTimeLeft(300)
        setGameStatus('playing')
        setIsFirstClick(true)
    }, [gridWidth, gridHeight, typesCount])

    // 重新开始游戏
    const handleRestart = useCallback(() => {
        initializeGame()
        setIsFirstGame(false)
    }, [initializeGame])

    // 改变游戏类型
    const handleGameTypeChange = useCallback((type: GameType) => {
        setGameType(type)
    }, [])

    // 检查游戏状态
    useEffect(() => {
        if (!isFirstGame && gameStatus === 'playing' && tiles.length > 0) {
            if (tiles.every(tile => tile.isMatched)) {
                setGameStatus('success')
                onGameEnd()
            }
        }
    }, [tiles, gameStatus, isFirstGame, onGameEnd])

    // 倒计时
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (gameStatus === 'playing' && !isFirstGame) {
            timer = setInterval(() => {
                setTimeLeft(time => {
                    if (time <= 1) {
                        setGameStatus('failed')
                        onGameEnd()
                        return 0
                    }
                    return time - 1
                })
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [gameStatus, isFirstGame, onGameEnd])

    return {
        tiles,
        setTiles,
        selectedTile,
        setSelectedTile,
        score,
        setScore,
        connectionPath,
        setConnectionPath,
        timeLeft,
        gameStatus,
        gameType,
        isFirstGame,
        isFirstClick,
        setIsFirstClick,
        handleGameTypeChange,
        handleRestart
    }
} 