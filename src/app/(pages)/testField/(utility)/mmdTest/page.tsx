'use client'

import {
  MMDPlayerEnhanced,
  type MMDResourceOptions,
} from 'sa2kit/mmd'

export default function MMDTestPage() {
  // ==================== 下拉框独立选择模式 ====================
  // 用户可以独立选择模型、动作、音乐、相机、场景、背景
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
        id: 'elsa-swim',
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
    // 场景模型选项（可选）
    stageModels: [
      {
        id: 'classroom',
        name: '教室场景',
        path: 'mikutalking/stages/stages/1.pmx',
      },
      // {
      //   id: 'stage',
      //   name: '舞台场景',
      //   path: '/mikutalking/stages/stage.pmx',
      // },
    ],
    // 背景图片选项（可选）
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
      // {
      //   id: 'sunset',
      //   name: '日落背景',
      //   path: '/mikutalking/backgrounds/sunset.jpg',
      // },
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
    backgroundType: 'image' as const, // 'image' 表示固定背景图，'skybox' 表示全景背景
  };

  return (
    <div className="fixed inset-0 z-0 bg-[#01030b] text-white flex flex-col">
      {/*
        ==================== 下拉框选择模式使用说明 ====================
        
        1. **resourceOptions 参数**：
           - 提供 models、motions、audios、cameras、stageModels、backgrounds 六个选项列表
           - 每个选项包含 id、name 和 path
           - 用户可以在设置弹窗中独立选择每个资源
        
        2. **defaultSelection 参数**：
           - 指定初始选中的资源ID
           - 例如：defaultSelection={{ modelId: 'miku', motionId: 'catch-the-wave' }}
           - 如果不指定，默认使用每个列表的第一项
        
        3. **onSelectionChange 回调**：
           - 当用户切换任何资源时触发
           - 参数为包含所有选中ID的对象
           - 例如：{ modelId: 'miku', motionId: 'catch-the-wave', audioId: '...', cameraId: '...', stageModelId: '...', backgroundId: '...' }
        
        4. **添加更多选项**：
           - 在 resourceOptions 的对应数组中添加新选项
           - 每个选项必须包含 id、name 和 path
           - 可以只提供部分列表（例如只提供 models 和 motions）
        
        5. **场景和背景**：
           - stageModels: 场景模型文件（.pmx/.pmd），如教室、舞台等
           - backgrounds: 背景图片文件（.jpg/.png），用于 skybox 或固定背景
           - 这两个选项都是可选的，取消注释上面的代码即可启用
        
        6. **灵活组合**：
           - 用户可以自由组合不同的模型、动作、音乐、相机、场景和背景
           - 例如：初音未来 + Catch The Wave 动作 + 教室场景 + 天空背景
           - 任何资源都可以选择"无"（除了模型必须选择）
      */}
      <MMDPlayerEnhanced
        className="h-full w-full"
        resourceOptions={resourceOptions}
        defaultSelection={{
          modelId: 'miku',
          motionId: 'catch-the-wave',
          audioId: 'catch-the-wave-audio',
          cameraId: 'catch-the-wave-camera',
        }}
        stage={customStage}
        // autoPlay
        // loop
        onSelectionChange={(selection) => console.log('🔄 资源已选择:', selection)}
      />
    </div>
  )
}

