'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Stage, Container } from '@pixi/react'
import { TileSprite } from './components/TileSprite'
import { SelectionEffect, ConnectionLine } from './components/Effects'
import { GameInfo, MusicControl } from './components/UI'
import { initializeBoard, canConnect } from './gameLogic'
import { Tile, PathPoint, GRID_SIZE, TILE_SIZE, OUTER_PADDING } from './types'
import './LinkGame.css'

const LinkGame = () => {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [score, setScore] = useState(0)
  const [connectionPath, setConnectionPath] = useState<PathPoint[]>([])
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isFirstClick, setIsFirstClick] = useState(true)
  const [isMusicLoaded, setIsMusicLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/linkGame/mp3/VivalaVida.mp3')
    audioRef.current.loop = true
    
    // 监听音乐加载完成事件
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
    }
  }, [])

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

  useEffect(() => {
    setTiles(initializeBoard())
  }, [])

  return (
    <div className="linkGame-container">
      <div className="game-header">
        <GameInfo score={score} onRestart={() => setTiles(initializeBoard())} />
        <MusicControl 
          isPlaying={isMusicPlaying} 
          onToggle={toggleMusic} 
          disabled={!isMusicLoaded}
        />
      </div>
      
      <Stage
        width={(GRID_SIZE + 2 * OUTER_PADDING) * TILE_SIZE}
        height={(GRID_SIZE + 2 * OUTER_PADDING) * TILE_SIZE}
        options={{ backgroundColor: 0xf0f0f0 }}
      >
        <Container x={OUTER_PADDING * TILE_SIZE} y={OUTER_PADDING * TILE_SIZE}>
          {connectionPath.length > 0 && <ConnectionLine path={connectionPath} />}
          
          {tiles.map((tile) => (
            <Container key={tile.id} x={tile.x} y={tile.y}>
              {tile.isSelected && <SelectionEffect />}
              <TileSprite tile={tile} onTileClick={handleTileClick} />
            </Container>
          ))}
        </Container>
      </Stage>
    </div>
  )
}

export default LinkGame

