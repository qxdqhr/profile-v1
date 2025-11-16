'use client'

/**
 * 镜头测试 - 暂未实现
 * 
 * 当前 MMDViewer 组件还不支持相机动画功能。
 * 需要等待动画系统完成后才能支持 VMD 相机动画。
 */

import React from 'react'

export default function CameraTest() {
  return (
    <div className="relative h-full w-full flex items-center justify-center bg-gray-900">
      <div className="max-w-2xl p-8 bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl text-white">
        <div className="text-6xl mb-6 text-center">📹</div>
        <h2 className="text-3xl font-bold mb-4 text-center">镜头动画测试</h2>
        <p className="text-gray-300 mb-4 text-center">
          此功能正在开发中...
        </p>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
          <h3 className="text-blue-400 font-semibold mb-2">ℹ️ 功能说明</h3>
          <p className="text-sm text-gray-300 mb-2">
            VMD 相机动画需要配合动画系统一起工作,当前动画系统尚未完成。
          </p>
          <p className="text-sm text-gray-300">
            完成后将支持:
          </p>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside mt-2">
            <li>加载 VMD 相机动画文件</li>
            <li>相机路径动画</li>
            <li>相机视角动画</li>
            <li>与模型动画同步</li>
          </ul>
        </div>
        <p className="text-sm text-gray-400 text-center">
          请使用 <span className="text-blue-400 font-mono">基础测试</span> 查看手动相机控制功能
        </p>
      </div>
    </div>
  )
}
