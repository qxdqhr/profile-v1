'use client'

import React, { useState } from 'react'
import type { RecordingState, VoiceEffectType } from '../types'

interface RightPanelProps {
  // 相机控制
  cameraControls: {
    moveCamera: (deltaX: number, deltaY: number) => void
    zoomCamera: (delta: number) => void
    resetCamera: () => void
  } | null

  // MMD动作播放
  animationControls?: {
    playAnimation: () => Promise<void>
    pauseAnimation: () => void
    resumeAnimation: () => void
    stopAnimation: () => void
    isPlaying: boolean
    progress: number
  } | null

  // 语音录制
  recordingState: RecordingState
  currentVoiceEffect: VoiceEffectType
  onRecordingStateChange: (state: RecordingState) => void
  onVoiceEffectChange: (effect: VoiceEffectType) => void
  soundEnabled: boolean

  // 设置
  volume: number
  musicEnabled: boolean
  debugMode: boolean
  onVolumeChange: (volume: number) => void
  onSoundToggle: () => void
  onMusicToggle: () => void
  onDebugToggle: () => void
  onShowTutorial: () => void
}

/**
 * 右侧功能面板 - 整合所有右侧控制
 */
export default function RightPanel({
  cameraControls,
  animationControls,
  recordingState,
  currentVoiceEffect,
  onRecordingStateChange,
  onVoiceEffectChange,
  soundEnabled,
  volume,
  musicEnabled,
  debugMode,
  onVolumeChange,
  onSoundToggle,
  onMusicToggle,
  onDebugToggle,
  onShowTutorial,
}: RightPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      {/* 整体容器 */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
        {/* 面板内容（可展开/收起） */}
        <div
          className={`bg-white/95 backdrop-blur-md shadow-2xl rounded-l-2xl transition-all duration-300 overflow-hidden ${
            isExpanded ? 'w-80 opacity-100' : 'w-0 opacity-0'
          }`}
        >
          <div className="p-4 space-y-4">
            {/* 相机控制 */}
            {cameraControls && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span>📷</span>
                  <span>相机控制</span>
                </h3>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => cameraControls.zoomCamera(-0.5)}
                      className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      放大 +
                    </button>
                    <button
                      onClick={() => cameraControls.zoomCamera(0.5)}
                      className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      缩小 -
                    </button>
                  </div>
                  
                  <button
                    onClick={cameraControls.resetCamera}
                    className="w-full py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
                  >
                    🔄 重置视角
                  </button>
                </div>
              </div>
            )}

            {/* 分隔线 */}
            <div className="border-t border-gray-200" />

            {/* MMD动作播放 */}
            {animationControls && (
              <>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span>🎭</span>
                    <span>MMD动作</span>
                  </h3>
                  
                  {/* 控制按钮组 */}
                  <div className="flex gap-2">
                    {/* 播放/暂停按钮 */}
                    {!animationControls.isPlaying ? (
                      <button
                        onClick={() => {
                          if (animationControls.progress === 0) {
                            animationControls.playAnimation()
                          } else {
                            animationControls.resumeAnimation()
                          }
                        }}
                        className="flex-1 py-3 rounded-lg transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg"
                      >
                        <span>▶️</span>
                        <span>{animationControls.progress === 0 ? '播放' : '继续'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => animationControls.pauseAnimation()}
                        className="flex-1 py-3 rounded-lg transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
                      >
                        <span>⏸️</span>
                        <span>暂停</span>
                      </button>
                    )}
                    
                    {/* 停止按钮 */}
                    <button
                      onClick={() => animationControls.stopAnimation()}
                      disabled={!animationControls.isPlaying && animationControls.progress === 0}
                      className={`flex-1 py-3 rounded-lg transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2 ${
                        !animationControls.isPlaying && animationControls.progress === 0
                          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                          : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg'
                      }`}
                    >
                      <span>⏹️</span>
                      <span>停止</span>
                    </button>
                  </div>

                  {/* 进度条 */}
                  {animationControls.progress > 0 && (
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-300"
                          style={{ width: `${animationControls.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-center text-gray-600 flex items-center justify-center gap-2">
                        <span>{Math.round(animationControls.progress)}%</span>
                        {animationControls.isPlaying && <span className="animate-pulse">🎵</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* 分隔线 */}
                <div className="border-t border-gray-200" />
              </>
            )}

            {/* 语音录制 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span>🎤</span>
                <span>语音录制</span>
              </h3>
              
              <div className="text-center text-xs text-gray-500">
                {recordingState === 'idle' && '点击开始录音'}
                {recordingState === 'recording' && '录音中...'}
                {recordingState === 'processing' && '处理中...'}
              </div>
            </div>

            {/* 分隔线 */}
            <div className="border-t border-gray-200" />

            {/* 快捷操作 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span>⚡</span>
                <span>快捷操作</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  ⚙️ 设置
                </button>
                
                <button
                  onClick={onShowTutorial}
                  className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  ❓ 帮助
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium col-span-2"
                >
                  🏠 返回主页
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 展开/收起按钮 */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-12 h-20 bg-white/90 backdrop-blur-md rounded-l-xl shadow-lg hover:bg-white transition-colors flex items-center justify-center"
          >
            <span className="text-xl">{isExpanded ? '▶' : '◀'}</span>
          </button>
        </div>
      </div>

      {/* 设置面板（全屏模态） */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* 标题栏 */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">游戏设置</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            {/* 设置内容 */}
            <div className="p-6 space-y-6">
              {/* 音量控制 */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">音量</span>
                  <span className="text-sm text-gray-500">{Math.round(volume * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* 音效开关 */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">音效</span>
                <button
                  onClick={onSoundToggle}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 背景音乐开关 */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">背景音乐</span>
                <button
                  onClick={onMusicToggle}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    musicEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      musicEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 调试模式开关 */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">调试模式</span>
                <button
                  onClick={onDebugToggle}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    debugMode ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      debugMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 分隔线 */}
              <div className="border-t border-gray-200" />

              {/* 游戏信息 */}
              <div className="text-center text-sm text-gray-500 space-y-1">
                <div>米库说话 v1.0</div>
                <div>基于Three.js和MMD模型</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

