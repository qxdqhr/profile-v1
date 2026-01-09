'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Application, extend } from '@pixi/react'
import { Container } from 'pixi.js'
import { CubeTile } from './components/CubeTile'
import { SelectionEffect } from './components/SelectionEffect'
import { ConnectionLine } from './components/ConnectionLine'
import { GameInfo } from './components/GameInfo'
import { useGameLogic } from './hooks/useGameLogic'
import { Tile, GameMode, GameType, Level, GameSettings, GameStatus } from './constant/types'
import { useGameState } from './hooks/useGameState'
import { useMusic } from './hooks/useMusic'
import { useHint } from './hooks/useHint'
import { useFallingAnimation } from './hooks/useFallingAnimation'
import { useSoundEffects } from './hooks/useSoundEffects'
import { useScoreRecord } from './hooks/useScoreRecord'
import { SettingsAndScores } from './components/SettingsAndScores'
import LevelSelect from './components/LevelSelect'
import { useResourcePreload } from './hooks/useResourcePreload'
import { SHUFFLE_COUNT, TYPES_COUNT, TILE_SIZE, TILE_GAP, OUTER_PADDING, TIMEOUT_DURATION, ONE_MATCH_SCORE, REMAIN_TIME_SCORE } from './constant/const'
import './LinkGame.css'

// 注册 PixiJS 组件
extend({ Container })

const LinkGame = () => {
  const { canConnect, hasMatchablePairs } = useGameLogic()
  const [hintClearer, setHintClearer] = useState<() => void>(() => () => { })
  const [showSettingsAndScores, setShowSettingsAndScores] = useState(false)
  const [gridWidth, setGridWidth] = useState(10)
  const [gridHeight, setGridHeight] = useState(8)
  const [typesCount, setTypesCount] = useState(TYPES_COUNT)
  const [gameMode, setGameMode] = useState(GameMode.Cube)
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [godMode, setGodMode] = useState(false)

  // 跟踪设置变化
  const settingsRef = useRef({
    gameType: GameType.DisVariable,
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
    if (gameStatus === GameStatus.Playing) {
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
    if (gameStatus !== GameStatus.Playing) return

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
    }
    // 选中了已选中的方块，取消选中
    else if (selectedTile && selectedTile.id === tile.id) {
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
      setScore(score + ONE_MATCH_SCORE)
      setConnectionPath(result.path)

      setTimeout(() => {
        setConnectionPath([])
      }, TIMEOUT_DURATION)
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
    if (gameStatus !== GameStatus.Playing || tiles.length === 0 || isFirstGame) return

    // 检查是否全部匹配完成
    if (tiles.every(tile => tile.isMatched)) {
      // 先停止计时器
      stopTimer()
      // 计算最终得分：基础分数 + 剩余时间加分
      const finalScore = score + timeLeft * REMAIN_TIME_SCORE
      // 添加得分记录
      addScoreRecord(finalScore, gameType, gridWidth, gridHeight, timeLeft)
      setGameStatus(GameStatus.Success)
      setScore(finalScore) // 更新显示的分数
    }
    // 检查是否时间耗尽
    else if (timeLeft <= 0) {
      stopTimer()
      setGameStatus(GameStatus.Failed)
    }
    // 只有在游戏未完成时才检查是否还有可配对的方块
    else if (!hasMatchablePairs(tiles)) {
      setNoMatchesFound(true)
      // 如果还有洗牌次数，自动洗牌
      if (shuffleCount < SHUFFLE_COUNT) {
        handleShuffle()
      } else {
        // 如果没有洗牌次数且无法配对，游戏结束
        stopTimer()
        setGameStatus(GameStatus.Failed)
      }
    }
    else {
      console.log('gameStatus:', gameStatus)
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

  // 计算舞台尺寸
  const stageWidth = (gridWidth + 2 * OUTER_PADDING) * (TILE_SIZE + TILE_GAP)
  const stageHeight = (gridHeight + 2 * OUTER_PADDING) * (TILE_SIZE + TILE_GAP)

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

  // 处理洗牌按钮点击
  const handleShuffleClick = () => {
    // 先清除动画状态，然后执行洗牌
    clearAnimation();
    setTimeout(() => {
      handleShuffle();
    }, 10); // 短暂延迟，确保动画清除完成
  }

  // 处理提示按钮点击
  const handleHintClick = () => {
    // 先清除动画状态，然后显示提示
    clearAnimation();
    setTimeout(() => {
      handleHint();
    }, 10); // 短暂延迟，确保动画清除完成
  }

  return (
    <div className="linkGame-container">
      <GameInfo
        score={score}
        timeLeft={timeLeft}
        gameStatus={gameStatus}
        isFirstGame={isFirstGame}
        gameType={gameType}
        selectedLevel={selectedLevel}
        currentMusic={currentMusic}
        godMode={godMode}
        isAnimating={isAnimating}
        shuffleCount={shuffleCount}
        noMatchesFound={noMatchesFound}
        isMusicPlaying={isMusicPlaying}
        disabled={!isMusicLoaded}
        onBackToLevels={handleBackToLevels}
        onGameTypeChange={handleGameTypeChange}
        onRestart={handleRestart}
        onHint={handleHintClick}
        onSettingsClick={() => setShowSettingsAndScores(true)}
        onShuffle={handleShuffleClick}
        onToggle={toggleMusic}
        startBackgroundMusic={startBackgroundMusic}
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
          <Application
            width={stageWidth}
            height={stageHeight}
            backgroundAlpha={0}
            resolution={typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1}
            autoDensity={true}
            antialias={true}
          >
            <pixiContainer x={OUTER_PADDING * (TILE_SIZE + TILE_GAP)} y={OUTER_PADDING * (TILE_SIZE + TILE_GAP)}>
              {connectionPath.length > 0 && <ConnectionLine path={connectionPath} />}

              {tiles.map((tile) => {
                const isHighlighted = tile.isSelected || (hintTiles && (hintTiles[0].id === tile.id || hintTiles[1].id === tile.id));
                return (
                  <pixiContainer key={tile.id} x={tile.x} y={tile.y}>
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
                  </pixiContainer>
                );
              })}
            </pixiContainer>
          </Application>
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
