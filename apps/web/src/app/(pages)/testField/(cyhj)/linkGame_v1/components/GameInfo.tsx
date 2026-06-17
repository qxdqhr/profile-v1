import React from 'react'
import { GameStatus, GameType, Level } from '../constant/types'
import { GAME_DURATION, SHUFFLE_COUNT } from '../constant/const'
import { useState, useCallback } from 'react'

interface GameInfoProps {
  score: number
  timeLeft: number
  gameStatus: GameStatus
  isFirstGame: boolean
  gameType: GameType
  onRestart: () => void
  onHint: () => void
  onGameTypeChange: (type: GameType) => void
  isAnimating: boolean
  onSettingsClick: () => void
  onShuffle: () => void
  shuffleCount: number
  noMatchesFound: boolean
  isMusicPlaying: boolean
  onToggle: () => void
  disabled: boolean
  startBackgroundMusic: () => void
  currentMusic: { name: string; path: string } | null
  godMode: boolean
  onBackToLevels: () => void
  selectedLevel: Level
}

export const GameInfo: React.FC<GameInfoProps> = ({
  score,
  timeLeft,
  gameStatus,
  isFirstGame,
  gameType,
  onRestart,
  onHint,
  onGameTypeChange,
  isAnimating,
  onSettingsClick,
  onShuffle,
  shuffleCount,
  noMatchesFound,
  isMusicPlaying,
  onToggle,
  disabled,
  startBackgroundMusic,
  currentMusic,
  godMode,
  onBackToLevels,
  selectedLevel
}) => {
  const [isChanging, setIsChanging] = useState(false)

  const handleModeChange = useCallback((type: GameType) => {
    if (isChanging || type === gameType || isAnimating) return

    setIsChanging(true)
    onGameTypeChange(type)

    // 1秒冷却时间
    setTimeout(() => {
      setIsChanging(false)
    }, 1000)
  }, [isChanging, gameType, onGameTypeChange, isAnimating])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = (timeLeft / GAME_DURATION) * 100
  const isTimeWarning = timeLeft <= 10

  return (
    <div className="game-header">
      <div className="game-info">
        <h1>葱韵环京连连看 - {selectedLevel.name}
          <span className="subtitle">
            Created by 焦糖布丁忆梦梦 皋月朔星
          </span>
        </h1>
        <div className="game-stats">
          <div className="stat-widget score">
            <div className="label">得分</div>
            <div className="value">{score}</div>
          </div>
          {!isFirstGame && gameStatus === GameStatus.Playing && (
            <div className="stat-widget shuffle">
              <div className="label">剩余洗牌</div>
              <div className="value">{SHUFFLE_COUNT - shuffleCount}</div>
            </div>
          )}
          <div className={`stat-widget time ${isTimeWarning ? 'warning' : ''}`}>
            <div className="label">剩余时间</div>
            <div className="value">{formatTime(timeLeft)}</div>
          </div>
        </div>
        <div className="progress-bar-container">
          <div
            className={`progress-bar ${isTimeWarning ? 'warning' : ''}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="game-controls">
          <button onClick={() => {
            onRestart();
            startBackgroundMusic();
          }}>
            {isFirstGame ? '开始游戏' : '重新开始'}
          </button>
          {!isFirstGame && gameStatus === GameStatus.Playing && (
            <>
              {godMode && (
                <select
                  className="game-type-select"
                  value={gameType}
                  onChange={(e) => onGameTypeChange(e.target.value as GameType)}
                  disabled={isAnimating}
                >
                  <option value="disvariable">经典模式</option>
                  <option value="downfalling">向下掉落</option>
                  <option value="upfalling">向上浮动</option>
                  <option value="leftrightsplit">左右分裂</option>
                  <option value="updownsplit">上下分裂</option>
                  <option value="clockwise">顺时针旋转</option>
                  <option value="counterclockwise">逆时针旋转</option>
                </select>
              )}
              <button
                className="shuffle-button"
                onClick={onShuffle}
                disabled={gameStatus !== GameStatus.Playing || shuffleCount >= SHUFFLE_COUNT}
                style={{ opacity: 1 }}
              >
                洗牌 ({SHUFFLE_COUNT - shuffleCount})
              </button>
              <button
                className="hint-button"
                onClick={onHint}
                disabled={gameStatus !== GameStatus.Playing}
                style={{ opacity: 1 }}
              >
                提示
              </button>
              <button
                className="music-button"
                onClick={onToggle}
                disabled={disabled}
              >
                {isMusicPlaying ? '🔊 暂停' : '🔈 播放'}
              </button>
              <button
                className="back-button"
                onClick={onBackToLevels}
              >
                返回选关
              </button>
              <button onClick={onSettingsClick}>
                记录&设置
              </button>
            </>
          )}
        </div>
        {noMatchesFound && shuffleCount >= SHUFFLE_COUNT && (
          <div className="no-matches-warning">
            没有可配对的方块了，且无洗牌次数
          </div>
        )}
        {gameStatus !== GameStatus.Playing && (
          <div className={`game-result ${gameStatus}`}>
            <h2>{gameStatus === GameStatus.Success ? '恭喜过关！' : '游戏结束'}</h2>
            <p>最终得分: {score}</p>
          </div>
        )}
      </div>
    </div>

  )
}