'use client'

import React, { useState } from 'react'

/**
 * 控制面板组件的属性接口
 */
interface ControlPanelProps {
  /** 音量大小 (0-1) */
  volume: number
  /** 音效是否启用 */
  soundEnabled: boolean
  /** 背景音乐是否启用 */
  musicEnabled: boolean
  /** 调试模式是否开启 */
  debugMode: boolean
  /** 音量变化回调函数 */
  onVolumeChange: (volume: number) => void
  /** 音效开关切换回调函数 */
  onSoundToggle: () => void
  /** 背景音乐开关切换回调函数 */
  onMusicToggle: () => void
  /** 调试模式开关切换回调函数 */
  onDebugToggle: () => void
  /** 显示教程回调函数 */
  onShowTutorial: () => void
}

/**
 * 控制面板组件
 * 
 * 功能说明：
 * - 提供浮动按钮入口（设置、帮助、返回）
 * - 提供完整的游戏设置面板（音量、音效、音乐、调试模式）
 * - 支持模态窗口形式的设置界面
 * - 包含自定义开关组件实现
 * 
 * @component
 */
export default function ControlPanel({
  volume,
  soundEnabled,
  musicEnabled,
  debugMode,
  onVolumeChange,
  onSoundToggle,
  onMusicToggle,
  onDebugToggle,
  onShowTutorial,
}: ControlPanelProps) {
  // ========== 状态管理 ==========
  /** 设置面板是否显示 */
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      {/* ========== 浮动控制按钮组 ========== */}
      <div className="fixed top-4 right-4 z-30 flex flex-col gap-2">
        {/* 设置按钮 - 打开/关闭设置面板 */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center"
          title="设置"
        >
          <span className="text-xl">⚙️</span>
        </button>

        {/* 帮助按钮 - 显示教程 */}
        <button
          onClick={onShowTutorial}
          className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center"
          title="帮助"
        >
          <span className="text-xl">❓</span>
        </button>

        {/* 返回按钮 - 返回上一页 */}
        <button
          onClick={() => window.history.back()}
          className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center"
          title="返回"
        >
          <span className="text-xl">🏠</span>
        </button>
      </div>

      {/* ========== 设置面板模态窗口 ========== */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
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

            {/* 设置内容区域 */}
            <div className="p-6 space-y-6">
              {/* 音量控制滑块 */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">音量</span>
                  <span className="text-sm text-gray-500">{Math.round(volume * 100)}%</span>
                </label>
                {/* 音量滑块 - 0到1之间 */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* 音效开关 - 自定义切换组件 */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">音效</span>
                {/* iOS风格的切换开关 */}
                <button
                  onClick={onSoundToggle}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  {/* 滑块 */}
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 背景音乐开关 - 自定义切换组件 */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">背景音乐</span>
                {/* iOS风格的切换开关 */}
                <button
                  onClick={onMusicToggle}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    musicEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  {/* 滑块 */}
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      musicEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 调试模式开关 - 显示交互区域等调试信息 */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">调试模式</span>
                {/* iOS风格的切换开关 */}
                <button
                  onClick={onDebugToggle}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    debugMode ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  {/* 滑块 */}
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      debugMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 分隔线 */}
              <div className="border-t border-gray-200" />

              {/* 游戏信息展示 */}
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

