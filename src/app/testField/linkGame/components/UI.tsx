import { GameStatus, GAME_DURATION, GameType } from '../types'

interface GameInfoProps {
  score: number
  timeLeft: number
  gameStatus: GameStatus
  isFirstGame: boolean
  gameType: GameType
  onRestart: () => void
  onHint: () => void
  onGameTypeChange: (type: GameType) => void
}

export const GameInfo = ({ 
  score, 
  timeLeft, 
  gameStatus, 
  isFirstGame, 
  gameType,
  onRestart, 
  onHint,
  onGameTypeChange 
}: GameInfoProps) => {
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
      </div>
      {!isFirstGame && (
        <div className="game-mode-selector">
          <button 
            className={`mode-button ${gameType === 'disvariable' ? 'active' : ''}`}
            onClick={() => onGameTypeChange('disvariable')}
          >
            静态模式
          </button>
          <button 
            className={`mode-button ${gameType === 'downfalling' ? 'active' : ''}`}
            onClick={() => onGameTypeChange('downfalling')}
          >
            下落模式
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