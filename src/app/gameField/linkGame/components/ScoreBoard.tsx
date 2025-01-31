import React from 'react';
import { ScoreRecord } from '../types';

interface ScoreBoardProps {
    records: ScoreRecord[];
    onClose: () => void;
    onClear: () => void;
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

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ records, onClose, onClear }) => {
    return (
        <div className="settings-overlay">
            <div className="settings-panel score-panel">
                <div className="settings-header">
                    <h2>得分记录</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="settings-content">
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
                                                <span className="score-value">{record.score}分</span>
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
                                <button className="clear-records" onClick={onClear}>
                                    清除记录
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}; 