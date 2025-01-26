import { GameStatus } from '../types'

interface GameInfoProps {
  score: number
  timeLeft: number
  gameStatus: GameStatus
  isFirstGame: boolean
  onRestart: () => void
}

export const GameInfo = ({ score, timeLeft, gameStatus, isFirstGame, onRestart }: GameInfoProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="game-info">
      <h1>连连看</h1>
      <div className="game-stats">
        <p>得分: {score}</p>
        <p className={timeLeft <= 30 ? 'time-warning' : ''}>
          剩余时间: {formatTime(timeLeft)}
        </p>
      </div>
      {gameStatus === 'failed' && (
        <div className="game-result failed">
          <h2>游戏失败</h2>
          <p>时间到！请再接再厉</p>
          <button onClick={onRestart}>重新开始</button>
        </div>
      )}
      {gameStatus === 'success' && (
        <div className="game-result success">
          <h2>恭喜通关！</h2>
          <p>得分: {score}</p>
          <button onClick={onRestart}>再来一局</button>
        </div>
      )}
      {gameStatus === 'playing' && (
        <button onClick={onRestart}>
          {isFirstGame ? '开始游戏' : '重新开始'}
        </button>
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