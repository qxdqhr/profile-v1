import styles from '../StudyMusic.module.css';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentLine: number;
  totalLines: number;
  onTogglePlay: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export default function PlayerControls({ 
  isPlaying, 
  currentLine, 
  totalLines, 
  onTogglePlay,
  onPrevious,
  onNext
}: PlayerControlsProps) {
  return (
    <div className={styles.controlsContainer}>
      <div className={styles.progressBar}>
        <div 
          className={styles.progress} 
          style={{ width: `${(currentLine / (totalLines - 1)) * 100}%` }}
        ></div>
      </div>
      
      <div className={styles.controls}>
        <button 
          className={styles.controlButton} 
          onClick={onPrevious}
          disabled={!onPrevious}
        >
          <span>⏮️</span>
        </button>
        <button className={styles.playButton} onClick={onTogglePlay}>
          <span>{isPlaying ? "⏸️" : "▶️"}</span>
        </button>
        <button 
          className={styles.controlButton} 
          onClick={onNext}
          disabled={!onNext}
        >
          <span>⏭️</span>
        </button>
      </div>
    </div>
  );
} 