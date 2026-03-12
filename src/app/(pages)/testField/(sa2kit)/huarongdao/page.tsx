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
    defaultTrack: '/linkGame/mp3/ShakeIt!-Miku.mp3',
  },
  sakura: {
    label: '樱花初音主题',
    accent: '#f472b6',
    accentSoft: '#fbcfe8',
    bgStart: '#4a1834',
    bgEnd: '#220e22',
    sourceImageUrl: '/mikutalking/models/YYB_Z6SakuraMiku/tex/face.png',
    defaultTrack: '/linkGame/mp3/utanikatachinaikedo.mp3',
  },
};

const TRACK_OPTIONS = [
  { value: 'theme-default', label: '主题默认 BGM' },
  { value: '/linkGame/mp3/ShakeIt!-Miku.mp3', label: 'Miku - Shake It!' },
  { value: '/linkGame/mp3/utanikatachinaikedo.mp3', label: '樱花向轻音乐' },
  { value: '/linkGame/mp3/VivalaVida.mp3', label: '纯音乐（Viva La Vida）' },
  { value: 'custom', label: '自定义音乐 URL' },
];

const buildConfig = (themeKey: keyof typeof THEMES) => ({
  id: `demo-${themeKey}`,
  slug: `demo-huarongdao-${themeKey}`,
  name: THEMES[themeKey].label,
  status: 'active',
  rows: 3,
  cols: 3,
  sourceImageUrl: THEMES[themeKey].sourceImageUrl,
  showReference: true,
  shuffleSteps: 100,
  startMode: 'random-solvable',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export default function HuarongdaoPage() {
  const [theme, setTheme] = useState<keyof typeof THEMES>('miku');
  const [track, setTrack] = useState<string>('theme-default');
  const [customTrack, setCustomTrack] = useState<string>('');
  const [volume, setVolume] = useState<number>(0.45);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const config = useMemo(() => buildConfig(theme), [theme]);
  const petals = useMemo(() => Array.from({ length: 18 }, (_, i) => i), []);
  const resolvedTrack =
    track === 'custom'
      ? customTrack.trim()
      : track === 'theme-default'
        ? THEMES[theme].defaultTrack
        : track;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!resolvedTrack) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    audio.src = resolvedTrack;
    audio.load();
    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    }
  }, [resolvedTrack, isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !resolvedTrack) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const currentTheme = THEMES[theme];

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

      <div className="relative z-10 mx-auto w-full max-w-6xl rounded-2xl border border-white/20 bg-black/25 p-4 backdrop-blur-sm md:p-6">
        <div className="mb-4 flex flex-col gap-3 md:mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(THEMES).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTheme(key as keyof typeof THEMES)}
                className="rounded-full border px-4 py-1.5 text-sm transition"
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

          <div className="grid grid-cols-1 gap-3 rounded-xl border border-white/15 bg-black/20 p-3 text-white md:grid-cols-[1fr_auto_auto] md:items-center">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/70">背景音乐配置</label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="rounded-md border border-white/20 bg-black/30 px-2 py-1.5 text-sm outline-none"
              >
                {TRACK_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {track === 'custom' ? (
                <input
                  value={customTrack}
                  onChange={(e) => setCustomTrack(e.target.value)}
                  placeholder="输入可访问的音频 URL（mp3/wav/ogg）"
                  className="rounded-md border border-white/20 bg-black/30 px-2 py-1.5 text-sm outline-none"
                />
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">音量</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
            </div>

            <button
              type="button"
              onClick={togglePlay}
              className="rounded-md px-4 py-2 text-sm font-medium text-black"
              style={{ backgroundColor: currentTheme.accent }}
            >
              {isPlaying ? '暂停 BGM' : '播放 BGM'}
            </button>
          </div>
        </div>

        <HuarongdaoGamePage key={config.slug} config={config as any} />
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
