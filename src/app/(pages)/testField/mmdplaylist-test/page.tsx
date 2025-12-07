'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MMDPlaylist, type MMDPlaylistConfig } from 'sa2kit/mmd';
import {
  convertPlaylistToMmdConfig,
  type PlaylistWithFiles,
} from '@/modules/testField/utils/mmdPlaylistAdapter';

export default function MMDPlaylistTestPage() {
  const [mounted, setMounted] = useState(false);
  const [playlistData, setPlaylistData] = useState<PlaylistWithFiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 后端拉取播放列表（可由后台管理配置生成）
  useEffect(() => {
    const fetchPlaylist = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/mmd/playlists/demo');
        if (!res.ok) throw new Error(`加载播放列表失败：${res.statusText}`);
        const data = await res.json();
        setPlaylistData(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, []);

  // 将后台格式转换为 MMD 组件可用格式
  const playlist = useMemo<MMDPlaylistConfig | null>(() => {
    if (!playlistData) return null;
    return convertPlaylistToMmdConfig(playlistData as any);
  }, [playlistData]);

  const stageConfig = {
    physicsPath: '/mikutalking/libs/ammo.wasm.js',
    enablePhysics: true,
    backgroundColor: '#1a1a2e',
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
        正在加载播放列表...
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-red-200">
        加载失败：{error || '未获取到播放列表'}
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      <main className="flex-1 relative overflow-hidden">
        <MMDPlaylist
          playlist={playlist}
          stage={stageConfig}
          showDebugInfo={true}
          mobileOptimization={{
            enabled: false,
            pixelRatio: 1,
          }}
          onNodeChange={(node, index) => {
            console.log(`[MMDPlaylist] 切换到节点: ${node.name} (${index + 1}/${playlist.nodes.length})`);
          }}
          onPlaylistComplete={() => {
            console.log('[MMDPlaylist] 播放列表播放完成！');
          }}
          onError={(err) => {
            console.error('[MMDPlaylist] 错误:', err);
          }}
          className="w-full h-full"
        />
      </main>
    </div>
  );
}
