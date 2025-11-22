'use client'

import {
  MMDPlayerEnhanced,
  type MMDResourceOptions,
  type MMDPlaylist,
} from 'sa2kit/mmd'

export default function MMDPlaylistPage() {
  // ==================== 播放列表模式 ====================
  // 定义资源选项（播放列表模式必须提供 resourceOptions）
  const resourceOptions: MMDResourceOptions = {
    models: [
      {
        id: 'miku',
        name: '初音未来',
        path: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
      },
      {
        id: 'elsa',
        name: '艾尔莎',
        path: '/mikutalking/models/艾尔莎/艾尔莎-水手服泳装.pmx',
      },
    ],
    motions: [
      {
        id: 'catch-the-wave',
        name: 'Catch The Wave',
        path: '/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd',
      },
      {
        id: 'hello',
        name: '打招呼',
        path: '/mikutalking/actions/打招呼.vmd',
      },
    ],
    audios: [
      {
        id: 'catch-the-wave-audio',
        name: 'Catch The Wave 音乐',
        path: '/mikutalking/actions/CatchTheWave/pv_268.wav',
      },
    ],
    cameras: [
      {
        id: 'catch-the-wave-camera',
        name: 'Catch The Wave 镜头',
        path: '/mikutalking/actions/CatchTheWave/camera.vmd',
      },
    ],
    stageModels: [
      {
        id: 'classroom',
        name: '教室场景',
        path: '/mikutalking/stages/stages/1.pmx',
      },
    ],
    backgrounds: [
      {
        id: 'bg1',
        name: '背景1',
        path: '/linkGame/background2.png',
      },
      {
        id: 'bg2',
        name: '背景2',
        path: '/mikutalking/stages/stages/bei/00000000E4AFE2F8.png',
      },
    ],
  };

  // 定义播放列表
  const playlist: MMDPlaylist = {
    id: 'demo-playlist',
    name: '我的 MMD 播放列表',
    loop: true, // 整个列表循环播放
    autoPlay: true, // 自动播放
    nodes: [
      {
        id: 'node-1',
        name: '初音未来 - Catch The Wave',
        description: '初音未来跳 Catch The Wave 舞蹈',
        selection: {
          modelId: 'miku',
          motionId: 'catch-the-wave',
          audioId: 'catch-the-wave-audio',
          cameraId: 'catch-the-wave-camera',
          stageModelId: 'classroom',
          backgroundId: 'bg1',
        },
        loop: false, // 此节点不循环，播放完自动切换到下一个
      },
      {
        id: 'node-2',
        name: '艾尔莎 - 打招呼',
        description: '艾尔莎打招呼动作',
        selection: {
          modelId: 'elsa',
          motionId: 'hello',
          // 不指定 audioId，表示无音乐
          // 不指定 cameraId，表示无镜头动画
          stageModelId: 'classroom',
          backgroundId: 'bg2',
        },
        loop: false,
      },
      {
        id: 'node-3',
        name: '初音未来 - 打招呼',
        description: '初音未来打招呼',
        selection: {
          modelId: 'miku',
          motionId: 'hello',
          backgroundId: 'bg1',
        },
        loop: false,
      },
    ],
  };

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
      {/*
        ==================== 播放列表模式使用说明 ====================
        
        1. **playlist 参数**：
           - 提供一个播放列表配置对象
           - 包含 id、name、nodes、loop、autoPlay 等属性
           - nodes 是播放节点数组，每个节点代表一个完整的 MMD 场景
        
        2. **播放节点 (MMDPlaylistNode)**：
           - id: 节点唯一标识
           - name: 节点名称（显示在播放列表中）
           - description: 节点描述（可选）
           - selection: 资源选择配置（modelId, motionId, audioId, cameraId, stageModelId, backgroundId）
           - loop: 是否循环播放此节点（默认 false）
           - duration: 播放时长（毫秒），如果不指定则根据音频/动画自动判断
        
        3. **播放列表控制**：
           - 自动播放：当一个节点播放完成后，自动切换到下一个节点
           - 手动控制：点击"上一个"/"下一个"按钮切换节点
           - 列表显示：点击"播放列表"按钮查看所有节点，点击任意节点跳转
        
        4. **循环播放**：
           - playlist.loop: 整个列表循环播放
           - node.loop: 单个节点循环播放（优先级更高）
        
        5. **回调函数**：
           - onPlaylistNodeChange: 节点切换时触发
           - onPlaylistComplete: 播放列表完成时触发（非循环模式）
        
        6. **使用场景**：
           - 多段表演连续播放
           - 不同角色轮流展示
           - 自动切换不同场景和背景
           - 创建完整的 MMD 演出序列
      */}
      <MMDPlayerEnhanced
        className="h-full w-full"
        resourceOptions={resourceOptions}
        playlist={playlist}
        defaultNodeIndex={0}
        stage={customStage}
        onPlaylistNodeChange={(index, node) => {
          console.log(`🎬 播放列表节点切换: ${index} - ${node.name}`);
        }}
        onPlaylistComplete={() => {
          console.log('✅ 播放列表播放完成');
        }}
      />
    </div>
  )
}

