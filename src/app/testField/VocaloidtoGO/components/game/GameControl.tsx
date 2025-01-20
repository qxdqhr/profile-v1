import React from 'react';
import { twMerge } from 'tailwind-merge';
import { useGameStore } from '../../store';
// import '@/styles/testField/VocaloidtoGO/components/game/game-control.css';

interface GameControlProps {
    className?: string;
}

export const GameControl: React.FC<GameControlProps> = ({ className }) => {
    const { session, settings, startGame, pauseGame, resumeGame, resetSession } = useGameStore();

    const handleStart = () => {
        if (!session.currentSong) return;
        startGame(session.currentSong.id);
    };

    const handlePause = () => {
        if (session.isPlaying) {
            pauseGame();
        } else {
            resumeGame();
        }
    };

    const handleReset = () => {
        resetSession();
    };

    return (
        <div className={twMerge('game-control', className)}>
            <div className="game-control-info">
                <div className="game-control-score">
                    分数: {session.progress.score}
                </div>
                <div className="game-control-combo">
                    连击: {session.progress.combo}
                </div>
                <div className="game-control-accuracy">
                    准确率: {
                        session.progress.correctWords.length + session.progress.wrongWords.length > 0
                            ? Math.round(
                                (session.progress.correctWords.length /
                                    (session.progress.correctWords.length + session.progress.wrongWords.length)) *
                                    100
                            )
                            : 0
                    }%
                </div>
            </div>
            
            <div className="game-control-buttons">
                <button
                    className="game-control-button"
                    onClick={handleStart}
                    disabled={!session.currentSong || session.isPlaying}
                >
                    开始
                </button>
                <button
                    className="game-control-button"
                    onClick={handlePause}
                    disabled={!session.currentSong}
                >
                    {session.isPlaying ? '暂停' : '继续'}
                </button>
                <button
                    className="game-control-button"
                    onClick={handleReset}
                    disabled={!session.currentSong}
                >
                    重置
                </button>
            </div>

            <div className="game-control-settings">
                <label className="game-control-setting">
                    <input
                        type="checkbox"
                        checked={settings.showReading}
                        onChange={(e) => useGameStore.setState({
                            settings: { ...settings, showReading: e.target.checked }
                        })}
                    />
                    显示假名
                </label>
                <label className="game-control-setting">
                    <input
                        type="checkbox"
                        checked={settings.showTranslation}
                        onChange={(e) => useGameStore.setState({
                            settings: { ...settings, showTranslation: e.target.checked }
                        })}
                    />
                    显示翻译
                </label>
                <label className="game-control-setting">
                    <input
                        type="checkbox"
                        checked={settings.autoPlay}
                        onChange={(e) => useGameStore.setState({
                            settings: { ...settings, autoPlay: e.target.checked }
                        })}
                    />
                    自动播放
                </label>
            </div>
        </div>
    );
}; 