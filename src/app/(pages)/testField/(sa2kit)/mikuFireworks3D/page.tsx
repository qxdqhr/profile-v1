// @ts-nocheck
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MikuFireworks3D } from 'sa2kit/mikuFireworks3D';

type SyncEventType = 'launch' | 'danmaku';

interface SyncEvent {
  id: string;
  roomId: string;
  type: SyncEventType;
  payload: any;
  createdAt: number;
}

const ROOM_ID = 'testfield-default';

function mergeEvents(current: SyncEvent[], incoming: SyncEvent[]) {
  const map = new Map<string, SyncEvent>();
  [...incoming, ...current].forEach((item) => {
    map.set(item.id, item);
  });
  return Array.from(map.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 30);
}

export default function MikuFireworks3DPage() {
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'ok' | 'error'>('idle');
  const lastSyncedAtRef = useRef<number>(0);

  const syncToServer = useCallback(async (type: SyncEventType, payload: any) => {
    try {
      setSyncStatus('syncing');
      const response = await fetch('/api/mikuFireworks3D/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: ROOM_ID,
          type,
          payload,
        }),
      });

      if (!response.ok) {
        throw new Error(`sync failed: ${response.status}`);
      }

      const data = await response.json();
      if (data?.event) {
        setSyncEvents((prev) => mergeEvents(prev, [data.event]));
        if (typeof data.event.createdAt === 'number') {
          lastSyncedAtRef.current = Math.max(lastSyncedAtRef.current, data.event.createdAt);
        }
      }
      setSyncStatus('ok');
    } catch (error) {
      console.error('Failed to sync mikuFireworks3D event:', error);
      setSyncStatus('error');
    }
  }, []);

  const fetchSyncedEvents = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/mikuFireworks3D/sync?roomId=${encodeURIComponent(ROOM_ID)}&since=${lastSyncedAtRef.current}&limit=30`,
        { cache: 'no-store' }
      );
      if (!response.ok) {
        throw new Error(`pull failed: ${response.status}`);
      }

      const data = await response.json();
      const incoming = Array.isArray(data?.events) ? data.events : [];
      if (incoming.length > 0) {
        setSyncEvents((prev) => mergeEvents(prev, incoming));
        const latest = incoming[incoming.length - 1];
        if (latest?.createdAt) {
          lastSyncedAtRef.current = Math.max(lastSyncedAtRef.current, latest.createdAt);
        }
      }
      setSyncStatus('ok');
    } catch (error) {
      console.error('Failed to pull mikuFireworks3D events:', error);
      setSyncStatus('error');
    }
  }, []);

  useEffect(() => {
    void fetchSyncedEvents();
    const timer = window.setInterval(() => {
      void fetchSyncedEvents();
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [fetchSyncedEvents]);

  return (
    <div className="min-h-screen w-full bg-slate-950 py-4 md:py-8">
      <div className="mx-auto w-full max-w-6xl px-3 md:px-6">
        <div className="mb-3 flex items-center justify-between md:mb-4">
          <h1 className="text-xl font-bold text-white md:text-2xl">Miku Fireworks 3D</h1>
          <div className="text-xs text-slate-300">
            后端同步状态：
            {syncStatus === 'ok' && <span className="ml-1 text-emerald-300">已连接</span>}
            {syncStatus === 'syncing' && <span className="ml-1 text-amber-300">同步中</span>}
            {syncStatus === 'error' && <span className="ml-1 text-rose-300">异常</span>}
            {syncStatus === 'idle' && <span className="ml-1 text-slate-300">空闲</span>}
          </div>
        </div>
        <MikuFireworks3D
          onDanmakuSend={(message) => {
            void syncToServer('danmaku', message);
          }}
          onLaunch={(payload) => {
            void syncToServer('launch', payload);
          }}
        />

        <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/70 p-3">
          <div className="mb-2 text-sm font-medium text-slate-200">最近同步事件</div>
          <div className="space-y-1 text-xs text-slate-300">
            {syncEvents.length === 0 ? (
              <div className="text-slate-400">暂无同步事件</div>
            ) : (
              syncEvents.slice(0, 8).map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-3">
                  <span className="truncate">
                    [{event.type}] {event.type === 'danmaku' ? event.payload?.text || '(empty)' : event.payload?.kind || 'normal'}
                  </span>
                  <span className="shrink-0 text-slate-500">
                    {new Date(event.createdAt).toLocaleTimeString('zh-CN', { hour12: false })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
