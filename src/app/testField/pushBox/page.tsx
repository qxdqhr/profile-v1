'use client'
import { useEffect, useRef } from 'react'
import './PushBox.css'
import dynamic from 'next/dynamic'

// 动态导入Phaser和场景组件
const Game = dynamic(
  async () => {
    const { default: Phaser } = await import('phaser')
    const { StartScene } = await import('./scenes/StartScene')
    const { GameScene } = await import('./scenes/GameScene')
    const { SettingsScene } = await import('./scenes/SettingsScene')
    const { LevelSelectScene } = await import('./scenes/LevelSelectScene')

    const PhaserGame = () => {
      const gameContainer = useRef<HTMLDivElement>(null)
      const gameInstance = useRef<Phaser.Game | null>(null)

      useEffect(() => {
        if (gameContainer.current) {
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

    return PhaserGame
  },
  {
    ssr: false, // 禁用服务器端渲染
    loading: () => <div className="game-canvas">Loading game...</div>
  }
)

export default Game