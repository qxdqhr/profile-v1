'use client';

import React from 'react';
import { MusicPlayer } from 'sa2kit/music';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function OnlineMusicPage() {
  return (
    <div className="w-full h-screen flex flex-col">
      {/* 顶部导航 */}
      <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg hover:text-white hover:bg-gray-700 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回首页</span>
          </Link>
          <h1 className="text-xl font-bold text-white ml-2">在线音乐播放器测试</h1>
        </div>
      </div>

      {/* 播放器容器 */}
      <div className="flex-1 overflow-hidden">
        <MusicPlayer />
      </div>
    </div>
  );
}

