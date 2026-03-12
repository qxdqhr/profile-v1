// @ts-nocheck
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { moveTile, shuffleSolvable } from 'sa2kit/huarongdao';
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

const TIME_LIMIT_MAP: Record<number, number> = {
  1: 180,
  2: 240,
  3: 300,
};

const findLevel = (levels: HuarongdaoLevelConfig[], id: number) =>
  levels.find((item) => item.id === id) || levels[0];

const pickRandomTrack = (tracks: string[], prevTrack: string | null) => {
  if (!tracks.length) return null;
  if (tracks.length === 1) return tracks[0];
  const candidates = tracks.filter((item) => item !== prevTrack);
  return candidates[Math.floor(Math.random() * candidates.length)];
};

export default function HuarongdaoPage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<HuarongdaoTheme>('miku');
  const [levelId, setLevelId] = useState<number>(1);
  const [levels, setLevels] = useState<HuarongdaoLevelConfig[]>(DEFAULT_HUARONGDAO_LEVEL_CONFIGS);
  const [bgmTracks, setBgmTracks] = useState<string[]>([]);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [playError, setPlayError] = useState<string>('');
  const [nowTs, setNowTs] = useState<number>(Date.now());
  const [gameState, setGameState] = useState<any>(null);
  const [showWinModal, setShowWinModal] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTheme = THEMES[theme];
  const petals = useMemo(() => Array.from({ length: 18 }, (_, i) => i), []);
  const currentLevel = findLevel(levels, levelId);
  const sourceImageUrl = currentLevel.sourceImageUrl?.trim() || currentTheme.fallbackImageUrl;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/huarongdao/config', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok || !json?.success) return;
        const persisted = buildPersistedConfig(json?.data);
        setTheme(normalizeTheme(persisted.theme));
        setLevels(persisted.levels);
        setBgmTracks((persisted.bgmTracks || []).map((item) => String(item || '').trim()).filter(Boolean));
      } catch {
        setLevels(DEFAULT_HUARONGDAO_LEVEL_CONFIGS);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const tracks = (bgmTracks || []).length ? bgmTracks : currentTheme.tracks;
    setActiveTrack((prev) => pickRandomTrack(tracks, prev));
  }, [mounted, theme, levelId, bgmTracks, currentTheme.tracks]);

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

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => setNowTs(Date.now()), 200);
    return () => clearInterval(timer);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const tiles = shuffleSolvable(currentLevel.rows, currentLevel.cols, currentLevel.shuffleSteps);
    setGameState({
      tiles,
      rows: currentLevel.rows,
      cols: currentLevel.cols,
      moveCount: 0,
      startedAt: Date.now(),
      isSolved: false,
      finishedAt: undefined,
    });
    setShowWinModal(false);
  }, [mounted, levelId, currentLevel.rows, currentLevel.cols, currentLevel.shuffleSteps, sourceImageUrl]);

  useEffect(() => {
    if (gameState?.isSolved) {
      setShowWinModal(true);
    }
  }, [gameState?.isSolved]);

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

  const resetCurrentLevel = () => {
    const tiles = shuffleSolvable(currentLevel.rows, currentLevel.cols, currentLevel.shuffleSteps);
    setGameState({
      tiles,
      rows: currentLevel.rows,
      cols: currentLevel.cols,
      moveCount: 0,
      startedAt: Date.now(),
      isSolved: false,
      finishedAt: undefined,
    });
    setShowWinModal(false);
  };

  const elapsedSec = gameState
    ? Math.floor(((gameState.finishedAt || nowTs) - gameState.startedAt) / 1000)
    : 0;
  const timeLimitSec = TIME_LIMIT_MAP[levelId] || 240;
  const remainSec = Math.max(0, timeLimitSec - elapsedSec);
  const maxScore = 1200 + levelId * 500;
  const score = Math.max(0, maxScore - elapsedSec * 6 - (gameState?.moveCount || 0) * 4);

  const onTileClick = (tileIndex: number) => {
    if (!gameState || gameState.isSolved) return;
    setGameState((prev: any) => moveTile(prev, tileIndex));
  };

  const nextLevel = () => {
    if (levelId < 3) {
      switchLevel(levelId + 1);
      setShowWinModal(false);
      return;
    }
    resetCurrentLevel();
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

            <div className="mb-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-cyan-300/40 bg-gradient-to-br from-cyan-400/35 to-cyan-700/30 p-2">
                <p className="text-[11px] text-cyan-100">剩余时间</p>
                <p className="text-lg font-bold text-cyan-50 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]">{remainSec}s</p>
              </div>
              <div className="rounded-lg border border-fuchsia-300/40 bg-gradient-to-br from-fuchsia-400/35 to-fuchsia-700/30 p-2">
                <p className="text-[11px] text-fuchsia-100">分数</p>
                <p className="text-lg font-bold text-fuchsia-50 drop-shadow-[0_0_8px_rgba(232,121,249,0.9)]">{score}</p>
              </div>
              <div className="rounded-lg border border-emerald-300/40 bg-gradient-to-br from-emerald-400/35 to-emerald-700/30 p-2">
                <p className="text-[11px] text-emerald-100">步数</p>
                <p className="text-lg font-bold text-emerald-50 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">{gameState?.moveCount || 0}</p>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[min(86vw,520px)]">
              {mounted && gameState ? (
                <div
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${gameState.cols}, minmax(0, 1fr))` }}
                >
                  {gameState.tiles.map((tile: number, index: number) => {
                    if (tile === 0) {
                      return (
                        <div
                          key={`blank-${index}`}
                          className="aspect-square rounded-md border border-white/10 bg-white/10"
                        />
                      );
                    }
                    const pieceIndex = tile - 1;
                    const pr = Math.floor(pieceIndex / gameState.cols);
                    const pc = pieceIndex % gameState.cols;
                    const x = gameState.cols > 1 ? (pc / (gameState.cols - 1)) * 100 : 0;
                    const y = gameState.rows > 1 ? (pr / (gameState.rows - 1)) * 100 : 0;

                    return (
                      <button
                        key={`${tile}-${index}`}
                        onClick={() => onTileClick(index)}
                        className="aspect-square rounded-md border border-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                        style={{
                          backgroundImage: `url(${sourceImageUrl})`,
                          backgroundSize: `${gameState.cols * 100}% ${gameState.rows * 100}%`,
                          backgroundPosition: `${x}% ${y}%`,
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-white/70">正在加载游戏区域...</div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={resetCurrentLevel}
                className="rounded-md border border-white/30 px-3 py-1.5 text-xs text-white/90"
              >
                重新开始本关
              </button>
            </div>
          </div>
        </div>
      </div>

      {showWinModal ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-slate-900/95 p-5 text-white shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
            <p className="text-xl font-bold text-emerald-300">通关成功！</p>
            <p className="mt-2 text-sm text-white/80">{currentLevel.label} 已完成，继续挑战下一关吧。</p>
            <div className="mt-3 space-y-1 text-sm">
              <p>最终用时：{elapsedSec}s</p>
              <p>最终步数：{gameState?.moveCount || 0}</p>
              <p>关卡得分：{score}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowWinModal(false)}
                className="w-full rounded-md border border-white/25 px-3 py-2 text-sm"
              >
                关闭
              </button>
              <button
                type="button"
                onClick={nextLevel}
                className="w-full rounded-md px-3 py-2 text-sm font-semibold text-black"
                style={{ backgroundColor: currentTheme.accent }}
              >
                {levelId < 3 ? '下一关' : '再来一轮'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
