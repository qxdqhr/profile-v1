'use client'

import {
  MMDPlaylist,
  type MMDPlaylistConfig,
} from 'sa2kit/mmd'

export default function MMDPlaylistTestPage() {
  // OSS 基础路径
  const ossBasePath = 'https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/mmd';
  
  // 定义播放列表
  const playlist: MMDPlaylistConfig = {
    id: 'test-playlist',
    name: '测试播放列表',
    description: '包含多个 MMD 表演的连续播放',
    nodes: [
      // ==================== 节点 1：本地资源示例 ====================
      {
        id: 'node-local-1',
        name: '本地 - 初音未来',
        description: '使用本地 public 目录的资源',
        resources: {
          modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
          motionPath: '/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd',
          audioPath: '/mikutalking/actions/CatchTheWave/pv_268.wav',
          cameraPath: '/mikutalking/actions/CatchTheWave/camera.vmd',
        },
        loop: false,
      },
      
      // ==================== 节点 2：OSS 资源示例（需要先上传完整模型文件夹）====================
      // 注意：使用 OSS 资源前，请确保：
      // 1. 已上传整个模型文件夹（包含所有贴图）到 OSS
      // 2. 已配置 OSS CORS（参考 docs/oss-cors-setup.md）
      // 3. 路径格式：{ossBasePath}/{year}/{month}/{day}/{modelFolder}/{modelFile}.pmx
      
      // 示例：如果你上传了 miku 文件夹到 OSS，路径应该是：
      // modelPath: `${ossBasePath}/2025/11/23/miku/miku.pmx`
      // 贴图会自动从: `${ossBasePath}/2025/11/23/miku/textures/` 加载
      
      // {
      //   id: 'node-oss-1',
      //   name: 'OSS - 初音未来',
      //   description: '使用 OSS 存储的资源',
      //   resources: {
      //     modelPath: `${ossBasePath}/2025/11/23/miku/miku.pmx`,
      //     motionPath: `${ossBasePath}/2025/11/23/motions/dance.vmd`,
      //     audioPath: `${ossBasePath}/2025/11/23/audio/music.mp3`,
      //     cameraPath: `${ossBasePath}/2025/11/23/camera/camera.vmd`,
      //   },
      //   loop: false,
      // },
      
      // ==================== 节点 3：本地资源示例 ====================
      {
        id: 'node-local-2',
        name: '本地 - 艾尔莎',
        description: '艾尔莎的打招呼动作',
        resources: {
          modelPath: '/mikutalking/models/艾尔莎/艾尔莎-水手服泳装.pmx',
          motionPath: '/mikutalking/actions/打招呼.vmd',
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

