'use client';

import { useState } from 'react';
import { generateHappyBackgroundMusicBase64 } from '../utils/musicGenerator';

export default function MusicGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const base64Audio = await generateHappyBackgroundMusicBase64();
      setAudioUrl(base64Audio);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成音乐失败');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            背景音乐生成器
          </h1>

          <div className="space-y-6">
            <div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                  isGenerating
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isGenerating ? '生成中...' : '生成欢乐背景音乐'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {audioUrl && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">
                  预览
                </h2>
                <audio
                  controls
                  className="w-full"
                  src={audioUrl}
                />
                <div className="text-sm text-gray-500">
                  提示：你可以右键点击音频播放器，选择"保存音频为..."来下载音频文件
                </div>
              </div>
            )}

            <div className="mt-8 text-sm text-gray-500">
              <h3 className="font-medium text-gray-700 mb-2">
                关于这个背景音乐
              </h3>
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
      </div>
    </div>
  );
} 