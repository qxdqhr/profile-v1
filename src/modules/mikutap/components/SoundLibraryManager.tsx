'use client';

import { useState, useRef } from 'react';
import { Modal } from 'sa2kit/components';
import { SoundType, SOUND_TYPES, SOUND_TYPE_COLORS } from '../types';

interface SoundLibraryItem {
  id: string;
  name: string;
  file: string;
  type: SoundType;
  description: string;
  size: number;
  duration?: number;
}

interface SoundLibraryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSoundSelect: (sound: SoundLibraryItem) => void;
  sounds: SoundLibraryItem[];
  onSoundsUpdate: (sounds: SoundLibraryItem[]) => void;
}

export default function SoundLibraryManager({
  isOpen,
  onClose,
  onSoundSelect,
  sounds,
  onSoundsUpdate
}: SoundLibraryManagerProps) {
  const [selectedSound, setSelectedSound] = useState<SoundLibraryItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 支持的音频格式
  const supportedFormats = ['.mp3', '.wav', '.ogg', '.m4a', '.webm'];

  /**
   * 处理文件上传
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newSounds: SoundLibraryItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 检查文件格式
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!supportedFormats.includes(extension)) {
          alert(`不支持的音频格式: ${extension}`);
          continue;
        }

        // 检查文件大小 (限制10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`文件过大: ${file.name} (最大10MB)`);
          continue;
        }

        // 读取文件为Base64
        const base64 = await fileToBase64(file);
        
        // 获取音频时长
        const duration = await getAudioDuration(file);

        const newSound: SoundLibraryItem = {
          id: `sound_${Date.now()}_${i}`,
          name: file.name.replace(/\.[^/.]+$/, ''), // 去掉扩展名
          file: base64,
          type: 'custom',
          description: `上传的音频文件 - ${formatFileSize(file.size)}`,
          size: file.size,
          duration
        };

        newSounds.push(newSound);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      // 更新音效库
      const updatedSounds = [...sounds, ...newSounds];
      onSoundsUpdate(updatedSounds);
      
      // 保存到localStorage
      localStorage.setItem('mikutap-sound-library', JSON.stringify(updatedSounds));

      alert(`成功上传 ${newSounds.length} 个音频文件`);

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

  /**
   * 将文件转换为Base64
   */
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

  /**
   * 获取音频时长
   */
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.onerror = () => {
        resolve(0); // 如果无法获取时长，返回0
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * 格式化时长
   */
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds === 0) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * 删除音效
   */
  const deleteSound = (soundId: string) => {
    if (!confirm('确定要删除这个音效吗？')) return;
    
    const updatedSounds = sounds.filter(s => s.id !== soundId);
    onSoundsUpdate(updatedSounds);
    localStorage.setItem('mikutap-sound-library', JSON.stringify(updatedSounds));
    
    if (selectedSound?.id === soundId) {
      setSelectedSound(null);
    }
  };

  /**
   * 预览音效
   */
  const previewSound = async (sound: SoundLibraryItem) => {
    try {
      const audio = new Audio(sound.file);
      audio.volume = 0.5;
      await audio.play();
    } catch (error) {
      console.error('预览音效失败:', error);
      alert('无法预览此音效');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎵 音效库管理"
      width={800}
      height={600}
    >
      <div className="flex h-full">
        {/* 左侧：音效列表 */}
        <div className="w-1/2 border-r border-gray-200 p-4">
          <div className="mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  上传中... {Math.round(uploadProgress)}%
                </>
              ) : (
                <>
                  <span>📁</span>
                  上传音频文件
                </>
              )}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={supportedFormats.join(',')}
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <div className="text-xs text-gray-500 mt-2">
              支持格式: {supportedFormats.join(', ')} (最大10MB)
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sounds.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-2xl mb-2">🎵</div>
                <div>暂无音效文件</div>
                <div className="text-sm">点击上方按钮上传音频</div>
              </div>
            ) : (
              sounds.map((sound) => (
                <div
                  key={sound.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedSound?.id === sound.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedSound(sound)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{sound.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span
                          className="px-2 py-1 rounded text-xs text-white"
                          style={{ backgroundColor: SOUND_TYPE_COLORS[sound.type] }}
                        >
                          {sound.type}
                        </span>
                        <span>{formatFileSize(sound.size)}</span>
                        <span>{formatDuration(sound.duration || 0)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          previewSound(sound);
                        }}
                        className="p-1 hover:bg-blue-100 rounded"
                        title="预览"
                      >
                        ▶️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSound(sound.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded"
                        title="删除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 右侧：音效详情 */}
        <div className="w-1/2 p-4">
          {selectedSound ? (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-bold mb-2">{selectedSound.name}</h3>
                <p className="text-gray-600">{selectedSound.description}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">音效类型:</span>
                  <span
                    className="px-2 py-1 rounded text-xs text-white"
                    style={{ backgroundColor: SOUND_TYPE_COLORS[selectedSound.type] }}
                  >
                    {selectedSound.type}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">文件大小:</span>
                  <span>{formatFileSize(selectedSound.size)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">时长:</span>
                  <span>{formatDuration(selectedSound.duration || 0)}</span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <button
                  onClick={() => previewSound(selectedSound)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🎵 预览音效
                </button>

                <button
                  onClick={() => {
                    onSoundSelect(selectedSound);
                    onClose();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  ✅ 选择此音效
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-2xl mb-2">👈</div>
              <div>选择左侧音效查看详情</div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
} 