'use client'

/**
 * Hooks 测试 - 暂未实现
 * 
 * useMMDLoader 和 useMMDAnimation hooks 的 API 需要进一步完善和测试。
 * 当前版本建议使用 MMDViewer 组件进行基础功能验证。
 */

import React from 'react'

/**
 * Hooks 测试组件
 * 
 * 待验证功能：
 * - useMMDLoader Hook
 * - useMMDAnimation Hook
 * - useMMDCamera Hook
 * - 手动场景管理
 * - 自定义渲染循环
 */
export default function HooksTest() {
  return (
    <div className="relative h-full w-full flex items-center justify-center bg-gray-900">
      <div className="max-w-2xl p-8 bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl text-white">
        <div className="text-6xl mb-6 text-center">🎣</div>
        <h2 className="text-3xl font-bold mb-4 text-center">Hooks API 测试</h2>
        <p className="text-gray-300 mb-4 text-center">
          此功能正在开发中...
        </p>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
          <h3 className="text-purple-400 font-semibold mb-2">🔧 React Hooks API</h3>
          <p className="text-sm text-gray-300 mb-2">
            sa2kit 提供了以下 React Hooks:
          </p>
          <ul className="text-sm text-gray-300 space-y-2 list-none">
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <div>
                <code className="text-blue-300">useMMDLoader()</code>
                <p className="text-gray-400 text-xs mt-1">用于加载 MMD 模型、动画和相机文件</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <div>
                <code className="text-blue-300">useMMDAnimation(options)</code>
                <p className="text-gray-400 text-xs mt-1">用于管理动画播放、暂停、停止</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <div>
                <code className="text-blue-300">useMMDCamera(camera, motion, config)</code>
                <p className="text-gray-400 text-xs mt-1">用于管理相机动画</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
          <h3 className="text-yellow-400 font-semibold mb-2">⚠️ API 设计中</h3>
          <p className="text-sm text-gray-300">
            Hooks API 正在进行最终的设计和测试。
            当前建议使用高级组件 <code className="text-blue-300">MMDViewer</code> 进行功能验证。
          </p>
        </div>
        <p className="text-sm text-gray-400 text-center">
          请使用 <span className="text-blue-400 font-mono">基础测试</span> 查看 MMDViewer 组件功能
        </p>
      </div>
    </div>
  )
}
