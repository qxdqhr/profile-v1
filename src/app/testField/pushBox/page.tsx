'use client'
import 'phaser'
import { useEffect, useRef } from 'react'
import './PushBox.css'
import { StartScene } from './scenes/StartScene'
import { GameScene } from './scenes/GameScene'
import { SettingsScene } from './scenes/SettingsScene'
import { LevelSelectScene } from './scenes/LevelSelectScene'

export default function PhaserGame() {
  const gameContainer = useRef<HTMLDivElement>(null)
  const gameInstance = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && gameContainer.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameContainer.current,
        scene: [StartScene, GameScene, SettingsScene, LevelSelectScene],
        physics: {
          default: 'arcade',
          arcade: { gravity: { x: 0, y: 0 } }
        },
        backgroundColor: '#000000',
      }

      gameInstance.current = new Phaser.Game(config)
    }

    return () => {
      gameInstance.current?.destroy(true)
      gameInstance.current = null
    }
  }, [])

  return <div ref={gameContainer} className="game-canvas" />
}