'use client';

import React from 'react';
import { MMDARPlayer } from 'sa2kit/mmd';
import type { AudioPreset, ModelPreset, MotionPreset } from 'sa2kit/mmd';

const CDN_BIGFILE_BASE_PATH = 'https://cdn.bigfile.qhr062.top';

const MODEL_PRESETS: ModelPreset[] = [
  {
    id: 'sakura-miku',
    name: '樱花 Miku',
    modelPath: `${CDN_BIGFILE_BASE_PATH}/mmd/model/YYB_Z6SakuraMiku/miku.pmx`,
  },
];

const MOTION_PRESETS: MotionPreset[] = [
  {
    id: 'catch-the-wave',
    name: 'Catch The Wave',
    motionPath: `${CDN_BIGFILE_BASE_PATH}/mmd/motion/CatchTheWave/mmd_CatchTheWave_motion.vmd`,
  },
];

const AUDIO_PRESETS: AudioPreset[] = [
  {
    id: 'catch-the-wave-audio',
    name: 'Catch The Wave',
    audioPath: `${CDN_BIGFILE_BASE_PATH}/mmd/motion/CatchTheWave/pv_268.wav`,
  },
];

export default function ARModuleTestPage() {
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
        onError={(error) => console.error('AR Module Error:', error)}
      />

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
        <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
          <h2 className="text-white font-bold">AR 模块测试页</h2>
          <p className="text-white/60 text-xs mt-1">点击 TOUCH 放置模型，可在右上角设置中调整模型/动作/音频</p>
        </div>
      </div>
    </div>
  );
}
