'use client'

import {
  MMDPlaylist,
  type MMDPlaylistConfig,
} from 'sa2kit/mmd'

export default function MMDPlaylistTestPage() {
  // 定义播放列表
  const playlist: MMDPlaylistConfig = {
    id: 'test-playlist',
    name: '测试播放列表',
    description: '包含多个 MMD 表演的连续播放',
    nodes: [
      {
        id: 'node0',
        name: '艾尔莎 - 打招呼',
        description: '艾尔莎的打招呼动作',
        resources: {
          modelPath: '/mikutalking/models/艾尔莎/艾尔莎-水手服泳装.pmx',
          motionPath: '/mikutalking/actions/打招呼.vmd',
          // 注意：这个节点没有音频和相机，只有模型和动作
        },
        loop: false,
      },
      {
        id: 'node2',
        name: '艾尔莎 - 打招呼',
        description: '艾尔莎的打招呼动作',
        resources: {
          modelPath: '/mikutalking/models/艾尔莎/艾尔莎-水手服泳装.pmx',
          motionPath: '/mikutalking/actions/打招呼.vmd',
          // 注意：这个节点没有音频和相机，只有模型和动作
        },
        loop: false,
      },
      {
        id: 'node1',
        name: '初音未来 - Catch The Wave',
        description: '经典的 Catch The Wave 表演',
        resources: {
          modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
          motionPath: '/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd',
          audioPath: '/mikutalking/actions/CatchTheWave/pv_268.wav',
          cameraPath: '/mikutalking/actions/CatchTheWave/camera.vmd',
        },
        loop: false, // 播放完成后自动切换到下一个节点
      },
   
      {
        id: 'node3',
        name: '初音未来 + 场景 + 背景',
        description: '带场景和背景的完整表演',
        resources: {
          modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
          motionPath: '/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd',
          audioPath: '/mikutalking/actions/CatchTheWave/pv_268.wav',
          cameraPath: '/mikutalking/actions/CatchTheWave/camera.vmd',
          stageModelPath: 'mikutalking/stages/stages/1.pmx',
          backgroundPath: '/linkGame/background2.png',
        },
        loop: false,
      },
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

