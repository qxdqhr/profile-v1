// @ts-nocheck
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HuarongdaoGamePage } from 'sa2kit/huarongdao/ui/web';

const THEMES = {
  miku: {
    label: '初音未来（原版主题）',
    accent: '#22d3ee',
    accentSoft: '#a5f3fc',
    bgStart: '#05273c',
    bgEnd: '#0b1324',
    sourceImageUrl: '/mikutalking/models/miku/texture/头.png',
    tracks: ['/linkGame/mp3/ShakeIt!-Miku.mp3', '/linkGame/mp3/VivalaVida.mp3'],
  },
  sakura: {
    label: '樱花初音主题',
    accent: '#f472b6',
    accentSoft: '#fbcfe8',
    bgStart: '#4a1834',
    bgEnd: '#220e22',
    sourceImageUrl: '/mikutalking/models/YYB_Z6SakuraMiku/tex/face.png',
    tracks: ['/linkGame/mp3/utanikatachinaikedo.mp3', '/linkGame/mp3/VivalaVida.mp3'],
  },
};

const LEVELS = [
  { id: 1, label: '难度 1', rows: 3, cols: 3, shuffleSteps: 60, badge: '入门' },
  { id: 2, label: '难度 2', rows: 4, cols: 4, shuffleSteps: 110, badge: '进阶' },
  { id: 3, label: '难度 3', rows: 5, cols: 5, shuffleSteps: 180, badge: '挑战' },
];

const TRACK_NAME_MAP: Record<string, string> = {
  '/linkGame/mp3/ShakeIt!-Miku.mp3': 'Shake It! - Miku',
  '/linkGame/mp3/utanikatachinaikedo.mp3': 'Sakura Theme OST',
  '/linkGame/mp3/VivalaVida.mp3': 'Viva La Vida (Instrumental)',
};

const buildConfig = (themeKey: keyof typeof THEMES, levelId: number) => {
  const level = LEVELS.find((item) => item.id === levelId) || LEVELS[0];
  return {
    id: `demo-${themeKey}-${level.id}`,
    slug: `demo-huarongdao-${themeKey}-${level.id}`,
    name: `${THEMES[themeKey].label} · ${level.label}`,
    status: 'active',
    rows: level.rows,
    cols: level.cols,
    sourceImageUrl: THEMES[themeKey].sourceImageUrl,
    showReference: true,
    shuffleSteps: level.shuffleSteps,
    startMode: 'random-solvable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const pickRandomTrack = (tracks: string[], prevTrack: string | null) => {
  if (!tracks.length) return null;
  if (tracks.length === 1) return tracks[0];
  const candidates = tracks.filter((item) => item !== prevTrack);
  return candidates[Math.floor(Math.random() * candidates.length)];
};

export default function HuarongdaoPage() {
  const [theme, setTheme] = useState<keyof typeof THEMES>('miku');
  const [levelId, setLevelId] = useState<number>(1);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [playError, setPlayError] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const config = useMemo(() => buildConfig(theme, levelId), [theme, levelId]);
  const petals = useMemo(() => Array.from({ length: 18 }, (_, i) => i), []);
  const currentTheme = THEMES[theme];
  const currentLevel = LEVELS.find((item) => item.id === levelId) || LEVELS[0];

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

  const switchTheme = (next: keyof typeof THEMES) => {
    setTheme(next);
    if (!audioUnlocked) return;
    setTimeout(() => {
      const audio = audioRef.current;
      if (!audio) return;
      void audio.play().catch(() => undefined);
    }, 80);
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

            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(THEMES).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchTheme(key as keyof typeof THEMES)}
                  className="rounded-full border px-3 py-1 text-xs transition md:px-4 md:py-1.5 md:text-sm"
                  style={{
                    borderColor: theme === key ? item.accent : '#ffffff44',
                    background: theme === key ? `${item.accent}33` : '#00000022',
                    color: '#fff',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {LEVELS.map((level) => (
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
                  <p className="text-xs text-white/70 md:text-sm">{level.badge}</p>
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
            <HuarongdaoGamePage key={config.slug} config={config as any} />
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
