'use client';

import { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/PopWindow';
import { getAudioGenerator } from '../utils/audioGenerator';
import { generateHappyBackgroundMusicBase64 } from '../utils/musicGenerator';
import { BackgroundMusic } from '../types';

interface BackgroundMusicManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onMusicSelect: (music: BackgroundMusic) => void;
  currentMusic?: BackgroundMusic;
  musics: BackgroundMusic[];
  onMusicsUpdate: (musics: BackgroundMusic[]) => void;
}

type Tab = 'upload' | 'generator' | 'rhythm';

// 添加默认属性的函数
const addDefaultProperties = (music: Partial<BackgroundMusic>): BackgroundMusic => {
  return {
    ...music,
    bpm: music.bpm ?? 120,
    timeSignature: music.timeSignature ?? {
      numerator: 4,
      denominator: 4
    },
    rhythmPattern: music.rhythmPattern ?? {
      enabled: false,
      pattern: [1, 0.5, 0.5, 0.5],
      soundType: 'sine',
      volume: 0.5
    }
  } as BackgroundMusic;
};

const handleMusicsUpdate = (updatedMusics: BackgroundMusic[], onMusicsUpdate: (musics: BackgroundMusic[]) => void) => {
  const processedMusics = updatedMusics.map(addDefaultProperties);
  onMusicsUpdate(processedMusics);
  localStorage.setItem('mikutap-background-music', JSON.stringify(processedMusics));
};

export default function BackgroundMusicManager({
  isOpen,
  onClose,
  onMusicSelect,
  currentMusic,
  musics: rawMusics,
  onMusicsUpdate
}: BackgroundMusicManagerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMusic, setPreviewMusic] = useState<BackgroundMusic | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioGenerator = getAudioGenerator();
  const [editingMusic, setEditingMusic] = useState<BackgroundMusic | null>(null);

  // 确保所有音乐都有必需的属性
  const musics = rawMusics.map(addDefaultProperties);

  // 预设的节奏型
  const presetRhythms = [
    { name: '4/4 行进', pattern: [1, 0.5, 0.5, 0.5] },
    { name: '3/4 圆舞曲', pattern: [1, 0.5, 0.5] },
    { name: '2/4 进行曲', pattern: [1, 0.5] },
    { name: '6/8 复合拍子', pattern: [1, 0.5, 0.5, 0.5, 0.5, 0.5] },
  ];

  // 当组件卸载时停止预览
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    };
  }, []);

  // 当预览的音乐改变时，更新音频元素
  useEffect(() => {
    if (audioRef.current) {
      if (previewMusic) {
        audioRef.current.src = previewMusic.file;
        audioRef.current.volume = previewMusic.volume;
        audioRef.current.loop = previewMusic.loop;
        // 开始播放
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error('播放失败:', error);
          setPreviewMusic(null);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [previewMusic]);

  // 处理预览播放
  const handlePreview = async (music: BackgroundMusic) => {
    try {
      if (previewMusic?.id === music.id && isPlaying) {
        // 如果是当前正在播放的音乐，则停止播放
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setPreviewMusic(null);
        setIsPlaying(false);
      } else {
        // 如果当前有其他音乐在播放，先停止它
        if (audioRef.current && isPlaying) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        // 开始预览并通知父组件
        setPreviewMusic(music);
        onMusicSelect(music);
      }
    } catch (error) {
      console.error('预览失败:', error);
      alert('预览失败，请重试');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newMusics: BackgroundMusic[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await fileToBase64(file);
        const duration = await getAudioDuration(file);
        
        const music: BackgroundMusic = {
          id: crypto.randomUUID(),
          name: file.name,
          file: base64,
          isDefault: musics.length === 0,
          volume: 0.5,
          loop: true,
          size: file.size,
          duration,
          bpm: 120,
          timeSignature: {
            numerator: 4,
            denominator: 4
          },
          rhythmPattern: {
            enabled: false,
            pattern: [1, 0.5, 0.5, 0.5],
            soundType: 'sine',
            volume: 0.5
          }
        };
        
        newMusics.push(music);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      const updatedMusics = [...musics, ...newMusics];
      handleMusicsUpdate(updatedMusics, onMusicsUpdate);
      
      alert(`成功上传 ${newMusics.length} 个背景音乐`);

    } catch (error) {
      console.error('文件上传失败:', error);
      alert('文件上传失败，请重试');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const base64Audio = await generateHappyBackgroundMusicBase64();
      
      const music: BackgroundMusic = {
        id: crypto.randomUUID(),
        name: '欢乐和弦进行.wav',
        file: base64Audio,
        isDefault: musics.length === 0,
        volume: 0.5,
        loop: true,
        description: 'C大调I-IV-V-I和弦进行，2/2拍，120BPM',
        bpm: 120,
        timeSignature: {
          numerator: 2,
          denominator: 2
        },
        rhythmPattern: {
          enabled: false,
          pattern: [1, 0.5],
          soundType: 'sine',
          volume: 0.5
        }
      };

      const updatedMusics = [...musics, music];
      handleMusicsUpdate(updatedMusics, onMusicsUpdate);

      alert('成功生成背景音乐');
    } catch (error) {
      console.error('生成音乐失败:', error);
      alert('生成音乐失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.onerror = () => {
        resolve(0);
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds === 0) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetDefault = (musicId: string) => {
    const updatedMusics = musics.map(music => ({
      ...music,
      isDefault: music.id === musicId
    }));
    handleMusicsUpdate(updatedMusics, onMusicsUpdate);
  };

  const handleDelete = (musicId: string) => {
    const updatedMusics = musics.filter(music => music.id !== musicId);
    handleMusicsUpdate(updatedMusics, onMusicsUpdate);
  };

  const handleVolumeChange = (musicId: string, volume: number) => {
    const updatedMusics = musics.map(music => 
      music.id === musicId ? { ...music, volume } : music
    );
    handleMusicsUpdate(updatedMusics, onMusicsUpdate);
  };

  const handleLoopChange = (musicId: string, loop: boolean) => {
    const updatedMusics = musics.map(music => 
      music.id === musicId ? { ...music, loop } : music
    );
    handleMusicsUpdate(updatedMusics, onMusicsUpdate);
  };

  // 处理节奏配置更新
  const handleRhythmUpdate = (musicId: string, updates: Partial<BackgroundMusic['rhythmPattern']>) => {
    const updatedMusics = musics.map(music => {
      if (music.id === musicId) {
        const updatedMusic = {
          ...music,
          rhythmPattern: {
            ...music.rhythmPattern,
            ...updates,
          },
        };
        // 如果当前音乐正在预览，通知父组件更新
        if (previewMusic?.id === musicId) {
          onMusicSelect(updatedMusic);
        }
        return updatedMusic;
      }
      return music;
    });
    handleMusicsUpdate(updatedMusics, onMusicsUpdate);
  };

  // 应用预设节奏型
  const applyPresetRhythm = (musicId: string, preset: typeof presetRhythms[0]) => {
    const music = musics.find(m => m.id === musicId);
    if (!music) return;

    const updatedMusics = musics.map(m => {
      if (m.id === musicId) {
        const updatedMusic = {
          ...m,
          rhythmPattern: {
            ...m.rhythmPattern,
            pattern: [...preset.pattern],
            enabled: true, // 自动启用节奏
          },
        };
        // 如果当前音乐正在预览，通知父组件更新
        if (previewMusic?.id === musicId) {
          onMusicSelect(updatedMusic);
        }
        return updatedMusic;
      }
      return m;
    });
    handleMusicsUpdate(updatedMusics, onMusicsUpdate);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setPreviewMusic(null);
        setIsPlaying(false);
        onClose();
      }}
      title="🎵 背景音乐管理"
      width={600}
      height="auto"
    >
      <div className="flex flex-col h-full">
        {/* 标签页切换 */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'upload' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            音乐上传
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'generator' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            音乐生成器
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'rhythm' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('rhythm')}
          >
            节奏配置
          </button>
        </div>

        {/* 上传标签页 */}
        {activeTab === 'upload' && (
          <div className="flex-1 overflow-y-auto">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isUploading ? '上传中...' : '上传音乐文件'}
              </button>
              {isUploading && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 生成器标签页 */}
        {activeTab === 'generator' && (
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  欢乐和弦进行
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  生成一段2/2拍的C大调和弦进行（I-IV-V-I），速度为120 BPM，适合作为欢快的背景音乐。
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                    isGenerating
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isGenerating ? '生成中...' : '生成音乐'}
                </button>
              </div>

              <div className="text-sm text-gray-500">
                <h4 className="font-medium text-gray-700 mb-2">
                  关于这个音乐生成器
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>使用C大调的I-IV-V-I和弦进行</li>
                  <li>2/2拍，每个和弦持续两拍</li>
                  <li>速度为120 BPM</li>
                  <li>使用正弦波合成，带有淡入淡出效果</li>
                  <li>支持循环播放</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 节奏配置标签页 */}
        {activeTab === 'rhythm' && (
          <div className="flex-1 overflow-y-auto">
            {musics.map(music => (
              <div key={music.id} className="border rounded p-4 mb-4">
                <h3 className="font-bold mb-2">{music.name}</h3>
                
                {/* 节奏启用开关 */}
                <div className="flex items-center mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={music.rhythmPattern.enabled}
                      onChange={e => handleRhythmUpdate(music.id, { enabled: e.target.checked })}
                      className="mr-2"
                    />
                    启用节奏
                  </label>
                </div>

                {music.rhythmPattern.enabled && (
                  <>
                    {/* BPM 设置 */}
                    <div className="mb-4">
                      <label className="block mb-1">速度 (BPM)</label>
                      <input
                        type="number"
                        min="40"
                        max="240"
                        value={music.bpm}
                        onChange={e => {
                          const updatedMusics = musics.map(m => {
                            if (m.id === music.id) {
                              return { ...m, bpm: Number(e.target.value) };
                            }
                            return m;
                          });
                          handleMusicsUpdate(updatedMusics, onMusicsUpdate);
                        }}
                        className="w-24 px-2 py-1 border rounded"
                      />
                    </div>

                    {/* 音色选择 */}
                    <div className="mb-4">
                      <label className="block mb-1">节奏音色</label>
                      <select
                        value={music.rhythmPattern.soundType}
                        onChange={e => handleRhythmUpdate(music.id, { soundType: e.target.value as any })}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="sine">正弦波</option>
                        <option value="square">方波</option>
                        <option value="sawtooth">锯齿波</option>
                        <option value="triangle">三角波</option>
                      </select>
                    </div>

                    {/* 节奏音量 */}
                    <div className="mb-4">
                      <label className="block mb-1">节奏音量</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={music.rhythmPattern.volume}
                        onChange={e => handleRhythmUpdate(music.id, { volume: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* 预设节奏型 */}
                    <div className="mb-4">
                      <label className="block mb-1">预设节奏型</label>
                      <div className="grid grid-cols-2 gap-2">
                        {presetRhythms.map((preset, index) => (
                          <button
                            key={index}
                            onClick={() => applyPresetRhythm(music.id, preset)}
                            className="px-3 py-1 border rounded hover:bg-gray-100"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 自定义节奏型 */}
                    <div className="mb-4">
                      <label className="block mb-1">自定义节奏型</label>
                      <div className="flex flex-wrap gap-2">
                        {music.rhythmPattern.pattern.map((value, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              const newPattern = [...music.rhythmPattern.pattern];
                              newPattern[index] = value === 1 ? 0.5 : value === 0.5 ? 0 : 1;
                              handleRhythmUpdate(music.id, { pattern: newPattern });
                            }}
                            className={`w-8 h-8 rounded ${
                              value === 1 ? 'bg-blue-500' :
                              value === 0.5 ? 'bg-blue-300' :
                              'bg-gray-200'
                            }`}
                          />
                        ))}
                        <button
                          onClick={() => {
                            const newPattern = [...music.rhythmPattern.pattern, 0];
                            handleRhythmUpdate(music.id, { pattern: newPattern });
                          }}
                          className="w-8 h-8 rounded border border-dashed border-gray-400 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 音乐列表 */}
        <div className="space-y-4">
          {musics.map(music => (
            <div
              key={music.id}
              className={`p-4 rounded-lg ${
                music.isDefault ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{music.name}</div>
                  <div className="text-sm text-gray-500">
                    {music.description && (
                      <div className="mb-1">{music.description}</div>
                    )}
                    {music.size && (
                      <span>大小: {formatFileSize(music.size)} | </span>
                    )}
                    {music.duration && (
                      <span>时长: {formatDuration(music.duration)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePreview(music)}
                    className={`px-2 py-1 rounded ${
                      previewMusic?.id === music.id && isPlaying
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {previewMusic?.id === music.id && isPlaying ? '停止' : '预览'}
                  </button>
                  <button
                    onClick={() => handleSetDefault(music.id)}
                    className={`px-2 py-1 rounded ${
                      music.isDefault
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {music.isDefault ? '默认' : '设为默认'}
                  </button>
                  <button
                    onClick={() => handleDelete(music.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <span className="text-sm">音量:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={music.volume}
                      onChange={(e) => {
                        const volume = parseFloat(e.target.value);
                        handleVolumeChange(music.id, volume);
                        if (previewMusic?.id === music.id && audioRef.current) {
                          audioRef.current.volume = volume;
                        }
                      }}
                      className="w-32"
                    />
                    <span className="text-sm">{Math.round(music.volume * 100)}%</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={music.loop}
                      onChange={(e) => {
                        const loop = e.target.checked;
                        handleLoopChange(music.id, loop);
                        if (previewMusic?.id === music.id && audioRef.current) {
                          audioRef.current.loop = loop;
                        }
                      }}
                    />
                    <span className="text-sm">循环播放</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {musics.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            还没有上传任何背景音乐
          </div>
        )}

        {/* 隐藏的音频元素用于预览 */}
        <audio
          ref={audioRef}
          onPlay={() => {
            setIsPlaying(true);
            if (previewMusic) {
              audioRef.current!.volume = previewMusic.volume;
              audioRef.current!.loop = previewMusic.loop;
            }
          }}
          onPause={() => {
            setIsPlaying(false);
          }}
          onEnded={() => {
            if (!previewMusic?.loop) {
              setPreviewMusic(null);
              setIsPlaying(false);
            }
          }}
          onError={() => {
            setPreviewMusic(null);
            setIsPlaying(false);
            alert('音频加载失败，请重试');
          }}
        />
      </div>
    </Modal>
  );
} 