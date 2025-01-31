import React, { useState } from 'react';
import { ScoreRecord, GameType, GameSettings } from '../types';

interface SettingsAndScoresProps {
    gameType: GameType;
    gridWidth: number;
    gridHeight: number;
    typesCount: number;
    currentMusic: { name: string; path: string } | null;
    records: ScoreRecord[];
    godMode: boolean;
    onSettingsChange: (settings: Partial<GameSettings>) => void;
    onClose: () => void;
    onClearRecords: () => void;
    loadNewMusic: () => Promise<void>;
}

const getGameTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
        disvariable: '不变化',
        downfalling: '向下掉落',
        upfalling: '向上移动',
        leftfalling: '向左移动',
        rightfalling: '向右移动',
        leftrightsplit: '左右分离',
        updownsplit: '上下分离',
        clockwise: '顺时针',
        counterclockwise: '逆时针'
    };
    return typeMap[type] || type;
};

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
];

export const SettingsAndScores: React.FC<SettingsAndScoresProps> = ({
    gameType,
    gridWidth,
    gridHeight,
    typesCount,
    currentMusic,
    records,
    godMode,
    onSettingsChange,
    onClose,
    onClearRecords,
    loadNewMusic
}) => {
    const [activeTab, setActiveTab] = useState<'settings' | 'scores'>('settings');
    const [hintClickCount, setHintClickCount] = useState(0);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="settings-overlay" onClick={handleOverlayClick}>
            <div className="settings-panel">
                <div className="settings-header">
                    <div className="tab-buttons">
                        <button 
                            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            设置
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'scores' ? 'active' : ''}`}
                            onClick={() => setActiveTab('scores')}
                        >
                            记录
                        </button>
                    </div>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="settings-content">
                    {activeTab === 'settings' ? (
                        <>
                            <div className="settings-item">
                                <label className="settings-label">
                                    全能模式
                                    <div className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={godMode}
                                            onChange={(e) => onSettingsChange({ godMode: e.target.checked })}
                                            disabled={hintClickCount < 3}
                                        />
                                        <span className={`toggle-slider ${hintClickCount < 3 ? 'disabled' : ''}`}></span>
                                    </div>
                                </label>
                                <p 
                                    className="settings-hint clickable"
                                    onClick={() => {
                                        if (hintClickCount < 3) {
                                            setHintClickCount(prev => prev + 1);
                                        }
                                    }}
                                >
                                    {/* {hintClickCount < 3 
                                        ? `点击解锁全能模式 (${3 - hintClickCount})`
                                        : '开启后可以随时切换游戏模式'
                                    } */}
                                    开启后可以随时切换游戏模式
                                </p>

                            </div>

                            {godMode && (
                                <div className="settings-item">
                                    <label>游戏类型</label>
                                    <select
                                        value={gameType}
                                        onChange={(e) => onSettingsChange({ gameType: e.target.value as GameType })}
                                    >
                                        {gameTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type === 'disvariable' ? '普通模式' :
                                                 type === 'downfalling' ? '向下掉落' :
                                                 type === 'upfalling' ? '向上移动' :
                                                 type === 'leftfalling' ? '向左移动' :
                                                 type === 'rightfalling' ? '向右移动' :
                                                 type === 'leftrightsplit' ? '左右分离' :
                                                 type === 'updownsplit' ? '上下分离' :
                                                 type === 'clockwise' ? '顺时针' :
                                                 '逆时针'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="settings-item grid-settings">
                                <div>
                                    <label>面板宽度</label>
                                    <input
                                        type="number"
                                        min="4"
                                        max="12"
                                        value={gridWidth}
                                        onChange={(e) => onSettingsChange({ gridWidth: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label>面板高度</label>
                                    <input
                                        type="number"
                                        min="4"
                                        max="12"
                                        value={gridHeight}
                                        onChange={(e) => onSettingsChange({ gridHeight: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="settings-item">
                                <label>方块种类数量</label>
                                <input
                                    type="number"
                                    min="3"
                                    max="50"
                                    value={typesCount}
                                    onChange={(e) => onSettingsChange({ typesCount: parseInt(e.target.value) })}
                                    disabled={true}
                                />
                                <p className="settings-hint">建议设置在3-50之间</p>
                            </div>

                            <div className="settings-item">
                                <label>背景音乐</label>
                                <div className="music-settings">
                                    <div className="current-music">
                                        {currentMusic?.name ? `当前音乐：${currentMusic.name}` : '点击右侧按钮选择音乐'}
                                    </div>
                                    <button 
                                        className="change-music-button"
                                        onClick={() => loadNewMusic()}
                                    >
                                        {currentMusic?.name ? '切换音乐' : '选择音乐'}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {records.length === 0 ? (
                                <div className="no-records">暂无记录</div>
                            ) : (
                                <>
                                    <div className="score-list">
                                        {records.map((record, index) => (
                                            <div key={index} className="score-item">
                                                <div className="score-rank">#{index + 1}</div>
                                                <div className="score-info">
                                                    <div className="score-main">
                                                        <span className="score-value">
                                                            {record.score}分
                                                            <span className="score-detail">
                                                                (基础{record.score - record.duration * 2}+时间{record.duration * 2})
                                                            </span>
                                                        </span>
                                                        <span className="score-type">{getGameTypeName(record.gameType)}</span>
                                                        <span className="score-grid">{record.gridSize}</span>
                                                    </div>
                                                    <div className="score-sub">
                                                        <span className="score-time">用时: {300 - record.duration}秒</span>
                                                        <span className="score-date">{record.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="score-actions">
                                        <button className="clear-records" onClick={onClearRecords}>
                                            清除记录
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}; 