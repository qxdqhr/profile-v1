'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/PopWindow';
import { 
  resetToDefaultConfig, 
  updateGridSize, 
  updateGridCell,
  DEFAULT_GRID_CONFIG,
  generateDefaultCells
} from '../services/configService';
import { GridCell, GridConfig, DEFAULT_KEYS, SOUND_TYPES, WAVE_TYPES, SOUND_TYPE_COLORS, SOUND_SOURCES, SoundType, ANIMATION_TYPES, ANIMATION_TYPE_DESCRIPTIONS, AnimationType, BackgroundMusic, InterfaceSettings, DEFAULT_INTERFACE_SETTINGS } from '../types';
import SoundLibraryManager from '../components/SoundLibraryManager';
import { useConfigDatabase } from '../hooks/useConfigDatabase';

import { RhythmGenerator } from '../utils/rhythmGenerator';
import { MusicGenerator } from '../utils/musicGenerator';

interface SoundLibraryItem {
  id: string;
  name: string;
  file: string;
  type: SoundType;
  description: string;
  size: number;
  duration?: number;
}

type Tab = 'background-music' | 'interface-settings' | 'other-config';
type MusicTab = 'upload' | 'generate';

interface MusicGenerationConfig {
  bpm: number;
  chordProgression: 'happy' | 'sad' | 'energetic' | 'peaceful';
  timeSignature: {
    numerator: number;
    denominator: number;
  };
  duration: number;
  volume: number;
  waveType: 'sine' | 'square' | 'sawtooth' | 'triangle';
  enableHarmony: boolean;
  bassline: boolean;
}

export default function ConfigPage() {
  // 从URL参数获取初始tab，如果没有则默认为背景音乐
  const getInitialTab = (): Tab => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab') as Tab;
      if (tab && ['background-music', 'interface-settings', 'other-config'].includes(tab)) {
        return tab;
      }
    }
    return 'background-music';
  };

  const [activeTab, setActiveTab] = useState<Tab>(getInitialTab());
  const [activeMusicTab, setActiveMusicTab] = useState<MusicTab>('upload');
  const [backgroundMusics, setBackgroundMusics] = useState<BackgroundMusic[]>([]);
  const [currentBgMusic, setCurrentBgMusic] = useState<BackgroundMusic | undefined>();
  const [config, setConfig] = useState<GridConfig | null>(null);
  const [editingCell, setEditingCell] = useState<GridCell | null>(null);
  const [showCellEditor, setShowCellEditor] = useState(false);
  const [showSoundLibrary, setShowSoundLibrary] = useState(false);
  const [soundLibrary, setSoundLibrary] = useState<SoundLibraryItem[]>([]);
  const [interfaceSettings, setInterfaceSettings] = useState<InterfaceSettings>(DEFAULT_INTERFACE_SETTINGS);
  const { loading, error, saveConfig: saveConfigToDB, loadConfig: loadConfigFromDB } = useConfigDatabase();

  // 音乐生成器相关状态
  const [musicName, setMusicName] = useState('');

  const [musicLoop, setMusicLoop] = useState(true);
  const [bpm, setBpm] = useState(120);
  const [rhythmEnabled, setRhythmEnabled] = useState(false);
  const [rhythmSoundType, setRhythmSoundType] = useState<'sine' | 'square' | 'sawtooth' | 'triangle'>('sine');
  const [rhythmVolume, setRhythmVolume] = useState(0.5);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewMusic, setPreviewMusic] = useState<BackgroundMusic | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // 新增的音乐生成配置
  const [musicConfig, setMusicConfig] = useState<MusicGenerationConfig>({
    bpm: 120,
    chordProgression: 'happy',
    timeSignature: { numerator: 4, denominator: 4 },
    duration: 8, // 减少到8秒以便快速测试
    volume: 0.5,
    waveType: 'sine',
    enableHarmony: true,
    bassline: false
  });

  // 文件上传相关状态
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string>('');
  
  // 音频相关的引用
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const rhythmGeneratorRef = useRef<RhythmGenerator | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicGeneratorRef = useRef<MusicGenerator | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        // 加载界面设置
        const savedSettings = localStorage.getItem('mikutap-interface-settings');
        if (savedSettings) {
          try {
            setInterfaceSettings(JSON.parse(savedSettings));
          } catch (error) {
            console.error('Failed to load interface settings:', error);
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

  // 从数据库加载背景音乐列表
  const loadBackgroundMusics = async () => {
    try {
      const response = await fetch('/api/mikutap/background-music?configId=default');
      const result = await response.json();
      if (result.success) {
        // 保持后端返回的原始顺序（应该是按创建时间排序的）
        setBackgroundMusics(result.data);
        const defaultMusic = result.data.find((m: BackgroundMusic) => m.isDefault);
        if (defaultMusic) {
          setCurrentBgMusic(defaultMusic);
        } else if (result.data.length > 0) {
          // 如果没有默认音乐但有音乐列表，使用第一个音乐
          setCurrentBgMusic(result.data[0]);
        }
      } else {
        console.error('加载背景音乐失败:', result.error);
      }
    } catch (error) {
      console.error('加载背景音乐失败:', error);
    }
  };

  // 自动保存界面设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mikutap-interface-settings', JSON.stringify(interfaceSettings));
    }
  }, [interfaceSettings]);

  // 初始化音频系统
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      console.log('🎵 AudioContext 创建成功');
    }
    if (!rhythmGeneratorRef.current && audioContextRef.current) {
      rhythmGeneratorRef.current = new RhythmGenerator(audioContextRef.current);
      console.log('🎵 RhythmGenerator 创建成功');
    }
    if (!musicGeneratorRef.current && audioContextRef.current) {
      musicGeneratorRef.current = new MusicGenerator();
      console.log('🎵 MusicGenerator 创建成功');
    }

    // 加载保存的背景音乐列表
    loadBackgroundMusics();

    // 清理函数 - 注释掉AudioContext的关闭，避免影响音乐播放
    return () => {
      if (rhythmGeneratorRef.current) {
        rhythmGeneratorRef.current.stop();
      }
      // 不要关闭AudioContext，因为可能还在使用
      // if (audioContextRef.current) {
      //   audioContextRef.current.close();
      // }
    };
  }, []);

  // 处理预览播放（只负责试听，不影响当前使用的音乐）
  const handlePreview = async (music: BackgroundMusic) => {
    try {
      if (previewMusic?.id === music.id && previewPlaying) {
        // 如果是当前正在播放的音乐，则停止播放
        if (previewAudioRef.current) {
          previewAudioRef.current.pause();
          previewAudioRef.current.currentTime = 0;
        }
        setPreviewMusic(null);
        setPreviewPlaying(false);
      } else {
        // 如果当前有其他音乐在播放，先停止它
        if (previewAudioRef.current && previewPlaying) {
          previewAudioRef.current.pause();
          previewAudioRef.current.currentTime = 0;
        }
        // 只进行预览播放，不设置为当前音乐
        setPreviewMusic(music);
        setPreviewPlaying(false);
        
        // 设置音频源并播放
        if (previewAudioRef.current) {
          previewAudioRef.current.src = music.file;
          previewAudioRef.current.volume = music.volume;
          previewAudioRef.current.loop = music.loop;
          try {
            await previewAudioRef.current.play();
            setPreviewPlaying(true);
          } catch (error) {
            console.error('预览播放失败:', error);
            setPreviewMusic(null);
          }
        }
      }
    } catch (error) {
      console.error('预览失败:', error);
      alert('预览失败，请重试');
    }
  };

  // 处理背景音乐变更（使用此音乐，同时设为默认）
  const handleMusicChange = async (music: BackgroundMusic) => {
    // 停止预览播放
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
    }
    setPreviewMusic(null);
    setPreviewPlaying(false);
    
    // 设置为默认音乐
    await handleSetDefault(music.id);
    
    setCurrentBgMusic(music);
    
    // 停止当前的节奏
    if (rhythmGeneratorRef.current) {
      rhythmGeneratorRef.current.stop();
    }

    // 播放新的背景音乐
    if (bgMusicRef.current) {
      bgMusicRef.current.src = music.file;
      bgMusicRef.current.volume = music.volume;
      bgMusicRef.current.loop = music.loop;
      bgMusicRef.current.play().catch(error => {
        console.error('背景音乐播放失败:', error);
      });

      // 如果启用了节奏模式，开始播放节奏
      if (music.rhythmPattern.enabled && rhythmGeneratorRef.current) {
        rhythmGeneratorRef.current.start(music);
      }
    }
  };

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setUploadPreviewUrl(url);
    }
  };

  // 保存上传的音乐
  const handleSaveUploadedMusic = async () => {
    if (!uploadedFile || !musicName) return;

    try {
      const formData = new FormData();
      formData.append('configId', 'default');
      formData.append('name', musicName);
      formData.append('file', uploadedFile);
      formData.append('fileType', 'uploaded');
      formData.append('volume', '0.8');
      formData.append('loop', musicLoop.toString());
      formData.append('bpm', '120');
      formData.append('isDefault', 'false');
      formData.append('rhythmPattern', JSON.stringify({
        enabled: false, // 上传音乐默认不启用节奏
        soundType: 'sine',
        pattern: [1, 0.5, 0.5, 0.5],
        volume: 0.5
      }));

      const response = await fetch('/api/mikutap/background-music', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        // 直接添加新音乐到列表末尾，保持创建时间顺序
        setBackgroundMusics(prevMusics => [...prevMusics, result.data]);
        
        // 重置表单
        setMusicName('');
        setUploadedFile(null);
        setUploadPreviewUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        console.error('保存音乐失败:', result.error);
        alert('保存音乐失败: ' + result.error);
      }
    } catch (error) {
      console.error('保存音乐失败:', error);
      alert('保存音乐失败，请重试');
    }
  };

  // 生成并保存音乐
  const handleGenerateMusic = async () => {
    if (!musicGeneratorRef.current || !musicName) return;

    try {
      const buffer = await musicGeneratorRef.current.generateMusic(musicConfig);
      
      // 将 AudioBuffer 转换为 WAV 格式的 Blob
      const wavBlob = audioBufferToWav(buffer);
      
      // 创建 FormData
      const formData = new FormData();
      formData.append('configId', 'default');
      formData.append('name', musicName);
      formData.append('generatedFile', wavBlob, `${musicName}.wav`);
      formData.append('fileType', 'generated');
      formData.append('volume', musicConfig.volume.toString());
      formData.append('loop', musicLoop.toString());
      formData.append('bpm', musicConfig.bpm.toString());
      formData.append('isDefault', 'false');
      formData.append('generationConfig', JSON.stringify(musicConfig));
      formData.append('rhythmPattern', JSON.stringify({
        enabled: rhythmEnabled,
        soundType: rhythmSoundType,
        pattern: getPatternByTimeSignature(musicConfig.timeSignature),
        volume: rhythmVolume
      }));

      const response = await fetch('/api/mikutap/background-music', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        // 直接添加新生成的音乐到列表末尾，保持创建时间顺序
        setBackgroundMusics(prevMusics => [...prevMusics, result.data]);
        
        // 重置表单
        setMusicName('');
      } else {
        console.error('保存生成音乐失败:', result.error);
        alert('保存生成音乐失败: ' + result.error);
      }
    } catch (error) {
      console.error('生成音乐失败:', error);
      alert('生成音乐失败，请重试');
    }
  };

  // 预览生成的音乐
  const handlePreviewGenerated = async () => {
    if (!musicGeneratorRef.current) {
        console.error('🎵 音乐生成器未初始化');
        return;
    }

    if (previewPlaying) {
        console.log('🎵 停止预览');
        musicGeneratorRef.current.stop();
        rhythmGeneratorRef.current?.stop(); // 停止节奏
        setPreviewPlaying(false);
    } else {
        try {
            console.log('🎵 开始生成预览音乐...');
            console.log('🎵 音乐配置:', musicConfig);
            
            // 确保AudioContext处于可用状态
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                console.log('🎵 AudioContext不可用，重新创建...');
                audioContextRef.current = new AudioContext();
                musicGeneratorRef.current = new MusicGenerator();
                rhythmGeneratorRef.current = new RhythmGenerator(audioContextRef.current); // 重新创建节奏生成器
                console.log('🎵 AudioContext重新创建完成，状态:', audioContextRef.current.state);
            } else if (audioContextRef.current.state === 'suspended') {
                console.log('🎵 AudioContext被暂停，尝试恢复...');
                await audioContextRef.current.resume();
                console.log('🎵 AudioContext状态:', audioContextRef.current.state);
            }
            
            const buffer = await musicGeneratorRef.current.generateMusic(musicConfig);
            console.log('🎵 音乐生成成功，开始播放预览...');
            
            await musicGeneratorRef.current.playBuffer(buffer);

            // 如果启用了节奏，则启动节奏
            if (rhythmEnabled) {
                console.log('🎵 启动节奏预览...');
                const rhythmMusic: BackgroundMusic = {
                    id: 'preview',
                    name: 'preview',
                    file: '',
                    fileType: 'generated',
                    volume: 1,
                    loop: true,
                    isDefault: false,
                    bpm: musicConfig.bpm,
                    rhythmPattern: {
                        enabled: true,
                        soundType: rhythmSoundType,
                        pattern: getPatternByTimeSignature(musicConfig.timeSignature),
                        volume: rhythmVolume,
                    },
                };
                rhythmGeneratorRef.current?.start(rhythmMusic);
            }

            setPreviewPlaying(true);
            console.log('🎵 预览播放开始');
            
            // 自动停止预览
            setTimeout(() => {
                console.log('🎵 预览时间结束，自动停止');
                if (musicGeneratorRef.current) {
                    musicGeneratorRef.current.stop();
                }
                if (rhythmGeneratorRef.current) {
                    rhythmGeneratorRef.current.stop(); // 停止节奏
                }
                setPreviewPlaying(false);
            }, musicConfig.duration * 1000);
        } catch (error) {
            console.error('❌ 预览失败:', error);
            setPreviewPlaying(false);
            alert('预览失败: ' + (error instanceof Error ? error.message : '未知错误'));
        }
    }
  };

  // 删除音乐
  const handleDeleteMusic = async (musicId: string) => {
    try {
      const response = await fetch(`/api/mikutap/background-music?id=${musicId}&configId=default`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        // 直接从列表中移除删除的音乐，保持原有顺序
        setBackgroundMusics(prevMusics => 
          prevMusics.filter(music => music.id !== musicId)
        );
        
        if (currentBgMusic?.id === musicId) {
          setCurrentBgMusic(undefined);
        }
      } else {
        console.error('删除音乐失败:', result.error);
        alert('删除音乐失败: ' + result.error);
      }
    } catch (error) {
      console.error('删除音乐失败:', error);
      alert('删除音乐失败，请重试');
    }
  };

  // 设置默认音乐
  const handleSetDefault = async (musicId: string) => {
    try {
      const response = await fetch(`/api/mikutap/background-music?id=${musicId}&configId=default`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDefault: true }),
      });

      const result = await response.json();
      if (result.success) {
        // 直接更新本地状态，保持原有顺序
        setBackgroundMusics(prevMusics => 
          prevMusics.map(music => ({
            ...music,
            isDefault: music.id === musicId // 只有选中的音乐设为默认，其他都设为false
          }))
        );
      } else {
        console.error('设置默认音乐失败:', result.error);
        alert('设置默认音乐失败: ' + result.error);
      }
    } catch (error) {
      console.error('设置默认音乐失败:', error);
      alert('设置默认音乐失败，请重试');
    }
  };

  // 根据拍号获取默认节奏型
  const getPatternByTimeSignature = (timeSignature: { numerator: number; denominator: number }) => {
    switch (`${timeSignature.numerator}/${timeSignature.denominator}`) {
      case '3/4':
        return [1, 0.5, 0.5];
      case '2/4':
        return [1, 0.5];
      case '6/8':
        return [1, 0.5, 0.5, 0.5, 0.5, 0.5];
      default:
        return [1, 0.5, 0.5, 0.5];
    }
  };

  // AudioBuffer 转 WAV


  // 重置界面设置
  const resetInterfaceSettings = () => {
    if (confirm('确定要重置界面设置为默认值吗？')) {
      setInterfaceSettings(DEFAULT_INTERFACE_SETTINGS);
      // 设置会通过useEffect自动保存
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV 文件头
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // 写入音频数据
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };



  const handleResetConfig = async () => {
    if (confirm('确定要重置为默认配置吗？')) {
      const defaultConfig = resetToDefaultConfig();
      setConfig(defaultConfig);
      // 自动保存到数据库
      try {
        await saveConfigToDB(defaultConfig);
      } catch (error) {
        console.error('保存重置配置失败:', error);
        alert('保存重置配置失败：' + (error instanceof Error ? error.message : '未知错误'));
      }
    }
  };
  


  const handleUpdateGridSize = async (rows: number, cols: number) => {
    if (!config) return;
    const newConfig = updateGridSize(config, rows, cols);
    setConfig(newConfig);
    // 自动保存到数据库
    try {
      await saveConfigToDB(newConfig);
    } catch (error) {
      console.error('保存网格设置失败:', error);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* 页面头部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🎵</div>
              <h1 className="text-xl font-semibold text-gray-900">Mikutap 配置中心</h1>
            </div>
            <button
              onClick={() => window.location.href = '/testField/mikutap'}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="mr-2">🎮</span>
              返回游戏
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 现代化标签页导航 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-8">
          <div className="flex space-x-1">
            <button
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'background-music'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('background-music')}
            >
              <span className="mr-2">🎵</span>
              背景音乐
            </button>
            <button
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'interface-settings'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('interface-settings')}
            >
              <span className="mr-2">⚙️</span>
              界面设置
            </button>
            <button
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'other-config'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('other-config')}
            >
              <span className="mr-2">🎛️</span>
              映射配置
            </button>
          </div>
        </div>

        {/* 背景音乐标签页内容 */}
        {activeTab === 'background-music' && (
          <div className="space-y-8">
            {/* 音乐管理头部 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">🎵 背景音乐管理</h2>
                  <p className="text-gray-600">管理和配置Mikutap的背景音乐，支持上传和AI生成</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeMusicTab === 'upload'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => setActiveMusicTab('upload')}
                  >
                    <span className="mr-2">📤</span>
                    上传音乐
                  </button>
                  <button
                    className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeMusicTab === 'generate'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => setActiveMusicTab('generate')}
                  >
                    <span className="mr-2">🤖</span>
                    AI生成
                  </button>
                </div>
              </div>
            </div>

            {/* 音乐添加表单 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {activeMusicTab === 'upload' ? '上传新音乐' : '生成新音乐'}
              </h3>
              <div className="space-y-4">
                {/* 通用设置 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      音乐名称
                    </label>
                    <input
                      type="text"
                      value={musicName}
                      onChange={(e) => setMusicName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="输入音乐名称"
                    />
                  </div>



                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={musicLoop}
                      onChange={(e) => setMusicLoop(e.target.checked)}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      循环播放
                    </label>
                  </div>
                </div>

                {/* 音乐生成特定设置 */}
                {activeMusicTab === 'generate' && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-gray-900">音乐生成设置</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          音乐风格
                        </label>
                        <select
                          value={musicConfig.chordProgression}
                          onChange={(e) => setMusicConfig(prev => ({
                            ...prev,
                            chordProgression: e.target.value as any
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="happy">欢乐C大调</option>
                          <option value="sad">忧郁A小调</option>
                          <option value="energetic">活力E大调</option>
                          <option value="peaceful">平和G大调</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          波形类型
                        </label>
                        <select
                          value={musicConfig.waveType}
                          onChange={(e) => setMusicConfig(prev => ({
                            ...prev,
                            waveType: e.target.value as any
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="sine">正弦波</option>
                          <option value="square">方波</option>
                          <option value="sawtooth">锯齿波</option>
                          <option value="triangle">三角波</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          BPM
                        </label>
                        <input
                          type="number"
                          value={musicConfig.bpm}
                          onChange={(e) => setMusicConfig(prev => ({
                            ...prev,
                            bpm: parseInt(e.target.value)
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          min="60"
                          max="200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          时长 (秒)
                        </label>
                        <input
                          type="number"
                          value={musicConfig.duration}
                          onChange={(e) => setMusicConfig(prev => ({
                            ...prev,
                            duration: parseInt(e.target.value)
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          min="4"
                          max="60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          拍号
                        </label>
                        <select
                          value={`${musicConfig.timeSignature.numerator}/${musicConfig.timeSignature.denominator}`}
                          onChange={(e) => {
                            const [num, den] = e.target.value.split('/').map(Number);
                            setMusicConfig(prev => ({
                              ...prev,
                              timeSignature: { numerator: num, denominator: den }
                            }));
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="4/4">4/4 拍</option>
                          <option value="3/4">3/4 拍</option>
                          <option value="2/4">2/4 拍</option>
                          <option value="6/8">6/8 拍</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          音乐音量
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={musicConfig.volume}
                          onChange={(e) => setMusicConfig(prev => ({
                            ...prev,
                            volume: parseFloat(e.target.value)
                          }))}
                          className="w-full"
                        />
                        <div className="text-right text-sm text-gray-500">
                          {Math.round(musicConfig.volume * 100)}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={musicConfig.bassline}
                          onChange={(e) => setMusicConfig(prev => ({
                            ...prev,
                            bassline: e.target.checked
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          添加低音线
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 节奏设置 - 只在生成音乐时显示 */}
                {activeMusicTab === 'generate' && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rhythmEnabled}
                        onChange={(e) => setRhythmEnabled(e.target.checked)}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        启用节奏
                      </label>
                    </div>

                    {rhythmEnabled && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            节奏音色
                          </label>
                          <select
                            value={rhythmSoundType}
                            onChange={(e) => setRhythmSoundType(e.target.value as any)}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="sine">正弦波</option>
                            <option value="square">方波</option>
                            <option value="sawtooth">锯齿波</option>
                            <option value="triangle">三角波</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            节奏音量
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={rhythmVolume}
                            onChange={(e) => setRhythmVolume(parseFloat(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-right text-sm text-gray-500">
                            {Math.round(rhythmVolume * 100)}%
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 上传/生成特定设置 */}
                {activeMusicTab === 'upload' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        选择音频文件
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="w-full"
                      />
                    </div>
                    {uploadPreviewUrl && (
                      <div>
                        <audio
                          src={uploadPreviewUrl}
                          controls
                          className="w-full mt-2"
                        />
                      </div>
                    )}
                    <button
                      onClick={handleSaveUploadedMusic}
                      disabled={!uploadedFile || !musicName}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
                    >
                      保存音乐
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <button
                        onClick={handlePreviewGenerated}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        {previewPlaying ? '停止预览' : '预览音乐'}
                      </button>
                      <button
                        onClick={handleGenerateMusic}
                        disabled={!musicName}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
                      >
                        生成并保存
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 背景音乐列表 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">可用背景音乐</h3>
              
              {/* 当前状态摘要 */}
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span>
                        当前使用: {currentBgMusic ? 
                          <span className="text-purple-600 font-medium">{currentBgMusic.name}</span> : 
                          <span className="text-gray-500">未选择</span>
                        }
                      </span>
                      {previewMusic && previewPlaying && (
                        <span>
                          正在预览: <span className="text-green-600 font-medium">{previewMusic.name}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500">共 {backgroundMusics.length} 首音乐</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {backgroundMusics.map(music => (
                  <div
                    key={music.id}
                    className={`p-4 rounded-lg transition-all duration-200 ${
                      currentBgMusic?.id === music.id 
                        ? 'bg-purple-50 border-2 border-purple-200 shadow-md' 
                        : previewMusic?.id === music.id && previewPlaying
                          ? 'bg-green-50 border-2 border-green-200 shadow-sm'
                          : 'bg-gray-50 border border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          <span>{music.name}</span>
                          {currentBgMusic?.id === music.id && (
                            <span className="text-purple-600 text-sm bg-purple-100 px-2 py-0.5 rounded-full">
                              🎵 使用中
                            </span>
                          )}
                          {previewMusic?.id === music.id && previewPlaying && (
                            <span className="text-green-600 text-sm bg-green-100 px-2 py-0.5 rounded-full">
                              🎧 预览中
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <div>音量: {Math.round(music.volume * 100)}%</div>
                          <div>循环: {music.loop ? '是' : '否'}</div>
                          <div>BPM: {music.bpm}</div>
                          <div>类型: {music.file.startsWith('data:') ? '上传音乐' : '生成音乐'}</div>
                          {music.isDefault && (
                            <div className="text-green-600 font-medium">⭐ 默认音乐</div>
                          )}
                          {music.rhythmPattern.enabled && music.file.startsWith('blob:') && (
                            <>
                              <div>节奏音色: {
                                {
                                  'sine': '正弦波',
                                  'square': '方波',
                                  'sawtooth': '锯齿波',
                                  'triangle': '三角波'
                                }[music.rhythmPattern.soundType]
                              }</div>
                              <div>节奏音量: {Math.round(music.rhythmPattern.volume * 100)}%</div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handlePreview(music)}
                          className={`px-3 py-1 rounded transition-colors ${
                            previewMusic?.id === music.id && previewPlaying
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          }`}
                        >
                          {previewMusic?.id === music.id && previewPlaying ? '⏸️ 停止预览' : '▶️ 预览'}
                        </button>
                        <button
                          onClick={() => handleMusicChange(music)}
                          className={`px-3 py-1 rounded transition-colors ${
                            currentBgMusic?.id === music.id
                              ? 'bg-purple-500 hover:bg-purple-600 text-white'
                              : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                          }`}
                          title={currentBgMusic?.id === music.id ? '当前正在使用此音乐' : '使用此音乐并设为默认'}
                        >
                          {currentBgMusic?.id === music.id ? '🎵 使用中' : '🎯 使用并设为默认'}
                        </button>
                        <button
                          onClick={() => handleDeleteMusic(music.id)}
                          className="px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        >
                          🗑️ 删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {backgroundMusics.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  <div className="text-4xl mb-4">🎵</div>
                  <div className="text-lg mb-2">还没有背景音乐</div>
                  <div className="text-sm">
                    你可以上传音乐文件或使用 AI 生成音乐
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 界面设置标签页内容 */}
        {activeTab === 'interface-settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">界面设置</h2>
            
            {/* 音频设置 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">🔊 音频设置</h3>
              
              {/* 音量控制 */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                  <span>音量</span>
                  <span className="text-gray-500">{Math.round(interfaceSettings.volume * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={interfaceSettings.volume}
                  onChange={(e) => setInterfaceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* 交互设置 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">🎮 交互设置</h3>
              
              <div className="space-y-4">
                {/* 键盘启用 */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">启用键盘操作</label>
                  <input
                    type="checkbox"
                    checked={interfaceSettings.keyboardEnabled}
                    onChange={(e) => setInterfaceSettings(prev => ({ ...prev, keyboardEnabled: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                {/* 鼠标启用 */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">启用鼠标操作</label>
                  <input
                    type="checkbox"
                    checked={interfaceSettings.mouseEnabled}
                    onChange={(e) => setInterfaceSettings(prev => ({ ...prev, mouseEnabled: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 拖拽设置 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">🖱️ 拖拽设置</h3>
              
              <div className="space-y-4">
                {/* 拖拽节流 */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">启用拖拽节流</label>
                  <input
                    type="checkbox"
                    checked={interfaceSettings.enableDragThrottle}
                    onChange={(e) => setInterfaceSettings(prev => ({ ...prev, enableDragThrottle: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                {/* 节流延迟 */}
                {interfaceSettings.enableDragThrottle && (
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                      <span>拖拽延迟</span>
                      <span className="text-gray-500">{interfaceSettings.dragThrottleDelay}ms</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={interfaceSettings.dragThrottleDelay}
                      onChange={(e) => setInterfaceSettings(prev => ({ ...prev, dragThrottleDelay: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 视觉效果设置 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">✨ 视觉效果</h3>
              
              <div className="space-y-4">
                {/* 粒子效果 */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">启用粒子效果</label>
                  <input
                    type="checkbox"
                    checked={interfaceSettings.enableParticles}
                    onChange={(e) => setInterfaceSettings(prev => ({ ...prev, enableParticles: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                {/* 粒子生命周期 */}
                {interfaceSettings.enableParticles && (
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                      <span>粒子持续时间</span>
                      <span className="text-gray-500">{interfaceSettings.particleLifetime}ms</span>
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="3000"
                      step="100"
                      value={interfaceSettings.particleLifetime}
                      onChange={(e) => setInterfaceSettings(prev => ({ ...prev, particleLifetime: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-center pt-4 border-t">
              <button
                onClick={resetInterfaceSettings}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                重置默认
              </button>
            </div>

            {/* 快捷键提示 */}
            <div className="text-xs text-gray-500 border-t pt-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 快捷键提示</h4>
                <div className="space-y-1 text-blue-700">
                  <div>• Ctrl+S: 打开/关闭设置（主界面）</div>
                  <div>• Ctrl+H 或 F1: 显示/隐藏帮助（主界面）</div>
                  <div>• ESC: 关闭所有弹窗（主界面）</div>
                  <div>• 所有设置修改后会自动保存</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 映射配置标签页内容 */}
        {activeTab === 'other-config' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">映射配置</h2>

            {/* 网格设置 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">🎮 网格设置</h3>
              <div className="flex gap-6 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">行数</label>
                  <select
                    value={config.rows}
                    onChange={(e) => handleUpdateGridSize(parseInt(e.target.value), config.cols)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">列数</label>
                  <select
                    value={config.cols}
                    onChange={(e) => handleUpdateGridSize(config.rows, parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="ml-auto">
                  <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                    📊 总格子数: <span className="font-semibold text-blue-600">{config.rows * config.cols}</span> / {DEFAULT_KEYS.length}
                  </div>
                </div>
              </div>
            </div>

            {/* 网格预览 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">🎹 网格预览</h3>
              <div 
                className="grid gap-3 max-w-4xl mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${config.rows}, 1fr)`
                }}
              >
                {renderGrid()}
              </div>
              <div className="mt-6 text-sm text-gray-600 bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 操作指南</h4>
                <div className="space-y-1 text-blue-700">
                  <div>• 点击已有格子进行编辑配置</div>
                  <div>• 点击空格子可新增音效</div>
                  <div>• 在编辑界面可删除不需要的音效</div>
                  <div>• 配置修改后会自动保存</div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-center pt-4 border-t">
              <button
                onClick={handleResetConfig}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🔄 重置默认
              </button>
            </div>
          </div>
        )}

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
        

        {/* 背景音乐播放器 */}
        {currentBgMusic && (
          <audio
            ref={bgMusicRef}
            src={currentBgMusic.file}
            loop={currentBgMusic.loop}
          />
        )}
        
        {/* 预览音频播放器 */}
        <audio
          ref={previewAudioRef}
          onPlay={() => setPreviewPlaying(true)}
          onPause={() => setPreviewPlaying(false)}
          onEnded={() => {
            if (!previewMusic?.loop) {
              setPreviewMusic(null);
              setPreviewPlaying(false);
            }
          }}
          onError={() => {
            setPreviewMusic(null);
            setPreviewPlaying(false);
            alert('音频加载失败，请重试');
          }}
        />
      </div>
  );
}