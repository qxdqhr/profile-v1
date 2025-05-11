'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Stage, Container } from '@pixi/react'
import { CubeTile } from './components/CubeTile'
import { SelectionEffect, ConnectionLine } from './components/Effects'
import { GameInfo, MusicControl } from './components/UI'
import { canConnect, hasMatchablePairs } from './gameLogic'
import { TYPES_COUNT, TILE_SIZE, TILE_GAP, OUTER_PADDING, Tile, GameMode, GameType, Level, GameSettings } from './types'
import { useGameState } from './hooks/useGameState'
import { useMusic } from './hooks/useMusic'
import { useHint } from './hooks/useHint'
import { useFallingAnimation } from './hooks/useFallingAnimation'
import { useSoundEffects } from './hooks/useSoundEffects'
import { useScoreRecord } from './hooks/useScoreRecord'
import { SettingsAndScores } from './components/SettingsAndScores'
import LevelSelect from './components/LevelSelect'
import './LinkGame.css'
import { useResourcePreload } from './hooks/useResourcePreload'
import { SHUFFLE_COUNT } from './types'

const LinkGame = () => {
  const [hintClearer, setHintClearer] = useState<() => void>(() => () => {})
  const [showSettingsAndScores, setShowSettingsAndScores] = useState(false)
  const [gridWidth, setGridWidth] = useState(10)
  const [gridHeight, setGridHeight] = useState(8)
  const [typesCount, setTypesCount] = useState(TYPES_COUNT)
  const [gameMode, setGameMode] = useState<GameMode>('cube')
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [godMode, setGodMode] = useState(false)
  
  // 跟踪设置变化
  const settingsRef = useRef({
    gameType: 'disvariable' as GameType,
    gridWidth: 10,
    gridHeight: 8,
    typesCount: TYPES_COUNT
  })

  const {
    tiles,
    setTiles,
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
  } = useGameState(() => hintClearer(), gridWidth, gridHeight, typesCount)

  const {
    isMusicPlaying,
    isMusicLoaded,
    startBackgroundMusic,
    toggleMusic,
    loadNewMusic,
    currentMusic
  } = useMusic()

  const {
    hintTiles,
    clearHint,
    handleHint
  } = useHint(tiles, gameStatus, isFirstGame, setTiles)

  const {
    clearAnimation,
    isAnimating
  } = useFallingAnimation(gameType, gameStatus, tiles, setTiles)

  const {
    playClickSound,
    playMatchSound
  } = useSoundEffects()

  const {
    scoreRecords,
    addScoreRecord,
    clearRecords
  } = useScoreRecord()

  // 计算最高分
  const highestScore = scoreRecords.reduce((max, record) =>
    record.score > max ? record.score : max, 0)

  // 处理关卡选择
  const handleLevelSelect = (level: Level) => {
    setSelectedLevel(level)
    handleGameTypeChange(level.gameType)
  }

  // 返回选关界面
  const handleBackToLevels = () => {
    setSelectedLevel(null)
    // 如果游戏正在进行，需要重置游戏状态
    if (gameStatus === 'playing') {
      handleRestart()
    }
  }

  // 更新 hintClearer
  useEffect(() => {
    setHintClearer(() => clearHint)
  }, [clearHint])

  const handleSettingsChange = (settings: Partial<GameSettings>) => {
    if (settings.godMode !== undefined) {
      setGodMode(settings.godMode)
    }
    if (settings.gameType !== undefined) {
      handleGameTypeChange(settings.gameType)
    }
    if (settings.gridWidth !== undefined) {
      setGridWidth(settings.gridWidth)
    }
    if (settings.gridHeight !== undefined) {
      setGridHeight(settings.gridHeight)
    }
    if (settings.typesCount !== undefined) {
      setTypesCount(settings.typesCount)
    }
  }

  const handleTileClick = (tile: Tile) => {
    if (gameStatus !== 'playing') return

    // 播放点击音效 - 移到最前面，确保最快响应
    playClickSound()

    // 处理第一次点击
    handleFirstClick();

    // 清除提示状态
    clearHint()

    // 获取选中的方块 
    const selectedTile = tiles.find(t => t.isSelected)
    // 检查是否可以连接
    const result = selectedTile ? canConnect(selectedTile, tile, tiles) : { canConnect: false, path: [] }

    // 选中第一个方块
    if (selectedTile === null) {
      const newTiles = tiles.map(t =>
        t.id === tile.id ? { ...t, isSelected: true } : t
      );
      setTiles(newTiles);
      return
    }
    // 选中了已选中的方块，取消选中
    if (selectedTile && selectedTile.id === tile.id) {
      setTiles(tiles.map(t => ({
        ...t,
        isSelected: false
      })))
      setConnectionPath([])
    }
    // 选中了两个方块，尝试连接
    else if (selectedTile && tile.type === selectedTile.type && result.canConnect) {
      // 播放匹配成功音效
      playMatchSound()

      setTiles(tiles.map(t => ({
        ...t,
        isSelected: false,
        isMatched: t.id === tile.id || t.id === selectedTile.id ? true : t.isMatched
      })))
      setScore(score + 10)
      setConnectionPath(result.path)

      setTimeout(() => {
        setConnectionPath([])
        // TODO: 改成常量
      }, 300)
    } else {
      // 匹配失败，选中新的方块
      setTiles(tiles.map(t => ({
        ...t,
        isSelected: t.id === tile.id
      })))
      setConnectionPath([])
    }
  }

  // 检查游戏状态
  useEffect(() => {
    if (!isFirstGame && gameStatus === 'playing' && tiles.length > 0) {
      // 检查是否全部匹配完成
      if (tiles.every(tile => tile.isMatched)) {
        // 先停止计时器
        stopTimer()
        // 计算最终得分：基础分数 + 剩余时间加分（每秒2分）
        const timeBonus = timeLeft * 2
        const finalScore = score + timeBonus
        // 添加得分记录
        addScoreRecord(finalScore, gameType, gridWidth, gridHeight, timeLeft)
        setGameStatus('success')
        setScore(finalScore) // 更新显示的分数
        return // 提前返回，不再检查其他状态
      }
      // 检查是否时间耗尽
      if (timeLeft <= 0) {
        stopTimer()
        setGameStatus('failed')
        return
      }
      // 只有在游戏未完成时才检查是否还有可配对的方块
      if (!hasMatchablePairs(tiles)) {
        setNoMatchesFound(true)
        // 如果还有洗牌次数，自动洗牌
        if (shuffleCount < SHUFFLE_COUNT) {
          handleShuffle()
        } else {
          // 如果没有洗牌次数且无法配对，游戏结束
          stopTimer()
          setGameStatus('failed')
        }
      }
    }
  }, [
      tiles,
      gameStatus,
      isFirstGame,
      score,
      gameType,
      gridWidth, 
      gridHeight,
      timeLeft,
      addScoreRecord,
      shuffleCount, 
      handleShuffle, 
      stopTimer,
      setGameStatus, 
      setNoMatchesFound
  ])

  const { isLoading, progress, error } = useResourcePreload()
  // 如果正在加载或出错，显示加载界面
  if (error !== null) {
    return <ErrorPage error={error} />
  }
  if (isLoading) {
    return <LoadingPage progress={progress} />
  }

  if (selectedLevel === null) {
    return <LevelSelect
      onSelectLevel={handleLevelSelect}
    />
  }
  

  return (
    <div className="linkGame-container">
      <GameInfo
        score={score}
        timeLeft={timeLeft}
        gameStatus={gameStatus}
        isFirstGame={isFirstGame}
        gameType={gameType}
        onRestart={handleRestart}
        onHint={handleHint}
        onGameTypeChange={handleGameTypeChange}
        isAnimating={isAnimating}
        onSettingsClick={() => setShowSettingsAndScores(true)}
        onShuffle={handleShuffle}
        shuffleCount={shuffleCount}
        noMatchesFound={noMatchesFound}
        isMusicPlaying={isMusicPlaying}
        onToggle={toggleMusic}
        disabled={!isMusicLoaded}
        startBackgroundMusic={startBackgroundMusic}
        currentMusic={currentMusic}
        godMode={godMode}
        onBackToLevels={handleBackToLevels}
        selectedLevel={selectedLevel}
      />

      {showSettingsAndScores && (
        <SettingsAndScores
          gameType={gameType}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          typesCount={typesCount}
          currentMusic={currentMusic}
          records={scoreRecords}
          onSettingsChange={handleSettingsChange}
          onClose={() => setShowSettingsAndScores(false)}
          onClearRecords={clearRecords}
          loadNewMusic={loadNewMusic}
          godMode={godMode}
        />
      )}

      {!isFirstGame && (
        <div className="game-stage-container">
          <Stage
            width={(gridWidth + 2 * OUTER_PADDING) * (TILE_SIZE + TILE_GAP)}
            height={(gridHeight + 2 * OUTER_PADDING) * (TILE_SIZE + TILE_GAP)}
            options={{ backgroundColor: 0x000000, backgroundAlpha: 0 }}
          >
            <Container x={OUTER_PADDING * (TILE_SIZE + TILE_GAP)} y={OUTER_PADDING * (TILE_SIZE + TILE_GAP)}>
              {connectionPath.length > 0 && <ConnectionLine path={connectionPath} gameMode={gameMode} gameType={gameType} />}

              {tiles.map((tile) => {
                const isHighlighted = tile.isSelected || (hintTiles && (hintTiles[0].id === tile.id || hintTiles[1].id === tile.id));
                return (
                  <Container key={tile.id} x={tile.x} y={tile.y}>
                    <CubeTile
                      tile={tile}
                      onTileClick={handleTileClick}
                    />
                    {isHighlighted && (
                      <SelectionEffect
                        gameMode={gameMode}
                        gameType={gameType}
                        isHint={hintTiles?.some(t => t.id === tile.id)}
                      />
                    )}
                  </Container>
                );
              })}
            </Container>
          </Stage>
        </div>
      )}
    </div>
  )
}


const LoadingPage = ({ progress }: { progress: number }) => {
  return (
    <div className="linkGame-container">
      <div className="loading-screen">
        <div className="loading-progress">
          <div className="loading-bar">
            <div
              className="loading-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="loading-text">
            资源加载中 {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  )
}
const ErrorPage = ({ error }: { error: string }) => {
  return (
    <div className="linkGame-container">
      <div className="loading-screen">
        <div className="loading-error">{error}</div>
      </div>
    </div>
  )
}


export default LinkGame

