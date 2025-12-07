'use client';

import React, { useEffect, useState } from 'react';
import { MMDPlaylist, type MMDPlaylistConfig } from 'sa2kit/mmd';

const OSS_BASE_PATH = 'https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/mmd';

export default function MMDPlaylistTestPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // 定义播放列表
  const playlist: MMDPlaylistConfig = {
    id: 'test-playlist',
    name: 'MMD 播放列表测试',
    nodes: [
      {
        id: 'node-1',
        name: '场景 1 - 打招呼',
        resources: {
          modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
          motionPath: '/mikutalking/actions/打招呼.vmd',
        },
        duration: 10,
      },
      {
        id: 'node-2',
        name: '场景 2 - Erusa Sailor',
        resources: {
          modelPath: `${OSS_BASE_PATH}/2025/11/25/erusa-sailor-swim/erusa-sailor-swim.pmx`,
          motionPath: '/mikutalking/actions/打招呼.vmd',
        },
        duration: 15,
      },
      {
        id: 'node-3',
        name: '场景 3 - Miku 本地',
        resources: {
          modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
          motionPath: '/mikutalking/actions/打招呼.vmd',
        },
        duration: 12,
      },
    ],
    loop: true, // 列表循环
    preload: 'next', // 预加载下一个节点
    autoPlay: true,
  };

  const stageConfig = {
    physicsPath: '/mikutalking/libs/ammo.wasm.js',
    enablePhysics: true,
    backgroundColor: '#1a1a2e', // 深蓝色背景
  };

  if (!mounted) {
    // 仅在客户端挂载后再渲染调试组件，避免 SSR 时间文本导致的 hydration mismatch
    return null;
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">

      {/* 主要内容区 - 播放列表播放器 */}
      <main className="flex-1 relative overflow-hidden">
        <MMDPlaylist
          playlist={playlist}
          stage={stageConfig}
          showDebugInfo={true}
          mobileOptimization={{
            enabled: false,
            pixelRatio: 1,
          }}
          onNodeChange={(node, index) => {
            console.log(`[MMDPlaylist] 切换到节点: ${node.name} (${index + 1}/${playlist.nodes.length})`);
          }}
          onPlaylistComplete={() => {
            console.log('[MMDPlaylist] 播放列表播放完成！');
          }}
          onError={(error) => {
            console.error('[MMDPlaylist] 错误:', error);
          }}
          className="w-full h-full"
        />
      </main>

    </div>
  );
}








