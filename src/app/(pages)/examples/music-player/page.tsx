'use client';

import React, { useState } from 'react';
import { MMDMusicPlayer } from 'sa2kit/mmd';
import type { MMDMusicPlayerConfig } from 'sa2kit/mmd';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function MusicPlayerPage() {
  // 音乐播放器配置 - 使用公共 CDN 资源
  const [config] = useState<MMDMusicPlayerConfig>({
    name: "Study with Miku - Demo",
    autoPlay: false,
    defaultLoopMode: 'list',
    tracks: [
      {
        id: "track-1",
        title: "Gimme×Gimme",
        artist: "八王子P / Giga",
        coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
        resources: {
          // 注意：这里的路径需要根据你的 public 目录实际情况调整
          // 如果没有本地模型，可以使用远程或默认占位
          modelPath: "/models/miku/v4c5.0.pmx", 
          motionPath: "/motions/CatchTheWave/CatchTheWave.vmd", // 借用现有的 CatchTheWave 动作进行测试
          audioPath: "/motions/CatchTheWave/pv_268.wav", // 借用现有的音频进行测试
        }
      },
      {
        id: "track-2",
        title: "示例曲目 2 (重复测试)",
        artist: "SA2Kit",
        coverUrl: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop",
        resources: {
          modelPath: "/models/miku/v4c5.0short.pmx",
          motionPath: "/motions/CatchTheWave/CatchTheWave.vmd",
          audioPath: "/motions/CatchTheWave/pv_268.wav",
        }
      }
    ]
  });

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 返回按钮 */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-4 pointer-events-auto">
        <Link 
          href="/examples/"
          className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-full hover:bg-white/10 transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回首页</span>
        </Link>
        
        <div className="px-4 py-2 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 text-blue-400 rounded-full text-xs font-bold animate-pulse">
          BETA: 沉浸式音乐模式
        </div>
      </div>

      {/* 提示信息 */}
      <div className="absolute top-6 right-6 z-50 pointer-events-auto">
        <a 
          href="https://github.com/sa2kit/sa2kit"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 text-white/60 rounded-full hover:text-white transition-all"
        >
          <span className="text-xs">Documentation</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* 核心组件 */}
      <MMDMusicPlayer 
        config={config}
        stage={{
          backgroundColor: "#050505",
          enableShadow: true,
          cameraPosition: { x: 0, y: 12, z: 35 },
          cameraTarget: { x: 0, y: 10, z: 0 }
        }}
        onTrackChange={(track, index) => {
          console.log('[Demo] Now playing: ' + (track.title) + ' (' + (index + 1) + '/' + (config.tracks.length) + ')');
        }}
      />

      {/* 侧边装饰 */}
      <div className="absolute left-6 bottom-32 z-40 pointer-events-none opacity-20">
        <div className="text-[120px] font-black text-white leading-none select-none">
          MUSIC<br/>PERFORM
        </div>
      </div>
    </div>
  );
}

