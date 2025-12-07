'use client';

import React from 'react';
import { MMDPlayerEnhanced } from 'sa2kit/mmd';
const OSS_BASE_PATH = 'https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/mmd'

export default function MMDTestPage() {
  const resources = {
    modelPath: `${OSS_BASE_PATH}/2025/11/25/erusa-sailor-swim/erusa-sailor-swim.pmx`,
    motionPath: '/mikutalking/actions/打招呼.vmd',
  };

  const stageConfig = {
    physicsPath: '/mikutalking/libs/ammo.wasm.js',
    enablePhysics: true,
    backgroundColor: '#2d3748', // dark gray
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      <header className="p-4 bg-gray-800 text-white border-b border-gray-700">
        <h1 className="text-xl font-bold">MMD Player Test (sa2kit)</h1>
        <p className="text-sm text-gray-400">Testing MMDPlayerEnhanced with local resources</p>
      </header>
      <main className="flex-1 relative overflow-hidden">
        <MMDPlayerEnhanced
          resources={resources}
          stage={stageConfig}
          autoPlay={true}
          loop={true}
          className="w-full h-full"
          mobileOptimization={{
            enabled: false,
            pixelRatio: 1
          }}
        />
      </main>
    </div>
  );
}

