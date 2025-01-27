import React from 'react'
import { GameType, GameMode } from '../types'

interface SettingsProps {
    gameMode: GameMode
    gameType: GameType
    gridWidth: number
    gridHeight: number
    typesCount: number
    onSettingsChange: (settings: {
        gameMode?: GameMode
        gameType?: GameType
        gridWidth?: number
        gridHeight?: number
        typesCount?: number
    }) => void
}

export const Settings: React.FC<SettingsProps> = ({
    gameMode,
    gameType,
    gridWidth,
    gridHeight,
    typesCount,
    onSettingsChange
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

    const gameModes: GameMode[] = ['text', 'cube']

    return (
        <div className="settings-panel p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">游戏设置</h2>
            
            <div className="space-y-4">
                {/* 游戏模式选择 */}
                <div>
                    <label className="block text-sm font-medium mb-2">游戏模式</label>
                    <select
                        value={gameMode}
                        onChange={(e) => onSettingsChange({ gameMode: e.target.value as GameMode })}
                        className="w-full p-2 border rounded"
                    >
                        {gameModes.map((mode) => (
                            <option key={mode} value={mode}>
                                {mode === 'text' ? '文字模式' : '方块模式'}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 游戏类型选择 */}
                <div>
                    <label className="block text-sm font-medium mb-2">游戏类型</label>
                    <select
                        value={gameType}
                        onChange={(e) => onSettingsChange({ gameType: e.target.value as GameType })}
                        className="w-full p-2 border rounded"
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
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">面板宽度</label>
                        <input
                            type="number"
                            min="4"
                            max="12"
                            value={gridWidth}
                            onChange={(e) => onSettingsChange({ gridWidth: parseInt(e.target.value) })}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">面板高度</label>
                        <input
                            type="number"
                            min="4"
                            max="12"
                            value={gridHeight}
                            onChange={(e) => onSettingsChange({ gridHeight: parseInt(e.target.value) })}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>

                {/* 方块种类数量设置 */}
                <div>
                    <label className="block text-sm font-medium mb-2">方块种类数量</label>
                    <input
                        type="number"
                        min="3"
                        max="50"
                        value={typesCount}
                        onChange={(e) => onSettingsChange({ typesCount: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">建议设置在3-50之间</p>
                </div>
            </div>
        </div>
    )
} 