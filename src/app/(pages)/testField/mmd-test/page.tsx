'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MMDPlayerEnhanced } from 'sa2kit/mmd';
import { convertPlaylistToMmdConfig } from '@/modules/testField/utils/mmdPlaylistAdapter';

// 简化版：复用后台管理的播放列表配置，取第一个节点作为单曲播放

export default function MMDTestPage() {
  const [mounted, setMounted] = useState(false);
  const [resources, setResources] = useState<{ modelPath: string; motionPath?: string; audioPath?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchSingle = async () => {
      try {
        const res = await fetch('/api/mmd/playlists/demo');
        if (!res.ok) throw new Error(`加载播放列表失败：${res.statusText}`);
        const data = await res.json();
        const playlist = convertPlaylistToMmdConfig(data as any);
        const first = playlist.nodes[0];
        if (!first) throw new Error('播放列表为空');
        setResources({
          modelPath: first.resources.modelPath,
          motionPath: first.resources.motionPath,
          audioPath: first.resources.audioPath,
        });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : '未知错误');
      }
    };
    fetchSingle();
  }, []);

  const stageConfig = useMemo(
    () => ({
      physicsPath: '/mikutalking/libs/ammo.wasm.js',
      enablePhysics: true,
      backgroundColor: '#2d3748',
    }),
    []
  );

  if (!mounted) return null;

  if (error) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-red-200">
        加载失败：{error}
      </div>
    );
  }

  if (!resources) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
        正在加载单节点配置...
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      <header className="p-4 bg-gray-800 text-white border-b border-gray-700">
        <h1 className="text-xl font-bold">MMD Player Test (sa2kit)</h1>
        <p className="text-sm text-gray-400">后台配置 → 单节点播放</p>
      </header>
      <main className="flex-1 relative overflow-hidden">
        <MMDPlayerEnhanced
          resources={resources}
          stage={stageConfig}
          autoPlay={true}
          loop={true}
          className="w-full h-full"
          mobileOptimization={{
            enabled: false,
            pixelRatio: 1,
          }}
        />
      </main>
    </div>
  );
}
