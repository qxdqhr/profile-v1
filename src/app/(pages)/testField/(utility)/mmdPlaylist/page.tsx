'use client'

import {
  MMDPlaylist,
  type MMDPlaylistConfig,
} from 'sa2kit/mmd'

const modelPath = 'https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/';
export default function MMDPlaylistTestPage() {
  // 定义播放列表
  const playlist: MMDPlaylistConfig = {
    id: 'test-playlist',
    name: '测试播放列表',
    description: '包含多个 MMD 表演的连续播放',
    nodes: [
      {
        id: 'node1',
        name: '艾尔莎2 - 打招呼',
        description: '艾尔莎的打招呼动作',
        resources: {
          modelPath: `${modelPath}mmd/2025/11/23/32366a8d-024f-4e0f-9fbf-19fb09902f0b.pmx`,
          motionPath: `${modelPath}mmd/2025/11/23/02017cb2-2358-48ad-92d0-c8a0c5f64eb2.vmd`,
          // 注意：这个节点没有音频和相机，只有模型和动作
        },
        loop: false,
      },
      {
        id: 'node1',
        name: '艾尔莎2 - 打招呼',
        description: '艾尔莎的打招呼动作',
        resources: {
          modelPath: `${modelPath}mmd/2025/11/23/32366a8d-024f-4e0f-9fbf-19fb09902f0b.pmx`,
          motionPath: `${modelPath}mmd/2025/11/23/02017cb2-2358-48ad-92d0-c8a0c5f64eb2.vmd`,
          // 注意：这个节点没有音频和相机，只有模型和动作
        },
        loop: false,
      }
    ],
    loop: true, // 播放列表循环播放
    autoPlay: true, // 自动开始播放
  };

  // 舞台配置
  const customStage = {
    backgroundColor: '#01030b',
    cameraPosition: { x: 0, y: 10, z: 30 },
    cameraTarget: { x: 0, y: 10, z: 0 },
    enablePhysics: true,
    showGrid: false,
    ammoPath: '/mikutalking/libs/ammo.wasm.js',
    ammoWasmPath: '/mikutalking/libs/',
    backgroundType: 'image' as const,
  };

  return (
    <div className="fixed inset-0 z-0 bg-[#01030b] text-white flex flex-col">
      <MMDPlaylist
        playlist={playlist}
        stage={customStage}
        defaultNodeIndex={0}
        className="h-full w-full"
        onNodeChange={(index, node) => {
          console.log('🔄 节点切换:', index, node.name);
        }}
        onPlaylistComplete={() => {
          console.log('✅ 播放列表完成');
        }}
      />
    </div>
  )
}

