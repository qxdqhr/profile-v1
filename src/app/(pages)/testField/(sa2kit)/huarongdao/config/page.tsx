// @ts-nocheck
'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildPersistedConfig,
  DEFAULT_HUARONGDAO_PERSISTED_CONFIG,
  normalizeTheme,
  type HuarongdaoTheme,
  type HuarongdaoLevelConfig,
} from '@/modules/testField/huarongdao/shared';

const THEMES = {
  miku: {
    label: '初音未来（原版主题）',
    accent: '#22d3ee',
    accentSoft: '#a5f3fc',
    bgStart: '#05273c',
    bgEnd: '#0b1324',
  },
  sakura: {
    label: '樱花初音主题',
    accent: '#f472b6',
    accentSoft: '#fbcfe8',
    bgStart: '#4a1834',
    bgEnd: '#220e22',
  },
};

const FLOW_STEPS = [
  '为每一关填写图片链接（或直接上传图片并自动回填 URL）。',
  '调整 rows/cols/shuffleSteps，决定该关拼图难度。',
  '上传背景音乐并保存，游戏会在换关时随机切歌。',
];

const uploadToUniversalFile = async (file: File, folderPath: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('moduleId', 'huarongdao');
  formData.append('businessId', 'game-assets');
  formData.append('folderPath', folderPath);
  formData.append('needsProcessing', 'false');

  const res = await fetch('/api/universal-file/upload', {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || json?.details || '上传失败');
  }

  return json?.data?.accessUrl as string;
};

export default function HuarongdaoConfigPage() {
  const [theme, setTheme] = useState<HuarongdaoTheme>('miku');
  const [levels, setLevels] = useState<HuarongdaoLevelConfig[]>(DEFAULT_HUARONGDAO_PERSISTED_CONFIG.levels);
  const [bgmTracks, setBgmTracks] = useState<string[]>(DEFAULT_HUARONGDAO_PERSISTED_CONFIG.bgmTracks);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingKey, setUploadingKey] = useState<string>('');
  const imageInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const bgmInputRef = useRef<HTMLInputElement | null>(null);

  const currentTheme = THEMES[theme];
  const petals = useMemo(() => Array.from({ length: 16 }, (_, i) => i), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMessage('');
      try {
        const res = await fetch('/api/huarongdao/config', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.error || '加载失败');
        const persisted = buildPersistedConfig(json?.data);
        setTheme(normalizeTheme(persisted.theme));
        setLevels(persisted.levels);
        setBgmTracks(persisted.bgmTracks || []);
      } catch (error: any) {
        setMessage(error?.message || '加载失败，已使用默认配置');
        setTheme(DEFAULT_HUARONGDAO_PERSISTED_CONFIG.theme);
        setLevels(DEFAULT_HUARONGDAO_PERSISTED_CONFIG.levels);
        setBgmTracks(DEFAULT_HUARONGDAO_PERSISTED_CONFIG.bgmTracks);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const updateLevel = (id: number, patch: Partial<HuarongdaoLevelConfig>) => {
    setLevels((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/huarongdao/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, levels, bgmTracks }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || '保存失败');
      const persisted = buildPersistedConfig(json?.data);
      setTheme(normalizeTheme(persisted.theme));
      setLevels(persisted.levels);
      setBgmTracks(persisted.bgmTracks || []);
      setMessage('已保存到数据库，游戏页将同步主题、关卡图片和背景音乐配置。');
    } catch (error: any) {
      setMessage(error?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadLevelImage = async (levelId: number, file: File | null) => {
    if (!file) return;
    setUploadingKey(`level-${levelId}`);
    setMessage('');
    try {
      const url = await uploadToUniversalFile(file, `huarongdao/levels/level-${levelId}`);
      updateLevel(levelId, { sourceImageUrl: url });
      setMessage(`第 ${levelId} 关图片上传成功并已回填 URL`);
    } catch (error: any) {
      setMessage(error?.message || '关卡图片上传失败');
    } finally {
      setUploadingKey('');
    }
  };

  const handleUploadBgm = async (file: File | null) => {
    if (!file) return;
    setUploadingKey('bgm');
    setMessage('');
    try {
      const url = await uploadToUniversalFile(file, 'huarongdao/bgm');
      setBgmTracks((prev) => [...prev, url]);
      setMessage('背景音乐上传成功并已加入音乐库');
    } catch (error: any) {
      setMessage(error?.message || '背景音乐上传失败');
    } finally {
      setUploadingKey('');
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-6 md:px-8"
      style={{
        background: `radial-gradient(circle at 20% 20%, ${currentTheme.accentSoft}22, transparent 40%), linear-gradient(135deg, ${currentTheme.bgStart}, ${currentTheme.bgEnd})`,
      }}
    >
      {theme === 'sakura' ? (
        <div className="petal-layer pointer-events-none" aria-hidden>
          {petals.map((idx) => (
            <span
              key={idx}
              className="petal"
              style={{
                left: `${(idx * 6.25) % 100}%`,
                animationDuration: `${9 + (idx % 7)}s`,
                animationDelay: `${(idx % 6) * -1.3}s`,
                opacity: 0.45 + (idx % 4) * 0.12,
              }}
            />
          ))}
        </div>
      ) : null}

      <div className="relative z-10 mx-auto w-full max-w-6xl rounded-2xl border border-white/20 bg-black/25 p-4 backdrop-blur-sm md:p-6">
        <div className="mb-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-white md:text-2xl">华容道配置中心（数据库版）</h1>
              <p className="text-sm text-white/75">支持图片/音乐上传并自动回填链接</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/testField/huarongdao"
                className="rounded-md border border-white/25 bg-black/20 px-3 py-1.5 text-sm text-white transition hover:bg-black/35"
              >
                返回游戏页
              </Link>
              <button
                type="button"
                onClick={save}
                disabled={saving || loading}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-black disabled:opacity-70"
                style={{ backgroundColor: currentTheme.accent }}
              >
                {saving ? '保存中...' : '保存到数据库'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(THEMES).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTheme(key as HuarongdaoTheme)}
                className="rounded-full border px-4 py-1.5 text-sm transition"
                style={{
                  borderColor: theme === key ? item.accent : '#ffffff44',
                  background: theme === key ? `${item.accent}33` : '#00000022',
                  color: '#fff',
                }}
              >
                {item.label}（游戏页生效）
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-white/15 bg-black/20 p-3 text-white">
          <p className="text-sm font-semibold">三步完成配置</p>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
            {FLOW_STEPS.map((step, idx) => (
              <div key={step} className="rounded-lg border border-white/10 bg-black/20 p-2">
                <p className="text-xs font-semibold text-white/70">STEP {idx + 1}</p>
                <p className="mt-1 text-xs text-white/85">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {levels.map((level) => (
            <div key={level.id} className="rounded-xl border border-white/15 bg-white/95 p-3">
              <p className="text-sm font-semibold text-slate-800">{level.label}</p>

              <label className="mt-2 block text-xs text-slate-500">图片链接 sourceImageUrl</label>
              <input
                value={level.sourceImageUrl}
                onChange={(e) => updateLevel(level.id, { sourceImageUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm outline-none"
              />

              <input
                ref={(el) => {
                  imageInputRefs.current[level.id] = el;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  void handleUploadLevelImage(level.id, file);
                  e.currentTarget.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => imageInputRefs.current[level.id]?.click()}
                className="mt-2 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700"
                disabled={uploadingKey === `level-${level.id}`}
              >
                {uploadingKey === `level-${level.id}` ? '上传中...' : '上传图片到 UniversalFile 并回填'}
              </button>

              <div className="mt-2 grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-500">rows</label>
                  <input
                    type="number"
                    min={2}
                    value={level.rows}
                    onChange={(e) => updateLevel(level.id, { rows: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">cols</label>
                  <input
                    type="number"
                    min={2}
                    value={level.cols}
                    onChange={(e) => updateLevel(level.id, { cols: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">shuffle</label>
                  <input
                    type="number"
                    min={0}
                    value={level.shuffleSteps}
                    onChange={(e) => updateLevel(level.id, { shuffleSteps: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-white/15 bg-white/95 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">背景音乐库（随机切换）</p>
            <button
              type="button"
              onClick={() => bgmInputRef.current?.click()}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700"
              disabled={uploadingKey === 'bgm'}
            >
              {uploadingKey === 'bgm' ? '上传中...' : '上传背景音乐'}
            </button>
            <input
              ref={bgmInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                void handleUploadBgm(file);
                e.currentTarget.value = '';
              }}
            />
          </div>

          <div className="mt-2 space-y-2">
            {bgmTracks.map((track, idx) => (
              <div key={`${track}-${idx}`} className="flex gap-2">
                <input
                  value={track}
                  onChange={(e) => {
                    const next = [...bgmTracks];
                    next[idx] = e.target.value;
                    setBgmTracks(next);
                  }}
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setBgmTracks((prev) => prev.filter((_, i) => i !== idx))}
                  className="rounded-md border border-slate-300 px-2 text-xs text-slate-700"
                >
                  删除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setBgmTracks((prev) => [...prev, ''])}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700"
            >
              新增 URL
            </button>
          </div>
        </div>

        {message ? (
          <div className="mt-4 rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white/90">{message}</div>
        ) : null}
      </div>

      <style jsx>{`
        .petal-layer {
          position: fixed;
          inset: 0;
          z-index: 2;
        }
        .petal {
          position: absolute;
          top: -10vh;
          width: 14px;
          height: 10px;
          border-radius: 80% 20% 80% 20%;
          background: linear-gradient(130deg, #ffc1df, #ff8fc8);
          filter: blur(0.2px);
          animation-name: petal-fall;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        @keyframes petal-fall {
          0% {
            transform: translate3d(0, -8vh, 0) rotate(0deg);
          }
          100% {
            transform: translate3d(-100vw, 120vh, 0) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
