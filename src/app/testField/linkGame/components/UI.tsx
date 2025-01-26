interface GameInfoProps {
  score: number
  onRestart: () => void
}

export const GameInfo = ({ score, onRestart }: GameInfoProps) => (
  <div className="game-info">
    <h1>连连看</h1>
    <p>得分: {score}</p>
    <button onClick={onRestart}>重新开始</button>
  </div>
)

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