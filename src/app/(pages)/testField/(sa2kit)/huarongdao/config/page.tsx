// @ts-nocheck
'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
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
  '为每一关填写图片链接（sourceImageUrl），建议使用可公网访问的 URL。',
  '调整 rows/cols/shuffleSteps，决定该关拼图难度。',
  '点击“保存到数据库”后返回游戏页验证关卡效果。',
];

export default function HuarongdaoConfigPage() {
  const [theme, setTheme] = useState<HuarongdaoTheme>('miku');
  const [levels, setLevels] = useState<HuarongdaoLevelConfig[]>(DEFAULT_HUARONGDAO_PERSISTED_CONFIG.levels);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
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
      } catch (error: any) {
        setMessage(error?.message || '加载失败，已使用默认配置');
        setTheme(DEFAULT_HUARONGDAO_PERSISTED_CONFIG.theme);
        setLevels(DEFAULT_HUARONGDAO_PERSISTED_CONFIG.levels);
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
        body: JSON.stringify({ theme, levels }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || '保存失败');
      const persisted = buildPersistedConfig(json?.data);
      setTheme(normalizeTheme(persisted.theme));
      setLevels(persisted.levels);
      setMessage('已保存到数据库，游戏页会读取此主题和关卡配置。');
    } catch (error: any) {
      setMessage(error?.message || '保存失败');
    } finally {
      setSaving(false);
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
              <p className="text-sm text-white/75">每关图片链接、网格和打乱步数统一持久化</p>
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
