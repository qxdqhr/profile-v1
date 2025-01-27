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
  onSettingsClick
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
    <div className="game-info">
      <h1>连连看</h1>
      <div className="game-stats">
        <p>得分: {score}</p>
      </div>
      <div className="time-container">
        <p className={isTimeWarning ? 'time-warning' : ''}>
          剩余时间: {formatTime(timeLeft)}
        </p>
        <div className="progress-bar-container">
          <div 
            className={`progress-bar ${isTimeWarning ? 'warning' : ''}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      <div className="game-controls">
        <button onClick={onRestart}>
          {isFirstGame ? '开始游戏' : '重新开始'}
        </button>
        {!isFirstGame && gameStatus === 'playing' && (
          <button onClick={onHint} className="hint-button">
            提示
          </button>
        )}
        <button onClick={onSettingsClick}>
          设置
        </button>
      </div>
      {!isFirstGame && (
        <div className="game-mode-selector">
          <button 
            className={`mode-button ${gameType === 'disvariable' ? 'active' : ''} ${(isChanging || isAnimating) ? 'disabled' : ''}`}
            onClick={() => handleModeChange('disvariable')}
            disabled={isChanging || isAnimating}
          >
            静态模式
          </button>
          <button 
            className={`mode-button ${gameType === 'downfalling' ? 'active' : ''} ${(isChanging || isAnimating) ? 'disabled' : ''}`}
            onClick={() => handleModeChange('downfalling')}
            disabled={isChanging || isAnimating}
          >
            下落模式
          </button>
          <button 
            className={`mode-button ${gameType === 'upfalling' ? 'active' : ''} ${(isChanging || isAnimating) ? 'disabled' : ''}`}
            onClick={() => handleModeChange('upfalling')}
            disabled={isChanging || isAnimating}
          >
            上升模式
          </button>
          <button 
            className={`mode-button ${gameType === 'leftfalling' ? 'active' : ''} ${(isChanging || isAnimating) ? 'disabled' : ''}`}
            onClick={() => handleModeChange('leftfalling')}
            disabled={isChanging || isAnimating}
          >
            左移模式
          </button>
          <button 
            className={`mode-button ${gameType === 'rightfalling' ? 'active' : ''} ${(isChanging || isAnimating) ? 'disabled' : ''}`}
            onClick={() => handleModeChange('rightfalling')}
            disabled={isChanging || isAnimating}
          >
            右移模式
          </button>
          <button 
            className={`mode-button ${gameType === 'leftrightsplit' ? 'active' : ''} ${(isChanging || isAnimating) ? 'disabled' : ''}`}
            onClick={() => handleModeChange('leftrightsplit')}
            disabled={isChanging || isAnimating}
          >
            左右分散模式
          </button>
          <button 
            className={`mode-button ${gameType === 'updownsplit' ? 'active' : ''} ${(isChanging || isAnimating) ? 'disabled' : ''}`}
            onClick={() => handleModeChange('updownsplit')}
            disabled={isChanging || isAnimating}
          >
            上下分散模式
          </button>
          <button 
            className={`mode-button ${gameType === 'clockwise' ? 'active' : ''} ${(isChanging || isAnimating) ? 'disabled' : ''}`}
            onClick={() => handleModeChange('clockwise')}
            disabled={isChanging || isAnimating}
          >
            顺时针旋转模式
          </button>
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