export const GameInfo = ({ score, onRestart }: { score: number, onRestart: () => void }) => (
  <div className="game-info">
    <h1>连连看</h1>
    <p>得分: {score}</p>
    <button onClick={onRestart}>重新开始</button>
  </div>
)

export const MusicControl = ({ isPlaying, onToggle }: { isPlaying: boolean, onToggle: () => void }) => (
  <div className="music-control">
    <button onClick={onToggle}>
      {isPlaying ? '🔊 暂停音乐' : '🔈 播放音乐'}
    </button>
  </div>
) 