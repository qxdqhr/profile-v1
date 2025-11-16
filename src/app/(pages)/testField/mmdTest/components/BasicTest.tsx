'use client'

/**
 * 基础测试 - 使用 MMDViewer 组件
 * 
 * 测试最基本的 MMD 模型加载和显示功能
 */

import React from 'react'
import { MMDViewer } from '@sa2kit'

/**
 * 基础测试组件
 * 
 * 验证功能：
 * - MMD 模型加载
 * - 基础渲染
 * - 场景初始化
 * - 相机控制
 */
export default function BasicTest() {
  return (
    <div className="relative w-full h-screen">
      <MMDViewer
        modelPath="/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx"
        modelFileName=""
        ammoJsPath="/mikutalking/libs/ammo.wasm.js"
        ammoWasmPath="/mikutalking/libs/ammo.wasm.wasm"
        enablePhysics={true}
        enableGround={true}
        showGround={true}
        showGrid={false}
        cameraPosition={[0, 10, 25]}
        cameraTarget={[0, 10, 0]}
        backgroundColor={0x000000}
        debugMode={true}
        logLevel="debug"
        onProgress={(progress) => {
          console.log('🔄 [基础测试] 加载进度:', `${progress}%`)
        }}
        onLoad={() => {
          console.log('✅ [基础测试] 模型加载完成')
        }}
        onError={(error) => {
          console.error('❌ [基础测试] 加载错误:', error)
        }}
      />

      {/* 说明面板 */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-6 py-4 rounded-lg shadow-xl max-w-md">
        <h3 className="text-lg font-bold text-blue-400 mb-2">📦 基础测试</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <p>✅ 使用 <code className="text-blue-300">MMDViewer</code> 组件</p>
          <p>✅ 加载 MMD 模型（YYB_Z6SakuraMiku）</p>
          <p>✅ 启用物理引擎</p>
          <p>✅ 显示地面</p>
          <p>💡 可以拖动旋转、滚轮缩放</p>
        </div>
      </div>

      {/* 测试信息 */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg shadow-xl">
        <div className="text-xs text-gray-400">
          <p>模型: YYB_Z6SakuraMiku</p>
          <p>物理: 已启用</p>
          <p>组件: MMDViewer</p>
        </div>
      </div>
    </div>
  )
}

