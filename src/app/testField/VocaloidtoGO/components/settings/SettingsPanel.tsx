import React from 'react';
import { twMerge } from 'tailwind-merge';
import { useGameStore } from '../../store';
import { GameMode } from '../../types';
// import '@/app/testField/VocaloidtoGO/styles/components/settings/settings-panel.css';

interface SettingsPanelProps {
    className?: string;
    onClose?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    className,
    onClose 
}) => {
    const { settings, updateSettings } = useGameStore();

    const handleModeChange = (mode: GameMode) => {
        updateSettings({ mode });
    };

    const handleSpeedChange = (speed: number) => {
        updateSettings({ playbackSpeed: Math.max(0.5, Math.min(2.0, speed)) });
    };

    const handleToggle = (key: keyof typeof settings) => {
        updateSettings({ [key]: !settings[key] });
    };

    return (
        <div className={twMerge('settings-panel', className)}>
            <div className="settings-header">
                <h2 className="settings-title">游戏设置</h2>
                {onClose && (
                    <button 
                        className="settings-close-btn"
                        onClick={onClose}
                        aria-label="关闭设置"
                    >
                        ×
                    </button>
                )}
            </div>

            <div className="settings-section">
                <h3 className="settings-section-title">游戏模式</h3>
                <div className="settings-mode-buttons">
                    <button
                        className={twMerge(
                            'settings-mode-btn',
                            settings.mode === 'practice' && 'settings-mode-btn-active'
                        )}
                        onClick={() => handleModeChange('practice')}
                    >
                        练习模式
                    </button>
                    <button
                        className={twMerge(
                            'settings-mode-btn',
                            settings.mode === 'challenge' && 'settings-mode-btn-active'
                        )}
                        onClick={() => handleModeChange('challenge')}
                    >
                        挑战模式
                    </button>
                    <button
                        className={twMerge(
                            'settings-mode-btn',
                            settings.mode === 'review' && 'settings-mode-btn-active'
                        )}
                        onClick={() => handleModeChange('review')}
                    >
                        复习模式
                    </button>
                </div>
            </div>

            <div className="settings-section">
                <h3 className="settings-section-title">播放设置</h3>
                <div className="settings-option">
                    <label className="settings-label">
                        播放速度: {settings.playbackSpeed}x
                    </label>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={settings.playbackSpeed}
                        onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                        className="settings-slider"
                    />
                </div>
                <div className="settings-option">
                    <label className="settings-label">
                        <input
                            type="checkbox"
                            checked={settings.autoPlay}
                            onChange={() => handleToggle('autoPlay')}
                            className="settings-checkbox"
                        />
                        自动播放下一首
                    </label>
                </div>
            </div>

            <div className="settings-section">
                <h3 className="settings-section-title">显示设置</h3>
                <div className="settings-option">
                    <label className="settings-label">
                        <input
                            type="checkbox"
                            checked={settings.showReading}
                            onChange={() => handleToggle('showReading')}
                            className="settings-checkbox"
                        />
                        显示假名注音
                    </label>
                </div>
                <div className="settings-option">
                    <label className="settings-label">
                        <input
                            type="checkbox"
                            checked={settings.showTranslation}
                            onChange={() => handleToggle('showTranslation')}
                            className="settings-checkbox"
                        />
                        显示中文翻译
                    </label>
                </div>
            </div>

            <div className="settings-footer">
                <p className="settings-tip">
                    提示: 在练习模式下，您可以随时查看假名和翻译
                </p>
            </div>
        </div>
    );
}; 