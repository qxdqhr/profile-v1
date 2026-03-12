// @ts-nocheck
'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { HuarongdaoConfigPage as SA2HuarongdaoConfigPage } from 'sa2kit/huarongdao/ui/web';

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

const CONFIG_GUIDES = [
  {
    title: '基础信息',
    hint: '名称 / slug / 状态',
    desc: '用于区分不同关卡配置，slug 建议语义化且唯一。',
  },
  {
    title: '拼图难度',
    hint: 'rows / cols / shuffleSteps',
    desc: '网格越大、打乱步数越高，整体难度越高。',
  },
  {
    title: '视觉与体验',
    hint: 'sourceImageUrl / showReference',
    desc: '高对比图片更易识别，移动端建议开启参考图。',
  },
];

const FLOW_STEPS = [
  '先创建配置：填写名称和 slug，保存后得到可复用配置。',
  '再设定难度：优先调整 rows/cols，其次再调 shuffleSteps。',
  '最后联调体验：跳转游戏页验证三关体感和音乐切换效果。',
];

export default function HuarongdaoConfigPage() {
  const [theme, setTheme] = useState<keyof typeof THEMES>('miku');
  const currentTheme = THEMES[theme];
  const petals = useMemo(() => Array.from({ length: 16 }, (_, i) => i), []);

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
              <h1 className="text-xl font-semibold text-white md:text-2xl">华容道配置中心</h1>
              <p className="text-sm text-white/75">清晰配置项 + 快速验证流程</p>
            </div>
            <Link
              href="/testField/huarongdao"
              className="rounded-md border border-white/25 bg-black/20 px-3 py-1.5 text-sm text-white transition hover:bg-black/35"
            >
              返回游戏页
            </Link>
          </div>

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
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {CONFIG_GUIDES.map((item) => (
            <div key={item.title} className="rounded-xl border border-white/15 bg-black/20 p-3 text-white">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-white/65">{item.hint}</p>
              <p className="mt-2 text-xs text-white/80">{item.desc}</p>
            </div>
          ))}
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

        <div className="rounded-xl border border-white/15 bg-white/95 p-3 md:p-4">
          <SA2HuarongdaoConfigPage />
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
