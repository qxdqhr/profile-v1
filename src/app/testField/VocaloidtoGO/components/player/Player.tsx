import React from 'react';
import { twMerge } from 'tailwind-merge';
import { useGameStore } from '../../store';
import { formatTime } from '../../utils';

interface PlayerProps {
    className?: string;
    onSettingsClick?: () => void;
}

export const Player: React.FC<PlayerProps> = ({ 
    className,
    onSettingsClick 
}) => {
    const { session } = useGameStore();

    const handleSettingsClick = () => {
        onSettingsClick?.();
    };

    return (
        <div className={twMerge('player', className)}>
            <div className="player-container">
                <div className="player-main">
                    <div className="player-info">
                        <div className="player-song-title">
                            {session.currentSong?.title || '未选择歌曲'}
                        </div>
                        <div className="player-artist">
                            {session.currentSong?.artist || '-'}
                        </div>
                    </div>

                    <div className="player-controls">
                        <button
                            className="player-control-btn"
                            onClick={() => session.isPlaying ? useGameStore.getState().pauseGame() : useGameStore.getState().resumeGame()}
                            disabled={!session.currentSong}
                        >
                            {session.isPlaying ? '暂停' : '播放'}
                        </button>
                    </div>

                    <div className="player-progress">
                        <div className="player-time">00:00</div>
                        <div className="player-progress-bar">
                            <div className="player-progress-track" />
                            <div 
                                className="player-progress-current"
                                style={{ width: '0%' }}
                            />
                        </div>
                        <div className="player-time">
                            {session.currentSong ? formatTime(session.currentSong.duration) : '00:00'}
                        </div>
                    </div>

                    <div className="player-volume">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            defaultValue="100"
                            className="player-volume-slider"
                        />
                    </div>

                    <button
                        className="player-settings-btn"
                        onClick={handleSettingsClick}
                        aria-label="打开设置"
                    >
                        设置
                    </button>
                </div>
            </div>
        </div>
    );
}; 