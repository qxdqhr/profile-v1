import React from 'react'
import { GameType } from '../types'

interface SettingsProps {
    gameType: GameType
    gridWidth: number
    gridHeight: number
    typesCount: number
    currentMusic: { name: string; path: string } | null
    loadNewMusic: () => void
    onSettingsChange: (settings: {
        gameType?: GameType
        gridWidth?: number
        gridHeight?: number
        typesCount?: number
    }) => void
    onClose: () => void
}

export const Settings: React.FC<SettingsProps> = ({
    gameType,
    gridWidth,
    gridHeight,
    typesCount,
    currentMusic,
    loadNewMusic,
    onSettingsChange,
    onClose
}) => {
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
    ]

    // 点击遮罩层关闭
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div className="settings-overlay" onClick={handleOverlayClick}>
            <div className="settings-panel">
                <div className="settings-header">
                    <h2>游戏设置</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                
                <div className="settings-content">
                    {/* 游戏类型选择 */}
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

                    {/* 网格尺寸设置 */}
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

                    {/* 方块种类数量设置 */}
                    <div className="settings-item">
                        <label>方块种类数量</label>
                        <input
                            type="number"
                            min="3"
                            max="50"
                            value={typesCount}
                            onChange={(e) => onSettingsChange({ typesCount: parseInt(e.target.value) })}
                        />
                        <p className="settings-hint">建议设置在3-50之间</p>
                    </div>

                    {/* 音乐控制 */}
                    <div className="settings-item">
                        <label>背景音乐</label>
                        <div className="music-settings">
                            <div className="current-music">
                                {currentMusic?.name ? `当前音乐：${currentMusic.name}` : '点击右侧按钮选择音乐'}
                            </div>
                            <button 
                                className="change-music-button"
                                onClick={loadNewMusic}
                            >
                                {currentMusic?.name ? '切换音乐' : '选择音乐'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 