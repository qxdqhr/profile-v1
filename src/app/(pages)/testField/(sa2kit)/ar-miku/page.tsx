'use client';

import React from 'react';
import { MMDARPlayer } from 'sa2kit/mmd';
import type { ModelPreset, MotionPreset, AudioPreset } from 'sa2kit/mmd';

const CDN_BASE_PATH = 'https://cdn.qhr062.top';
const CDN_BIGFILE_BASE_PATH = 'https://cdn.bigfile.qhr062.top'

const YYB_Z6SakuraMiku = `${CDN_BIGFILE_BASE_PATH}/mmd/model/YYB_Z6SakuraMiku/miku.pmx`
const YAGI39_MikuNT = `${CDN_BIGFILE_BASE_PATH}/mmd/model/yagi39mikuNT1/yagi39mikuNT.pmx`

const STAGE_1_PATH = `${CDN_BIGFILE_BASE_PATH}/mmd/stages/xushi/场景主体.pmx`
const STAGE_2_PATHS = [
  `${CDN_BIGFILE_BASE_PATH}/mmd/stages/zhimeng/场景主体.pmx`,
  `${CDN_BIGFILE_BASE_PATH}/mmd/stages/zhimeng/吊饰.pmx`,
  `${CDN_BIGFILE_BASE_PATH}/mmd/stages/zhimeng/地板追加.pmx`
]
const MOTION_1_PATH = `${CDN_BIGFILE_BASE_PATH}/mmd/motion/132dfca3-fe65-430d-850c-4e0c293c4ea4.vmd`
const MOTION_2_PATH = `${CDN_BIGFILE_BASE_PATH}/mmd/motion/CatchTheWave/mmd_CatchTheWave_motion.vmd`
const AUDIO_1_PATH = `${CDN_BIGFILE_BASE_PATH}/mmd/motion/CatchTheWave/pv_268.wav`

// 预设模型列表
const MODEL_PRESETS: ModelPreset[] = [
  {
    id: 'sakura-miku',
    name: '樱花 Miku',
    modelPath: YYB_Z6SakuraMiku,
  },
  {
    id: 'miku-nt',
    name: 'Miku NT',
    modelPath: YAGI39_MikuNT,
  },
];

// 预设动作列表
const MOTION_PRESETS: MotionPreset[] = [
  {
    id: 'catch-the-wave',
    name: 'Catch The Wave',
    motionPath: MOTION_2_PATH,
  },
  {
    id: 'idle',
    name: '待机动作',
    motionPath: MOTION_1_PATH,
  },
];

// 预设音乐列表 (可选)
const AUDIO_PRESETS: AudioPreset[] = [
  {
    id: 'catch-the-wave-audio',
    name: 'Catch The Wave',
    audioPath: `${CDN_BIGFILE_BASE_PATH}/mmd/motion/CatchTheWave/pv_268.wav`,
  },
];

export default function ARMikuExample() {
  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      <MMDARPlayer
        modelPresets={MODEL_PRESETS}
        motionPresets={MOTION_PRESETS}
        audioPresets={AUDIO_PRESETS}
        defaultModelId="sakura-miku"
        defaultMotionId="catch-the-wave"
        defaultAudioId="catch-the-wave-audio"
        initialModelVisible={false}
        placementText="TOUCH!"
        cameraConfig={{
          facingMode: 'environment',
        }}
        stage={{
          renderEffect: 'outline',
          outlineOptions: { thickness: 0.004, color: '#ffffff' },
          physicsPath: `${CDN_BIGFILE_BASE_PATH}/mmd/libs/ammo.wasm.js`,
          ambientLightIntensity: 1.0,
          directionalLightIntensity: 0.8,
        }}
        autoPlay={true}
        showSettings={true}
        className="w-full h-full"
        onCameraReady={(stream) => console.log('Camera ready:', stream)}
        onModelPlaced={() => console.log('Model placed!')}
        onResourcesChange={(res) => console.log('Resources changed:', res)}
        onError={(err) => console.error('AR Error:', err)}
      />

      {/* 说明浮层 */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
        <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
          <h2 className="text-white font-bold">Miku AR 交互</h2>
          <p className="text-white/60 text-xs mt-1">点击 TOUCH 召唤 Miku，右上角设置切换模型/动作/音乐</p>
        </div>
      </div>
    </div>
  );
}
