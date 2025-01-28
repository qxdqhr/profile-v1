import React from 'react'
import { GameStatus, GAME_DURATION, GameType } from '../types'
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
  loadNewMusic: () => void
  currentMusic: { name: string; path: string } | null
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
  loadNewMusic,
  currentMusic
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

  const gameTypes: GameType[] = [
    'disvariable',
    'downfalling',
    'upfalling',
    'leftfalling',
    'rightfalling',
    'leftrightsplit',
    'updownsplit',
    'clockwise',
    'counterclockwise'
  ]

  const getGameTypeName = (type: GameType): string => {
    const typeMap: Record<GameType, string> = {
      disvariable: '不变化',
      downfalling: '向下掉落',
      upfalling: '向上移动',
      leftfalling: '向左移动',
      rightfalling: '向右移动',
      leftrightsplit: '左右分离',
      updownsplit: '上下分离',
      clockwise: '顺时针',
      counterclockwise: '逆时针'
    }
    return typeMap[type]
  }

  return (
    <div className="game-info">
      <h1>葱韵环京连连看</h1>
      <div className="game-stats">
        <div className="stat-widget score">
          <div className="label">得分</div>
          <div className="value">{score}</div>
        </div>
        {!isFirstGame && gameStatus === 'playing' && (
          <div className="stat-widget shuffle">
            <div className="label">剩余洗牌</div>
            <div className="value">{3 - shuffleCount}</div>
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
        <select
          className="game-type-select"
          value={gameType}
          onChange={(e) => onGameTypeChange(e.target.value as GameType)}
          disabled={isAnimating}
        >
          {gameTypes.map((type) => (
            <option key={type} value={type}>
              {getGameTypeName(type)}
            </option>
          ))}
        </select>
        <button onClick={() => {
          loadNewMusic();
          onRestart();
          startBackgroundMusic();
        }}>
          {isFirstGame ? '开始游戏' : '重新开始'}
        </button>
        {!isFirstGame && gameStatus === 'playing' && (
          <>
            <button 
              className="shuffle-button"
              onClick={onShuffle} 
              disabled={gameStatus !== 'playing' || isAnimating || shuffleCount >= 3}
            >
              洗牌 ({3 - shuffleCount})
            </button>
            <button 
              className="hint-button"
              onClick={onHint}
              disabled={gameStatus !== 'playing' || isAnimating}
            >
              提示
            </button>
          </>
        )}
        <button 
          className="music-button"
          onClick={onToggle} 
          disabled={disabled}
        >
          {isMusicPlaying ? `🔊 ${currentMusic?.name || '暂停'}` : '🔈 播放'}
        </button>
        <button onClick={onSettingsClick}>
          设置
        </button>
      </div>
      {noMatchesFound && shuffleCount >= 3 && (
        <div className="no-matches-warning">
          没有可配对的方块了，且无洗牌次数
        </div>
      )}
      {gameStatus !== 'playing' && (
        <div className={`game-result ${gameStatus}`}>
          <h2>{gameStatus === 'success' ? '恭喜过关！' : '游戏结束'}</h2>
          <p>最终得分: {score}</p>
        </div>
      )}
    </div>
  )
}

interface MusicControlProps {
  isPlaying: boolean
  onToggle: () => void
  disabled?: boolean
}

export const MusicControl = ({ isPlaying, onToggle, disabled }: MusicControlProps) => (
  <div className="music-control">
    <button onClick={onToggle} disabled={disabled}>
      {isPlaying ? '🔊 暂停音乐' : '🔈 播放音乐'}
    </button>
  </div>
) 