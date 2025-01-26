'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Stage, Container } from '@pixi/react'
import { ImageTile } from './components/ImageTile'
import { CubeTile } from './components/CubeTile'
import { SelectionEffect, ConnectionLine } from './components/Effects'
import { GameInfo, MusicControl } from './components/UI'
import { initializeBoard, canConnect } from './gameLogic'
import { Tile, PathPoint, GRID_SIZE, TILE_SIZE, TILE_GAP, OUTER_PADDING, GAME_DURATION, GameStatus, GameMode } from './types'
import './LinkGame.css'

const LinkGame = () => {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [score, setScore] = useState(0)
  const [connectionPath, setConnectionPath] = useState<PathPoint[]>([])
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isFirstClick, setIsFirstClick] = useState(true)
  const [isMusicLoaded, setIsMusicLoaded] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')
  const [gameMode, setGameMode] = useState<GameMode>('text')
  const [isFirstGame, setIsFirstGame] = useState(true)
  const [hintTiles, setHintTiles] = useState<[Tile, Tile] | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/linkGame/mp3/VivalaVida.mp3')
    audioRef.current.loop = true
    
    audioRef.current.addEventListener('canplaythrough', () => {
      setIsMusicLoaded(true)
    })
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('canplaythrough', () => {
          setIsMusicLoaded(true)
        })
        audioRef.current = null
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

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

  useEffect(() => {
    // 检查是否所有图块都已匹配
    if (tiles.length > 0 && tiles.every(tile => tile.isMatched)) {
      setGameStatus('success')
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [tiles])

  const startBackgroundMusic = () => {
    if (audioRef.current && !isMusicPlaying && isMusicLoaded) {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMusicPlaying(true)
          })
          .catch(error => {
            console.log("音乐播放失败:", error)
          })
      }
    }
  }

  const toggleMusic = () => {
    if (audioRef.current && isMusicLoaded) {
      if (isMusicPlaying) {
        audioRef.current.pause()
      } else {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("音乐播放失败:", error)
          })
        }
      }
      setIsMusicPlaying(!isMusicPlaying)
    }
  }

  const handleTileClick = (tile: Tile) => {
    if (gameStatus !== 'playing') return;
    
    if (isFirstClick) {
      startBackgroundMusic()
      setIsFirstClick(false)
    }

    if (tile.isMatched) return;

    if (!selectedTile) {
      setTiles(tiles.map(t => ({
        ...t,
        isSelected: t.id === tile.id
      })));
      setSelectedTile(tile);
      setConnectionPath([]);
    } else {
      if (selectedTile.id === tile.id) {
        setTiles(tiles.map(t => ({
          ...t,
          isSelected: false
        })));
        setSelectedTile(null);
        setConnectionPath([]);
      } else {
        const result = canConnect(selectedTile, tile, tiles);
        if (tile.type === selectedTile.type && result.canConnect) {
          setTiles(tiles.map(t => ({
            ...t,
            isSelected: t.id === tile.id || t.id === selectedTile.id
          })));
          setConnectionPath(result.path);
          
          setTimeout(() => {
            setTiles(tiles.map(t => ({
              ...t,
              isSelected: false,
              isMatched: t.id === tile.id || t.id === selectedTile.id ? true : t.isMatched
            })));
            setScore(score + 10);
            setSelectedTile(null);
            setConnectionPath([]);
          }, 500);
        } else {
          setTiles(tiles.map(t => ({
            ...t,
            isSelected: t.id === tile.id
          })));
          setSelectedTile(tile);
          setConnectionPath([]);
        }
      }
    }
  }

  const handleRestart = () => {
    setTiles(initializeBoard())
    setSelectedTile(null)
    setScore(0)
    setConnectionPath([])
    setTimeLeft(GAME_DURATION)
    setGameStatus('playing')
    setIsFirstClick(true)
    setIsFirstGame(false)
  }

  const findHint = () => {
    // 获取所有未匹配的图块
    const unmatched = tiles.filter(t => !t.isMatched)
    
    // 遍历所有可能的组合
    for (let i = 0; i < unmatched.length; i++) {
      for (let j = i + 1; j < unmatched.length; j++) {
        const tile1 = unmatched[i]
        const tile2 = unmatched[j]
        
        if (tile1.type === tile2.type) {
          const result = canConnect(tile1, tile2, tiles)
          if (result.canConnect) {
            return [tile1, tile2] as [Tile, Tile]
          }
        }
      }
    }
    return null
  }

  const handleHint = () => {
    if (gameStatus !== 'playing' || isFirstGame) return
    
    // 先清除之前的提示
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current)
      setHintTiles(null)
    }
    
    const hint = findHint()
    if (hint) {
      // 强制更新所有图块的状态
      setTiles(prevTiles => prevTiles.map(tile => ({
        ...tile,
        isSelected: false // 清除之前的选中状态
      })))
      
      // 设置新的提示
      setHintTiles(hint)
      
      // 3秒后清除提示
      hintTimeoutRef.current = setTimeout(() => {
        setHintTiles(null)
      }, 3000)
    }
  }

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="linkGame-container">
      <div className="game-header">
        <GameInfo 
          score={score} 
          timeLeft={timeLeft}
          gameStatus={gameStatus}
          isFirstGame={isFirstGame}
          onRestart={handleRestart} 
          onHint={handleHint}
        />
        <MusicControl 
          isPlaying={isMusicPlaying} 
          onToggle={toggleMusic} 
          disabled={!isMusicLoaded}
        />
      </div>
      
      {!isFirstGame && (
      <Stage
        width={(GRID_SIZE + 2 * OUTER_PADDING) * (TILE_SIZE + TILE_GAP)}
        height={(GRID_SIZE + 2 * OUTER_PADDING) * (TILE_SIZE + TILE_GAP)}
        options={{ backgroundColor: 0xf0f0f0 }}
      >
        <Container x={OUTER_PADDING * (TILE_SIZE + TILE_GAP)} y={OUTER_PADDING * (TILE_SIZE + TILE_GAP)}>
          {connectionPath.length > 0 && <ConnectionLine path={connectionPath} gameMode={gameMode} />}
          
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
                    isHint={hintTiles?.some(t => t.id === tile.id)}
                  />
                )}
              </Container>
            );
          })}
        </Container>
      </Stage>
      )}
    </div>
  )
}

export default LinkGame

