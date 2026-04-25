'use client';

import React, { useState, useEffect } from 'react';

export default function TimestampPage() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const unixTimestamp = Math.floor(currentTime.getTime() / 1000);
  const isoString = currentTime.toISOString();
  const localString = currentTime.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const localStringWithMs = currentTime.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`已复制：${label}`);
    });
  };

  if (!mounted) {
    return <div className="min-h-screen bg-gray-950 text-white p-8">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-cyan-400">🕒 时间戳测试页面</h1>
          <p className="text-gray-400">实时显示当前时间戳（每秒自动更新）</p>
        </div>

        {/* 当前时间大显示 */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10 mb-8 text-center">
          <div className="text-6xl font-bold text-white mb-4 tracking-wider">
            {currentTime.toLocaleTimeString('zh-CN', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </div>
          <div className="text-xl text-gray-400">
            {currentTime.toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unix 时间戳 */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-cyan-500 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-cyan-400 text-sm font-medium mb-1">UNIX 时间戳 (秒)</div>
                <div className="text-4xl font-bold text-white tabular-nums">{unixTimestamp}</div>
              </div>
              <button
                onClick={() => copyToClipboard(unixTimestamp.toString(), 'Unix 时间戳')}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs rounded border border-gray-600 hover:border-gray-400 transition-colors"
              >
                复制
              </button>
            </div>
            <div className="text-xs text-gray-500">自 1970-01-01 00:00:00 UTC 经过的秒数</div>
          </div>

          {/* 毫秒时间戳 */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-cyan-500 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-cyan-400 text-sm font-medium mb-1">毫秒时间戳</div>
                <div className="text-4xl font-bold text-white tabular-nums">{currentTime.getTime()}</div>
              </div>
              <button
                onClick={() => copyToClipboard(currentTime.getTime().toString(), '毫秒时间戳')}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs rounded border border-gray-600 hover:border-gray-400 transition-colors"
              >
                复制
              </button>
            </div>
            <div className="text-xs text-gray-500">JavaScript 原生 getTime() 值</div>
          </div>

          {/* ISO 格式 */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-cyan-500 transition-colors md:col-span-2">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-cyan-400 text-sm font-medium mb-1">ISO 8601 格式</div>
                <div className="text-xl font-medium text-white break-all">{isoString}</div>
              </div>
              <button
                onClick={() => copyToClipboard(isoString, 'ISO 时间')}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs rounded border border-gray-600 hover:border-gray-400 transition-colors"
              >
                复制
              </button>
            </div>
            <div className="text-xs text-gray-500">国际标准时间格式，适合 API 和日志</div>
          </div>

          {/* 本地时间 */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-cyan-500 transition-colors md:col-span-2">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-cyan-400 text-sm font-medium mb-1">本地时间 (中文)</div>
                <div className="text-xl font-medium text-white">{localString}</div>
                <div className="text-sm text-gray-400 mt-2">{localStringWithMs}</div>
              </div>
              <button
                onClick={() => copyToClipboard(localString, '本地时间')}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs rounded border border-gray-600 hover:border-gray-400 transition-colors"
              >
                复制
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-gray-500">
          页面每秒自动刷新 • 当前时区：{Intl.DateTimeFormat().resolvedOptions().timeZone}
        </div>
      </div>
    </div>
  );
}
