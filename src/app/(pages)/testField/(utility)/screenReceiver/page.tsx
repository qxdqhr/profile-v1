'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ScreenReceiverPanel } from 'sa2kit/screenReceiver';

export default function ScreenReceiverTestPage() {
  const defaultSignalUrl = useMemo(() => {
    const envSignalUrl = process.env.NEXT_PUBLIC_SCREEN_RECEIVER_SIGNAL_URL;
    if (envSignalUrl) return envSignalUrl;
    if (typeof window === 'undefined') return 'ws://127.0.0.1:8787/ws';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-6xl px-8 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">screenReceiver 测试路由</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              使用 `sa2kit/screenReceiver` 的 `ScreenReceiverPanel` 组件。
            </p>
          </div>
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
            返回首页
          </Link>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <p className="font-semibold">启动方式（单进程）</p>
          <pre className="mt-2 overflow-auto rounded bg-gray-900 p-3 text-xs text-gray-100">
{`cd /Users/qihongrui/Desktop/project/profile-v1
pnpm dev`}
          </pre>
          <p className="mt-2">
            Next 启动时会自动拉起信令服务（默认监听 `127.0.0.1:8787/ws`），页面默认连接当前域名下 `/ws`（可用 `NEXT_PUBLIC_SCREEN_RECEIVER_SIGNAL_URL` 覆盖）
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <ScreenReceiverPanel
            className="text-gray-900 dark:text-gray-100"
            defaultSignalUrl={defaultSignalUrl}
            defaultRoomId="screen-room-1"
          />
        </div>
      </div>
    </div>
  );
}
