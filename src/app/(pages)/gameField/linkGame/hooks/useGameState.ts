import { useState, useEffect, useCallback, useRef } from 'react'
import { Tile, GameType, GameStatus, SHUFFLE_COUNT } from '../types'
import { TILE_SIZE, TILE_GAP } from '../types'
import { hasMatchablePairs, shuffleTiles } from '../gameLogic'

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
    const [noMatchesFound, setNoMatchesFound] = useState(false)
    const [shuffleCount, setShuffleCount] = useState(0) // 已使用的洗牌次数，初始为0
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const lastUpdateTimeRef = useRef<number>(0)

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
        setNoMatchesFound(false)
        setShuffleCount(0) // 重置已使用的洗牌次数为0
    }, [gridWidth, gridHeight, typesCount])

    // 启动计时器
    const startTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }
        lastUpdateTimeRef.current = Date.now()

        const newTimer = setInterval(() => {
            const now = Date.now()
            const deltaTime = now - lastUpdateTimeRef.current
            
            if (deltaTime >= 1000) {
                lastUpdateTimeRef.current = now
                setTimeLeft(time => {
                    if (time <= 1) {
                        setGameStatus('failed')
                        onGameEnd()
                        if (timerRef.current) {
                            clearInterval(timerRef.current)
                            timerRef.current = null
                        }
                        return 0
                    }
                    return time - 1
                })
            }
        }, 100)

        timerRef.current = newTimer
    }, [onGameEnd])

    // 停止计时器
    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // 重新开始游戏
    const handleRestart = useCallback(() => {
        stopTimer();
        setGameStatus('playing');
        setTimeLeft(300);
        setIsFirstGame(false);
        setIsFirstClick(false);
        initializeGame();
    }, [initializeGame, stopTimer]);

    // 处理第一次点击
    const handleFirstClick = useCallback(() => {
        if (isFirstClick && gameStatus === 'playing') {
            setIsFirstClick(false)
            startTimer()
        }
    }, [isFirstClick, startTimer, gameStatus])

    // 改变游戏类型
    const handleGameTypeChange = useCallback((type: GameType) => {
        setGameType(type)
    }, [])

    // 洗牌功能
    const handleShuffle = useCallback(() => {
        if (shuffleCount < SHUFFLE_COUNT && gameStatus === 'playing' && !isFirstGame && !tiles.every(tile => tile.isMatched)) {
            const shuffledTiles = shuffleTiles(tiles)
            setTiles(shuffledTiles)
            setShuffleCount(prev => prev + 1)
            setNoMatchesFound(false)
            setSelectedTile(null)
            setConnectionPath([])
        }
    }, [tiles, shuffleCount, gameStatus, isFirstGame])

    // 检查游戏状态
    useEffect(() => {
        if (!isFirstGame && gameStatus === 'playing' && tiles.length > 0) {
            // 检查是否全部匹配完成
            if (tiles.every(tile => tile.isMatched)) {
                console.log("stopTimer2")

                stopTimer() // 停止计时器
                setGameStatus('success')
                onGameEnd()
                return // 提前返回，不再检查其他状态
            } 
            // 只有在游戏未完成时才检查是否还有可配对的方块
            else if (!hasMatchablePairs(tiles)) {
                setNoMatchesFound(true)
                // 如果还有洗牌次数，自动洗牌
                if (shuffleCount < SHUFFLE_COUNT) {
                    handleShuffle()
                }
            }
        }
    }, [tiles, gameStatus, isFirstGame, onGameEnd, shuffleCount, handleShuffle, stopTimer])

    // 在组件卸载时清理计时器
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);

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
        setGameStatus,
        gameType,
        isFirstGame,
        isFirstClick,
        setIsFirstClick,
        handleGameTypeChange,
        handleRestart,
        handleShuffle,
        shuffleCount,
        noMatchesFound,
        setNoMatchesFound,
        handleFirstClick,
        stopTimer
    }
} 