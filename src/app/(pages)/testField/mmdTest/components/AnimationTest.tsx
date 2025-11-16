'use client'

/**
 * 动画测试 - 使用 MMDAnimationViewer 组件
 * 
 * 测试 MMD 动画播放功能，包括动作、音频同步等
 */

import React, { useState, useRef } from 'react'
import { MMDAnimationViewer, PlaybackControlsExtended } from '@sa2kit'

/**
 * 动画测试组件
 * 
 * 验证功能：
 * - MMD 模型加载
 * - VMD 动画播放
 * - 音频同步
 * - 播放控制（播放、暂停、停止）
 * - 进度跟踪
 */
export default function AnimationTest() {
  const [controls, setControls] = useState<PlaybackControlsExtended | null>(null)
  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoop, setIsLoop] = useState(false)

  return (
    <div className="relative w-full h-screen">
      <MMDAnimationViewer
        // 模型配置
        modelPath="/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx"
        modelFileName=""
        
        // 动画配置
        motionPath="/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd"
        // cameraMotionPath="/mikutalking/actions/CatchTheWave/camera.vmd" // 不使用相机动画，允许自由控制
        audioPath="/mikutalking/actions/CatchTheWave/pv_268.wav"
        
        // 播放配置
        autoPlay={false}
        loop={false}
        volume={0.7}
        
        // 场景配置
        backgroundColor={0x000000}
        enableShadows={true}
        showGround={true}
        groundColor={0x333333}
        showGrid={false}
        ambientLightIntensity={1.0}  // 默认值：正常环境光
        directionalLightIntensity={0.8}  // 默认值：正常方向光
        
        // 相机配置
        cameraPosition={[0, 10, 25]}
        cameraTarget={[0, 10, 0]}
        enableCameraControls={true}  // 启用自由镜头控制
        
        // 物理配置
        enablePhysics={true}
        enableIK={true}
        enableGrant={true}
        ammoJsPath="/mikutalking/libs/ammo.wasm.js"
        ammoWasmPath="/mikutalking/libs/ammo.wasm.wasm"
        
        // 调试配置
        debugMode={true}
        logLevel="debug"
        
        // 回调函数
        onReady={(ctrl) => {
          console.log('✅ [动画测试] 动画就绪')
          setControls(ctrl)
          setIsReady(true)
        }}
        onLoad={() => {
          console.log('✅ [动画测试] 模型加载完成')
        }}
        onPlay={() => {
          console.log('▶️ [动画测试] 开始播放')
          setIsPlaying(true)
        }}
        onPause={() => {
          console.log('⏸️ [动画测试] 暂停')
          setIsPlaying(false)
        }}
        onStop={() => {
          console.log('⏹️ [动画测试] 停止')
          setIsPlaying(false)
          setProgress(0)
        }}
        onProgress={(prog) => {
          setProgress(prog)
        }}
        onEnd={() => {
          console.log('🏁 [动画测试] 播放结束')
          setIsPlaying(false)
        }}
        onError={(error) => {
          console.error('❌ [动画测试] 错误:', error)
        }}
      />

      {/* 播放控制面板 */}
      {isReady && controls && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-8 py-4 rounded-2xl shadow-2xl min-w-[400px]">
          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2 text-sm text-gray-300">
              <span>{formatTime(progress * controls.duration)}</span>
              <span className="text-blue-400 font-medium">
                {(progress * 100).toFixed(1)}%
              </span>
              <span>{formatTime(controls.duration)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 cursor-pointer"
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect()
                   const x = e.clientX - rect.left
                   const percent = x / rect.width
                   controls.seek(percent * controls.duration)
                 }}>
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-center gap-3">
            {/* 停止按钮 */}
            <button
              onClick={() => controls.stop()}
              className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
              title="停止"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <rect x="6" y="6" width="8" height="8" />
              </svg>
            </button>

            {/* 播放/暂停按钮 */}
            <button
              onClick={() => isPlaying ? controls.pause() : controls.play()}
              className={`p-4 rounded-full transition-all ${
                isPlaying 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/50'
              }`}
              title={isPlaying ? "暂停" : "播放"}
            >
              {isPlaying ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 4l10 6-10 6V4z"/>
                </svg>
              )}
            </button>

            {/* 音量控制 */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5v13l-4-4H3v-5h3l4-4zm5.5 6.5c0-1.77-1-3.29-2.5-4.03v8.05c1.5-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="70"
                className="w-24"
                onChange={(e) => controls.setVolume(parseInt(e.target.value) / 100)}
              />
            </div>

            {/* 循环播放 */}
            <button
              onClick={() => {
                const newLoop = !isLoop
                setIsLoop(newLoop)
                controls.setLoop(newLoop)
              }}
              className={`p-3 rounded-full transition-colors ${
                isLoop 
                  ? 'bg-blue-600 hover:bg-blue-500' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              title={isLoop ? "循环播放：开" : "循环播放：关"}
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 2v6h6M16 18v-6h-6M18 9a8 8 0 11-16 0 8 8 0 0116 0z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 说明面板 */}
      <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md px-6 py-4 rounded-lg shadow-xl max-w-md">
        <h3 className="text-lg font-bold text-green-400 mb-2">🎬 动画测试</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <p>✅ 使用 <code className="text-green-300">MMDAnimationViewer</code> 组件</p>
          <p>✅ 加载 VMD 动作文件</p>
          <p>✅ 加载 VMD 相机动画</p>
          <p>✅ 音频同步播放</p>
          <p>✅ 物理引擎支持</p>
          <p className="text-xs text-gray-500 mt-2">
            曲目: CatchTheWave by Yunomi
          </p>
        </div>
      </div>

      {/* 测试信息 */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg shadow-xl">
        <div className="text-xs text-gray-400">
          <p>动作: CatchTheWave</p>
          <p>状态: {isReady ? '就绪' : '加载中...'}</p>
          <p>播放: {isPlaying ? '是' : '否'}</p>
          <p>循环: {isLoop ? '开' : '关'}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * 格式化时间显示
 */
function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
