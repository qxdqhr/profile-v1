'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/PopWindow';
import { 
  resetToDefaultConfig, 
  updateGridSize, 
  updateGridCell,
  DEFAULT_GRID_CONFIG,
  generateDefaultCells
} from '../services/configService';
import { GridCell, GridConfig, DEFAULT_KEYS, SOUND_TYPES, WAVE_TYPES, SOUND_TYPE_COLORS, SOUND_SOURCES, SoundType, ANIMATION_TYPES, ANIMATION_TYPE_DESCRIPTIONS, AnimationType } from '../types';
import SoundLibraryManager from '../components/SoundLibraryManager';
import { useConfigDatabase } from '../hooks/useConfigDatabase';

interface SoundLibraryItem {
  id: string;
  name: string;
  file: string;
  type: SoundType;
  description: string;
  size: number;
  duration?: number;
}

export default function ConfigPage() {
  const [config, setConfig] = useState<GridConfig | null>(null);
  const [editingCell, setEditingCell] = useState<GridCell | null>(null);
  const [showCellEditor, setShowCellEditor] = useState(false);
  const [showSoundLibrary, setShowSoundLibrary] = useState(false);
  const [soundLibrary, setSoundLibrary] = useState<SoundLibraryItem[]>([]);
  const { loading, error, saveConfig: saveConfigToDB, loadConfig: loadConfigFromDB } = useConfigDatabase();

  // 初始化加载配置
  useEffect(() => {
    async function loadInitialConfig() {
      try {
        // 直接从数据库加载
        const dbConfig = await loadConfigFromDB('default');
        if (dbConfig) {
          setConfig(dbConfig);
        } else {
          // 数据库中没有配置，创建默认配置并保存到数据库
          const defaultConfig = {
            ...DEFAULT_GRID_CONFIG,
            cells: generateDefaultCells(DEFAULT_GRID_CONFIG.rows, DEFAULT_GRID_CONFIG.cols),
          };
          setConfig(defaultConfig);
          await saveConfigToDB(defaultConfig);
        }
        
        // 加载音效库
        const savedSounds = localStorage.getItem('mikutap-sound-library');
        if (savedSounds) {
          try {
            setSoundLibrary(JSON.parse(savedSounds));
          } catch (error) {
            console.error('Failed to load sound library:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load configuration from database:', error);
        // 如果数据库完全不可用，创建默认配置
        const defaultConfig = {
          ...DEFAULT_GRID_CONFIG,
          cells: generateDefaultCells(DEFAULT_GRID_CONFIG.rows, DEFAULT_GRID_CONFIG.cols),
        };
        setConfig(defaultConfig);
      }
    }

    loadInitialConfig();
  }, [loadConfigFromDB, saveConfigToDB]);

  const handleSaveConfig = async () => {
    if (!config) return;
    
    try {
      await saveConfigToDB(config);
      alert('配置已保存到数据库！');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('保存配置失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleResetConfig = () => {
    if (confirm('确定要重置为默认配置吗？')) {
      const defaultConfig = resetToDefaultConfig();
      setConfig(defaultConfig);
    }
  };

  const handleUpdateGridSize = (rows: number, cols: number) => {
    if (!config) return;
    const newConfig = updateGridSize(config, rows, cols);
    setConfig(newConfig);
  };

  const editCell = (cell: GridCell) => {
    setEditingCell({ ...cell });
    setShowCellEditor(true);
  };

  const saveCellEdit = async () => {
    if (!editingCell || !config) return;

    const newConfig = updateGridCell(config, editingCell.id, editingCell);
    setConfig(newConfig);
    
    try {
      await saveConfigToDB(newConfig);
    } catch (error) {
      console.error('Failed to save cell configuration:', error);
      alert('保存格子配置失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
    
    setShowCellEditor(false);
    setEditingCell(null);
  };

  // 创建新格子
  const createNewCell = async (row: number, col: number) => {
    if (!config) return;
    
    // 查找未使用的键（可选）
    const usedKeys = config.cells.map(cell => cell.key?.toLowerCase()).filter(Boolean);
    const availableKey = DEFAULT_KEYS.find(key => !usedKeys.includes(key.toLowerCase()));
    
    // 创建新的格子
    const newCell: GridCell = {
      id: `cell-${row}-${col}`,
      row,
      col,
      key: availableKey?.toUpperCase(), // 如果有可用键盘按键则分配，否则为undefined
      soundType: 'piano',
      soundSource: 'synthesized',
      waveType: 'sine',
      frequency: 440,
      volume: 100,
      description: availableKey ? `新音效 - ${availableKey.toUpperCase()}` : `新音效 - (${row},${col})`,
      icon: '🎹',
      color: '#3B82F6',
      enabled: true,
    };

    // 添加到配置中
    const updatedConfig = {
      ...config,
      cells: [...config.cells, newCell],
      updatedAt: new Date(),
    };
    
    setConfig(updatedConfig);
    
    try {
      await saveConfigToDB(updatedConfig);
    } catch (error) {
      console.error('Failed to save new cell configuration:', error);
      alert('保存新格子失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
    
    // 直接打开编辑器
    setEditingCell(newCell);
    setShowCellEditor(true);
  };

  // 删除格子
  const deleteCell = async (cellId: string) => {
    if (!config) return;
    
    const updatedConfig = {
      ...config,
      cells: config.cells.filter(cell => cell.id !== cellId),
      updatedAt: new Date(),
    };
    
    setConfig(updatedConfig);
    
    try {
      await saveConfigToDB(updatedConfig);
    } catch (error) {
      console.error('Failed to save after deleting cell:', error);
      alert('删除格子后保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
    
    setShowCellEditor(false);
    setEditingCell(null);
  };

  const renderGrid = () => {
    if (!config) return [];
    
    const grid = [];
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        const cell = config.cells.find(c => c.row === row && c.col === col);
        const cellKey = `${row}-${col}`;
        
        grid.push(
          <div
            key={cellKey}
            className={`
              relative border-2 border-gray-600 rounded-lg p-2 cursor-pointer transition-all
              ${cell?.enabled ? 'hover:scale-105' : 'opacity-50'}
              ${cell ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-900 hover:bg-gray-800'}
            `}
            style={{
              backgroundColor: cell?.enabled ? cell.color + '20' : '#1f2937',
              borderColor: cell?.enabled ? cell.color : '#4b5563'
            }}
            onClick={() => {
              if (cell) {
                editCell(cell);
              } else {
                createNewCell(row, col);
              }
            }}
          >
            {cell ? (
              <div className="text-center">
                <div className="text-2xl mb-1">{cell.icon}</div>
                <div className="font-bold text-sm">{cell.key || '无按键'}</div>
                <div className="text-xs text-gray-400">{cell.soundType}</div>
                <div className="text-xs text-gray-500">{cell.waveType}</div>
                <div className="text-xs text-gray-500">{cell.frequency}Hz</div>
              </div>
            ) : (
              <div className="text-center text-gray-500 hover:text-gray-300 transition-colors">
                <div className="text-2xl mb-1">➕</div>
                <div className="text-xs">点击新增</div>
                <div className="text-xs text-gray-600">音效</div>
              </div>
            )}
          </div>
        );
      }
    }
    return grid;
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🎵 加载配置中...</div>
          <div className="text-gray-400">正在初始化Mikutap配置</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🎵 Mikutap 配置管理</h1>
          <p className="text-gray-300">管理网格布局、键盘快捷键和音效配置</p>
        </div>

        {/* 网格设置 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">网格设置</h2>
          <div className="flex gap-4 items-center mb-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">行数</label>
              <select
                value={config.rows}
                onChange={(e) => handleUpdateGridSize(parseInt(e.target.value), config.cols)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">列数</label>
              <select
                value={config.cols}
                onChange={(e) => handleUpdateGridSize(config.rows, parseInt(e.target.value))}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="ml-auto">
              <div className="text-sm text-gray-300">
                总格子数: {config.rows * config.cols} / {DEFAULT_KEYS.length}
              </div>
            </div>
          </div>
        </div>

        {/* 网格预览 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">网格预览</h2>
          <div 
            className="grid gap-2 max-w-2xl"
            style={{
              gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
              gridTemplateRows: `repeat(${config.rows}, 1fr)`
            }}
          >
            {renderGrid()}
          </div>
          <div className="mt-4 text-sm text-gray-400">
            <div>• 点击已有格子进行编辑配置</div>
            <div>• 点击空格子可新增音效</div>
            <div>• 在编辑界面可删除不需要的音效</div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleSaveConfig}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            💾 保存配置
          </button>
          <button
            onClick={handleResetConfig}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            🔄 重置默认
          </button>
          <button
            onClick={() => window.location.href = '/testField/mikutap'}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            🎵 返回游戏
          </button>
        </div>

        {/* 格子编辑弹窗 */}
        {showCellEditor && editingCell && (
          <Modal 
            isOpen={showCellEditor}
            onClose={() => setShowCellEditor(false)}
            title="编辑格子配置"
            className="max-w-md"
          >
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={!!editingCell.key}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // 启用键盘触发，查找可用的键
                          const usedKeys = config?.cells.map(cell => cell.key?.toLowerCase()).filter(Boolean) || [];
                          const availableKey = DEFAULT_KEYS.find(key => !usedKeys.includes(key.toLowerCase()) || key.toLowerCase() === editingCell.key?.toLowerCase());
                          setEditingCell({...editingCell, key: availableKey?.toUpperCase() || 'A'});
                        } else {
                          // 禁用键盘触发
                          setEditingCell({...editingCell, key: undefined});
                        }
                      }}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-300">启用键盘触发</label>
                  </div>
                  {editingCell.key && (
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">键盘快捷键</label>
                      <input
                        type="text"
                        maxLength={1}
                        value={editingCell.key}
                        onChange={(e) => setEditingCell({...editingCell, key: e.target.value.toUpperCase()})}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-center text-lg font-bold"
                        placeholder="输入单个字母"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        可用按键: {DEFAULT_KEYS.filter(key => {
                          const usedKeys = config?.cells.map(cell => cell.key?.toLowerCase()).filter(Boolean) || [];
                          return !usedKeys.includes(key.toLowerCase()) || key.toLowerCase() === editingCell.key?.toLowerCase();
                        }).join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">音效源</label>
                  <select
                    value={editingCell.soundSource || 'synthesized'}
                    onChange={(e) => setEditingCell({...editingCell, soundSource: e.target.value as 'synthesized' | 'file' | 'url'})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="synthesized">合成音效</option>
                    <option value="file">音频文件</option>
                    <option value="url">网络链接</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">音效类型</label>
                  <select
                    value={editingCell.soundType}
                    onChange={(e) => setEditingCell({...editingCell, soundType: e.target.value as SoundType})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    {SOUND_TYPES.map((type: SoundType) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {editingCell.soundSource === 'file' && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">音频文件</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingCell.audioFile || ''}
                        onChange={(e) => setEditingCell({...editingCell, audioFile: e.target.value})}
                        placeholder="选择音频文件..."
                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                        readOnly
                      />
                      <button
                        onClick={() => setShowSoundLibrary(true)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-white"
                      >
                        选择
                      </button>
                    </div>
                  </div>
                )}

                {editingCell.soundSource === 'url' && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">音频URL</label>
                    <input
                      type="url"
                      value={editingCell.audioFile || ''}
                      onChange={(e) => setEditingCell({...editingCell, audioFile: e.target.value})}
                      placeholder="https://example.com/sound.mp3"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                )}

                {editingCell.soundSource === 'synthesized' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">波形类型</label>
                      <select
                        value={editingCell.waveType}
                        onChange={(e) => setEditingCell({...editingCell, waveType: e.target.value as 'sine' | 'square' | 'sawtooth' | 'triangle'})}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      >
                        {WAVE_TYPES.map((type: 'sine' | 'square' | 'sawtooth' | 'triangle') => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">频率 (Hz)</label>
                      <input
                        type="number"
                        min="20"
                        max="2000"
                        value={editingCell.frequency || 440}
                        onChange={(e) => setEditingCell({...editingCell, frequency: parseInt(e.target.value)})}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm text-gray-300 mb-1">频率 (Hz)</label>
                  <input
                    type="number"
                    min="20"
                    max="2000"
                    value={editingCell.frequency || 440}
                    onChange={(e) => setEditingCell({...editingCell, frequency: parseInt(e.target.value)})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">音量 (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingCell.volume || 80}
                    onChange={(e) => setEditingCell({...editingCell, volume: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-400">{editingCell.volume || 80}%</div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">图标</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={editingCell.icon}
                    onChange={(e) => setEditingCell({...editingCell, icon: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-center text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">描述</label>
                  <input
                    type="text"
                    value={editingCell.description}
                    onChange={(e) => setEditingCell({...editingCell, description: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">颜色</label>
                  <input
                    type="color"
                    value={editingCell.color}
                    onChange={(e) => setEditingCell({...editingCell, color: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingCell.enabled}
                    onChange={(e) => setEditingCell({...editingCell, enabled: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-300">启用这个格子</label>
                </div>

                {/* 动画配置部分 */}
                <div className="border-t border-gray-600 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-200 mb-3">🎨 动画配置</h3>
                  
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={editingCell.animationEnabled ?? true}
                      onChange={(e) => setEditingCell({
                        ...editingCell, 
                        animationEnabled: e.target.checked,
                        animationType: editingCell.animationType || 'pulse',
                        animationConfig: editingCell.animationConfig || {
                          duration: 500,
                          speed: 1,
                          scale: 1.2,
                          opacity: 0.8,
                          direction: 'up',
                          loop: false,
                          autoplay: false,
                          offset: { x: 0, y: 0 }
                        }
                      })}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-300">启用点击动画效果</label>
                  </div>

                  {editingCell.animationEnabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">动画类型</label>
                        <select
                          value={editingCell.animationType || 'pulse'}
                          onChange={(e) => setEditingCell({
                            ...editingCell, 
                            animationType: e.target.value as AnimationType
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                        >
                          {ANIMATION_TYPES.map((type: AnimationType) => (
                            <option key={type} value={type}>
                              {ANIMATION_TYPE_DESCRIPTIONS[type]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">持续时间 (ms)</label>
                          <input
                            type="number"
                            min="100"
                            max="2000"
                            value={editingCell.animationConfig?.duration || 500}
                            onChange={(e) => setEditingCell({
                              ...editingCell,
                              animationConfig: {
                                ...editingCell.animationConfig,
                                duration: parseInt(e.target.value)
                              }
                            })}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-1">缩放倍数</label>
                          <input
                            type="number"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={editingCell.animationConfig?.scale || 1.2}
                            onChange={(e) => setEditingCell({
                              ...editingCell,
                              animationConfig: {
                                ...editingCell.animationConfig,
                                scale: parseFloat(e.target.value)
                              }
                            })}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-1">透明度</label>
                          <input
                            type="number"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={editingCell.animationConfig?.opacity || 0.8}
                            onChange={(e) => setEditingCell({
                              ...editingCell,
                              animationConfig: {
                                ...editingCell.animationConfig,
                                opacity: parseFloat(e.target.value)
                              }
                            })}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-1">动画方向</label>
                          <select
                            value={editingCell.animationConfig?.direction || 'up'}
                            onChange={(e) => setEditingCell({
                              ...editingCell,
                              animationConfig: {
                                ...editingCell.animationConfig,
                                direction: e.target.value as 'up' | 'down' | 'left' | 'right' | 'random'
                              }
                            })}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                          >
                            <option value="up">向上</option>
                            <option value="down">向下</option>
                            <option value="left">向左</option>
                            <option value="right">向右</option>
                            <option value="random">随机</option>
                          </select>
                        </div>
                      </div>

                      {editingCell.animationType === 'custom' && (
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Lottie动画JSON</label>
                          <textarea
                            value={editingCell.animationData ? JSON.stringify(editingCell.animationData, null, 2) : ''}
                            onChange={(e) => {
                              try {
                                const animationData = e.target.value ? JSON.parse(e.target.value) : null;
                                setEditingCell({
                                  ...editingCell,
                                  animationData
                                });
                              } catch (error) {
                                // 忽略JSON解析错误，允许用户输入过程中的无效JSON
                              }
                            }}
                            placeholder="粘贴Lottie动画JSON数据..."
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white h-32 text-sm font-mono"
                          />
                          <div className="text-xs text-gray-400 mt-1">
                            💡 您可以从 <a href="https://lottiefiles.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">LottieFiles</a> 下载动画JSON文件
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveCellEdit}
                  className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  💾 保存
                </button>
                <button
                  onClick={() => {
                    if (confirm('确定要删除这个音效格子吗？')) {
                      deleteCell(editingCell.id);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  🗑️ 删除
                </button>
                <button
                  onClick={() => setShowCellEditor(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* 音效库管理 */}
        <SoundLibraryManager
          isOpen={showSoundLibrary}
          onClose={() => setShowSoundLibrary(false)}
          sounds={soundLibrary}
          onSoundsUpdate={setSoundLibrary}
          onSoundSelect={(sound) => {
            if (editingCell) {
              setEditingCell({
                ...editingCell,
                soundSource: 'file',
                audioFile: sound.file,
                soundType: sound.type
              });
            }
          }}
        />
      </div>
    </div>
  );
}