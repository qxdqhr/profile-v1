'use client';

import React from 'react';
import { MMDMusicPlayer } from 'sa2kit/mmd';

const CDN_BASE_PATH = 'https://cdn.qhr062.top';
const YYB_Z6SakuraMiku = (CDN_BASE_PATH) + '/mmd/2025/11/25/YYB_Z6SakuraMiku/miku.pmx';
const DANCE_MOTION = (CDN_BASE_PATH) + '/mmd-motions/2025/12/10/mmd_CatchTheWave_motion.vmd';

export default function MikuRadioExample() {
  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      <MMDMusicPlayer
        mikuMode={true} // 启用 Miku 搜索模式
        fixedResources={{
          modelPath: YYB_Z6SakuraMiku,
          motionPath: DANCE_MOTION,
          cameraPath: (CDN_BASE_PATH) + '/mmd-motions/2025/12/10/132dfca3-fe65-430d-850c-4e0c293c4ea4.vmd',
        }}
        config={{
          name: "Miku 无线电",
          tracks: [], // 初始为空，由搜索结果自动填充
          autoPlay: true,
          defaultLoopMode: 'list'
        }}
        stage={{
          renderEffect: 'outline+bloom',
          outlineOptions: { thickness: 0.005, color: '#000000' },
          physicsPath: '/libs/ammo.wasm.js',
          ambientLightIntensity: 0.8,
          directionalLightIntensity: 0.6,
        }}
        className="w-full h-full"
      />
      
      {/* 说明浮层 */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none">
        <h1 className="text-white text-2xl font-bold drop-shadow-lg">Miku Radio 📻</h1>
        <p className="text-white/60 text-sm mt-2">点击右侧播放列表，搜索你想听的 Miku 歌曲</p>
      </div>
    </div>
  );
}







