'use client'
import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import styles from './styles/loading.module.css'
import { useGameDataPreload } from './hooks/useGameDataPreload'
import type { GameData } from './types/gameData'
import Phaser from './types/phaser'

// 动态导入Phaser和场景组件
const Game = dynamic(
  async () => {
    const Phaser = (await import('phaser')).default
    const { StartScene } = await import('./scenes/StartScene')
    const { SettingsScene } = await import('./scenes/SettingsScene')
    const { LevelSelectScene } = await import('./scenes/LevelSelectScene')
    const { GameScene } = await import('./scenes/GameScene')

    const PhaserGame = ({ gameData }: { gameData: GameData }) => {
      const gameContainer = useRef<HTMLDivElement>(null)
      const gameInstance = useRef<Phaser.Game | null>(null)

      useEffect(() => {
        if (gameContainer.current) {
          const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: gameContainer.current,
            scene: [StartScene, SettingsScene, LevelSelectScene, GameScene],
            physics: {
              default: 'arcade',
              arcade: { gravity: { x: 0, y: 0 } }
            },
            backgroundColor: '#000000',
          }

          const game = new Phaser.Game(config)
          // 直接设置 gameData 属性
          ;(game as any).gameData = gameData
          gameInstance.current = game
        }

        return () => {
          gameInstance.current?.destroy(true)
          gameInstance.current = null
        }
      }, [gameData])

      return <div ref={gameContainer} className="game-canvas" />
    }

    return PhaserGame
  },
  {
    ssr: false,
    loading: () => (
      <div className={`game-canvas ${styles.loadingContainer}`}>
        <div className={styles.loadingContent}>
          <div className={styles.hookAnimation}>
            <div className={styles.hookLine} />
          </div>
          <div className={styles.loadingText}>
            加载游戏中...
          </div>
        </div>
      </div>
    )
  }
)

const GameWrapper = () => {
  const { gameData, isLoading, error } = useGameDataPreload()

  if (error) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingText} style={{ color: '#ff4444' }}>
            加载失败: {error}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || !gameData) {
    return (
      <div className={`game-canvas ${styles.loadingContainer}`}>
        <div className={styles.loadingContent}>
          <div className={styles.hookAnimation}>
            <div className={styles.hookLine} />
          </div>
          <div className={styles.loadingText}>
            加载游戏数据中...
          </div>
        </div>
      </div>
    )
  }

  return <Game gameData={gameData} />
}

export default GameWrapper


