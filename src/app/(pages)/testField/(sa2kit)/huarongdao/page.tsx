// @ts-nocheck
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  buildPersistedConfig,
  DEFAULT_HUARONGDAO_LEVEL_CONFIGS,
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
    fallbackImageUrl: '/mikutalking/models/miku/texture/头.png',
    tracks: ['/linkGame/mp3/ShakeIt!-Miku.mp3', '/linkGame/mp3/VivalaVida.mp3'],
  },
  sakura: {
    label: '樱花初音主题',
    accent: '#f472b6',
    accentSoft: '#fbcfe8',
    bgStart: '#4a1834',
    bgEnd: '#220e22',
    fallbackImageUrl: '/mikutalking/models/YYB_Z6SakuraMiku/tex/face.png',
    tracks: ['/linkGame/mp3/utanikatachinaikedo.mp3', '/linkGame/mp3/VivalaVida.mp3'],
  },
};

const TRACK_NAME_MAP: Record<string, string> = {
  '/linkGame/mp3/ShakeIt!-Miku.mp3': 'Shake It! - Miku',
  '/linkGame/mp3/utanikatachinaikedo.mp3': 'Sakura Theme OST',
  '/linkGame/mp3/VivalaVida.mp3': 'Viva La Vida (Instrumental)',
};

const pickRandomTrack = (tracks: string[], prevTrack: string | null) => {
  if (!tracks.length) return null;
  if (tracks.length === 1) return tracks[0];
  const candidates = tracks.filter((item) => item !== prevTrack);
  return candidates[Math.floor(Math.random() * candidates.length)];
};

const findLevel = (levels: HuarongdaoLevelConfig[], id: number) =>
  levels.find((item) => item.id === id) || levels[0];

const ClientOnlyHuarongdaoGamePage = dynamic(
  () => import('sa2kit/huarongdao/ui/web').then((m) => m.HuarongdaoGamePage),
  {
    ssr: false,
    loading: () => (
      <div className="py-10 text-center text-sm text-white/70">正在加载游戏区域...</div>
    ),
  },
);

export default function HuarongdaoPage() {
  const [theme, setTheme] = useState<HuarongdaoTheme>('miku');
  const [levelId, setLevelId] = useState<number>(1);
  const [levels, setLevels] = useState<HuarongdaoLevelConfig[]>(DEFAULT_HUARONGDAO_LEVEL_CONFIGS);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [playError, setPlayError] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const petals = useMemo(() => Array.from({ length: 18 }, (_, i) => i), []);
  const currentTheme = THEMES[theme];
  const currentLevel = findLevel(levels, levelId);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/huarongdao/config', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok || !json?.success) return;
        const persisted = buildPersistedConfig(json?.data);
        setTheme(normalizeTheme(persisted.theme));
        setLevels(persisted.levels);
      } catch {
        setLevels(DEFAULT_HUARONGDAO_LEVEL_CONFIGS);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    setActiveTrack((prev) => pickRandomTrack(currentTheme.tracks, prev));
  }, [theme, levelId, currentTheme.tracks]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    audio.volume = 0.45;
    audio.src = activeTrack;
    audio.load();
    if (audioUnlocked) {
      void audio.play().catch(() => {
        setPlayError('浏览器已阻止自动播放，请点击「开启音乐」后继续闯关。');
      });
    }
  }, [activeTrack, audioUnlocked]);

  const unlockAndPlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioUnlocked(true);
    setPlayError('');
    void audio.play().catch(() => {
      setPlayError('当前环境无法自动播放音乐，请检查系统媒体权限。');
    });
  };

  const switchLevel = (nextLevel: number) => {
    setLevelId(nextLevel);
    if (!audioUnlocked) return;
    setTimeout(() => {
      const audio = audioRef.current;
      if (!audio) return;
      void audio.play().catch(() => undefined);
    }, 80);
  };

  const sourceImageUrl = currentLevel.sourceImageUrl?.trim() || currentTheme.fallbackImageUrl;

  const gameConfig = {
    id: `demo-${theme}-${currentLevel.id}`,
    slug: `demo-huarongdao-${theme}-${currentLevel.id}`,
    name: `${currentTheme.label} · ${currentLevel.label}`,
    status: 'active',
    rows: currentLevel.rows,
    cols: currentLevel.cols,
    sourceImageUrl,
    showReference: true,
    shuffleSteps: currentLevel.shuffleSteps,
    startMode: 'random-solvable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden px-3 py-4 md:px-8 md:py-8"
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
                left: `${(idx * 5.4) % 100}%`,
                animationDuration: `${9 + (idx % 7)}s`,
                animationDelay: `${(idx % 6) * -1.2}s`,
                opacity: 0.45 + (idx % 4) * 0.12,
              }}
            />
          ))}
        </div>
      ) : null}

      <audio ref={audioRef} loop preload="none" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col justify-center">
        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-white/20 bg-black/30 p-3 backdrop-blur-sm md:p-5">
          <div className="mb-3 flex flex-col gap-3 md:mb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-lg font-semibold text-white md:text-2xl">华容道三关挑战</h1>
              {!audioUnlocked ? (
                <button
                  type="button"
                  onClick={unlockAndPlay}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-black md:text-sm"
                  style={{ backgroundColor: currentTheme.accent }}
                >
                  开启音乐
                </button>
              ) : (
                <div className="rounded-md border border-white/20 bg-black/20 px-3 py-1 text-xs text-white/80">
                  BGM: {activeTrack ? TRACK_NAME_MAP[activeTrack] || '随机曲目' : '加载中'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {levels.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => switchLevel(level.id)}
                  className="rounded-xl border p-2 text-left transition md:p-3"
                  style={{
                    borderColor: levelId === level.id ? currentTheme.accent : '#ffffff33',
                    background: levelId === level.id ? `${currentTheme.accent}26` : '#00000020',
                  }}
                >
                  <p className="text-xs text-white/70 md:text-sm">第 {level.id} 关</p>
                  <p className="text-sm font-semibold text-white md:text-base">{level.label}</p>
                  <p className="text-[11px] text-white/70 md:text-xs">
                    {level.rows} x {level.cols}
                  </p>
                </button>
              ))}
            </div>

            {playError ? <p className="text-xs text-rose-200">{playError}</p> : null}
          </div>

          <div className="mx-auto w-full max-w-3xl rounded-xl border border-white/15 bg-black/25 p-2 md:p-4">
            <div className="mb-2 text-center text-xs text-white/65 md:text-sm">
              当前关卡：{currentLevel.label} · 网格 {currentLevel.rows}x{currentLevel.cols}
            </div>
            <ClientOnlyHuarongdaoGamePage key={gameConfig.slug} config={gameConfig as any} />
          </div>
        </div>
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
