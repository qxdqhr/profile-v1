import { useState, useEffect, useRef } from 'react'
import { Tile, GameStatus, GameType, GAME_DURATION } from '../types'
import { initializeBoard } from '../gameLogic'

export const useGameState = (clearHint: () => void) => {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [score, setScore] = useState(0)
  const [connectionPath, setConnectionPath] = useState<{ x: number; y: number }[]>([])
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')
  const [gameType, setGameType] = useState<GameType>('disvariable')
  const [isFirstGame, setIsFirstGame] = useState(true)
  const [isFirstClick, setIsFirstClick] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 游戏计时器
  useEffect(() => {
    if (gameStatus === 'playing' && !isFirstClick) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            setGameStatus('failed')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameStatus, isFirstClick])

  // 检查游戏是否完成
  useEffect(() => {
    if (tiles.length > 0 && tiles.every(tile => tile.isMatched)) {
      setGameStatus('success')
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [tiles])

  const handleGameTypeChange = (type: GameType) => {
    if (gameStatus !== 'playing') return
    setGameType(type)
  }

  const handleRestart = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    setTiles(initializeBoard())
    setSelectedTile(null)
    setScore(0)
    setConnectionPath([])
    setTimeLeft(GAME_DURATION)
    setGameStatus('playing')
    setIsFirstClick(true)
    setIsFirstGame(false)
    clearHint()  // 清除提示状态
  }

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