'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Stage, Container } from '@pixi/react'
import { CubeTile } from './components/CubeTile'
import { SelectionEffect, ConnectionLine } from './components/Effects'
import { GameInfo, MusicControl } from './components/UI'
import { Settings } from './components/Settings'
import { canConnect } from './gameLogic'
import { TYPES_COUNT, TILE_SIZE, TILE_GAP, OUTER_PADDING, Tile, GameMode, GameType } from './types'
import { useGameState } from './hooks/useGameState'
import { useMusic } from './hooks/useMusic'
import { useHint } from './hooks/useHint'
import { useFallingAnimation } from './hooks/useFallingAnimation'
import './LinkGame.css'

const LinkGame = () => {
  const [hintClearer, setHintClearer] = useState<() => void>(() => () => {})
  const [showSettings, setShowSettings] = useState(false)
  const [gridWidth, setGridWidth] = useState(10)
  const [gridHeight, setGridHeight] = useState(8)
  const [typesCount, setTypesCount] = useState(TYPES_COUNT)
  const [gameMode, setGameMode] = useState<GameMode>('cube')
  
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
    handleRestart,
    handleShuffle,
    shuffleCount,
    noMatchesFound,
    handleFirstClick
  } = useGameState(() => hintClearer(), gridWidth, gridHeight, typesCount)

  const {
    isMusicPlaying,
    isMusicLoaded,
    startBackgroundMusic,
    toggleMusic
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

  // 更新 hintClearer
  useEffect(() => {
    setHintClearer(() => clearHint)
  }, [clearHint])

  const handleSettingsChange = (settings: {
    gameType?: GameType
    gridWidth?: number
    gridHeight?: number
    typesCount?: number
  }) => {
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

  const handleSettingsClose = () => {
    // 检查设置是否有变化
    const hasChanges = 
      settingsRef.current.gameType !== gameType ||
      settingsRef.current.gridWidth !== gridWidth ||
      settingsRef.current.gridHeight !== gridHeight ||
      settingsRef.current.typesCount !== typesCount

    // 更新设置参考值
    settingsRef.current = {
      gameType,
      gridWidth,
      gridHeight,
      typesCount
    }

    // 如果有变化且游戏已经开始过，则重新开始游戏
    if (hasChanges && !isFirstGame) {
      handleRestart()
    }

    setShowSettings(false)
  }

  // 打开设置时保存当前值
  const handleSettingsOpen = () => {
    settingsRef.current = {
      gameType,
      gridWidth,
      gridHeight,
      typesCount
    }
    setShowSettings(true)
  }

  const handleTileClick = (tile: Tile) => {
    if (gameStatus !== 'playing') return
    
    // 处理第一次点击
    handleFirstClick();

    // 清除提示状态
    clearHint()
    
    if (selectedTile === null) {
      // 选中第一个方块
      setSelectedTile(tile);
      const newTiles = tiles.map(t => 
        t.id === tile.id ? { ...t, isSelected: true } : t
      );
      setTiles(newTiles);
    } else {
      if (selectedTile.id === tile.id) {
        setTiles(tiles.map(t => ({
          ...t,
          isSelected: false
        })))
        setSelectedTile(null)
        setConnectionPath([])
      } else {
        const result = canConnect(selectedTile, tile, tiles)
        if (tile.type === selectedTile.type && result.canConnect) {
          setTiles(tiles.map(t => ({
            ...t,
            isSelected: false,
            isMatched: t.id === tile.id || t.id === selectedTile.id ? true : t.isMatched
          })))
          setScore(score + 10)
          setSelectedTile(null)
          setConnectionPath(result.path)
          
          setTimeout(() => {
            setConnectionPath([])
          }, 300)
        } else {
          setTiles(tiles.map(t => ({
            ...t,
            isSelected: t.id === tile.id
          })))
          setSelectedTile(tile)
          setConnectionPath([])
        }
      }
    }
  }

  return (
    <div className="linkGame-container">
      <div className="game-header">
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
          onSettingsClick={handleSettingsOpen}
          onShuffle={handleShuffle}
          shuffleCount={shuffleCount}
          noMatchesFound={noMatchesFound}
          isMusicPlaying={isMusicPlaying} 
          onToggle={toggleMusic} 
          disabled={!isMusicLoaded}
        />
      </div>
      
      {showSettings && (
        <div className="settings-overlay">
          <Settings
            gameType={gameType}
            gridWidth={gridWidth}
            gridHeight={gridHeight}
            typesCount={typesCount}
            onSettingsChange={handleSettingsChange}
            onClose={handleSettingsClose}
          />
        </div>
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

export default LinkGame

