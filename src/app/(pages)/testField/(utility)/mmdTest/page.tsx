'use client'

import { useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  MMDPlayerEnhanced,
  availableMMDPresets,
  defaultMMDPreset,
  type MMDPreset,
  type MMDResourceItem,
} from 'sa2kit/mmd'

const presets: MMDPreset[] = availableMMDPresets

export default function MMDTestPage() {
  // ==================== 动态资源切换示例 ====================
  // 定义多个资源配置，用户可以通过设置按钮切换
  const resourcesList: MMDResourceItem[] = [
    {
      id: 'catch-the-wave-miku',
      name: 'Catch The Wave - 初音未来',
      resources: {
        modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
        motionPath: '/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd',
        cameraPath: '/mikutalking/actions/CatchTheWave/camera.vmd',
        audioPath: '/mikutalking/actions/CatchTheWave/pv_268.wav',
      },
    },
    {
      id: 'catch-the-wave-elsa',
      name: 'Catch The Wave - 艾尔莎',
      resources: {
        modelPath: '/mikutalking/models/艾尔莎/艾尔莎-水手服泳装.pmx',
        motionPath: '/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd',
        cameraPath: '/mikutalking/actions/CatchTheWave/camera.vmd',
        audioPath: '/mikutalking/actions/CatchTheWave/pv_268.wav',
      },
    },
    {
      id: 'static-miku',
      name: '静态模型 - 初音未来',
      resources: {
        modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
      },
    },
    {
      id: 'static-elsa',
      name: '静态模型 - 艾尔莎',
      resources: {
        modelPath: '/mikutalking/models/艾尔莎/艾尔莎-水手服泳装.pmx',
      },
    },
  ];

  const customStage = {
    backgroundColor: '#01030b',
    cameraPosition: { x: 0, y: 10, z: 30 },
    cameraTarget: { x: 0, y: 10, z: 0 },
    enablePhysics: true,
    showGrid: false,
    ammoPath: '/mikutalking/libs/ammo.wasm.js',
    ammoWasmPath: '/mikutalking/libs/',
  };

  return (
    <div className="fixed inset-0 z-0 bg-[#01030b] text-white flex flex-col">
      {/*
        ==================== 动态资源切换使用说明 ====================
        
        1. **resourcesList 参数**：
           - 传入 MMDResourceItem[] 数组，每个项目包含 id、name 和 resources
           - 自动在播放控制栏显示设置按钮（⚙️）
           - 点击设置按钮可打开资源选择弹窗
        
        2. **defaultResourceId 参数**：
           - 指定初始加载的资源ID（对应 resourcesList 中的某个 id）
           - 如果不指定，默认使用第一个资源
        
        3. **onResourceChange 回调**：
           - 当用户切换资源时触发
           - 参数为新选中的资源ID
        
        4. **添加更多资源**：
           - 在上面的 resourcesList 数组中添加新的配置项
           - 每个配置可以包含：modelPath（模型）、motionPath（动作）、cameraPath（相机）、audioPath（音频）
           - 任何资源都是可选的（除了 modelPath 必须提供）
        
        5. **单资源模式**：
           - 如果不需要切换功能，可以使用 resources 参数直接传入单个资源
           - 例如：resources={customResources} stage={customStage}
           - 单资源模式下不会显示设置按钮
      */}
      <MMDPlayerEnhanced
        className="h-full w-full"
        resourcesList={resourcesList}
        defaultResourceId="catch-the-wave-miku"
        stage={customStage}
        autoPlay
        loop
        onResourceChange={(id) => console.log('🔄 资源已切换:', id)}
      />
    </div>
  )
}

