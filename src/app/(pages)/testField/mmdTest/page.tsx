'use client'

/**
 * MMD 测试页面
 * 
 * 用于验证 SA2Kit MMD 功能
 * 
 * 测试模式：
 * - basic: 基础测试 - 使用 MMDViewer 组件加载基础模型
 * - animation: 动画测试 - 测试动画播放功能
 * - camera: 相机测试 - 测试相机动画功能
 * - hooks: Hooks 测试 - 测试底层 Hooks API
 */

import React, { useState } from 'react'
import BasicTest from './components/BasicTest'
import AnimationTest from './components/AnimationTest'
import CameraTest from './components/CameraTest'
import HooksTest from './components/HooksTest'

type TestMode = 'basic' | 'animation' | 'camera' | 'hooks'

export default function MMDTestPage() {
  const [testMode, setTestMode] = useState<TestMode>('animation')

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 渲染对应的测试组件 */}
      {testMode === 'basic' && <BasicTest />}
      {testMode === 'animation' && <AnimationTest />}
      {testMode === 'camera' && <CameraTest />}
      {testMode === 'hooks' && <HooksTest />}

      {/* 模式选择按钮 */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2 flex gap-3 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full shadow-xl z-50">
        <button
          onClick={() => setTestMode('basic')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            testMode === 'basic'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title="测试基础模型加载和显示"
        >
          📦 基础测试
        </button>
        <button
          onClick={() => setTestMode('animation')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            testMode === 'animation'
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title="测试动画播放功能"
        >
          🎬 动画测试
        </button>
        <button
          onClick={() => setTestMode('camera')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            testMode === 'camera'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title="测试相机动画功能"
        >
          📷 相机测试
        </button>
        <button
          onClick={() => setTestMode('hooks')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            testMode === 'hooks'
              ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title="测试底层 Hooks API"
        >
          🎣 Hooks 测试
        </button>
      </div>

      {/* 顶部标题 */}
      <div className="absolute left-4 top-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg shadow-xl z-40">
        <div className="text-sm">
          <div className="font-bold text-white mb-1">SA2Kit MMD 功能测试</div>
          <div className="text-xs text-gray-400">
            基于 sa2kit 库构建
          </div>
        </div>
      </div>

      {/* 帮助信息 */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg shadow-xl z-40 group">
        <div className="text-sm text-gray-400 cursor-help">
          ❓ 帮助
        </div>
        <div className="absolute right-0 top-full mt-2 w-80 bg-black/90 backdrop-blur-md px-4 py-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
          <div className="text-xs text-gray-300 space-y-2">
            <p className="font-bold text-white">测试说明：</p>
            <p>📦 <span className="text-blue-400">基础测试</span>: 验证模型加载和基础渲染</p>
            <p>🎬 <span className="text-green-400">动画测试</span>: 验证 VMD 动画播放</p>
            <p>📷 <span className="text-purple-400">相机测试</span>: 验证相机动画</p>
            <p>🎣 <span className="text-yellow-400">Hooks 测试</span>: 验证底层 Hooks API</p>
            <hr className="border-gray-700 my-2" />
            <p className="text-xs text-gray-500">
              💡 提示: 可以拖动旋转视角，滚轮缩放
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
