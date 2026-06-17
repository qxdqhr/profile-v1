'use client';

import { useMemo, useState } from 'react';
import { BoothDownloadCard, BoothUploadCard } from '@/components/vocaloidBooth';

type TabKey = 'upload' | 'download';

export default function VocaloidBoothPage() {
  const [tab, setTab] = useState<TabKey>('upload');
  const [code, setCode] = useState('');
  const petals = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);

  return (
    <main className="booth-page min-h-screen p-4 md:p-8">
      <div className="petal-layer pointer-events-none" aria-hidden>
        {petals.map((idx) => (
          <span
            key={idx}
            className="petal"
            style={{
              top: `${-8 - (idx % 6) * 8}%`,
              right: `${-5 + (idx % 7) * 12}%`,
              animationDelay: `${idx * 0.7}s`,
              animationDuration: `${7 + (idx % 4) * 2}s`,
              transform: `scale(${0.7 + (idx % 3) * 0.2}) rotate(${idx * 20}deg)`,
            }}
          />
        ))}
      </div>

      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-pink-200/70 bg-white/85 p-4 shadow-xl backdrop-blur md:p-6">
        <h1 className="text-center text-2xl font-bold text-pink-600 md:text-3xl">🌸 Vocaloid Booth</h1>
        <p className="mt-2 text-center text-sm text-slate-500">页面：/vocaloid-booth · API：/api/vocaloid-booth</p>

        <div className="mt-4 flex rounded-2xl bg-pink-50 p-1">
          <button onClick={() => setTab('upload')} className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${tab === 'upload' ? 'bg-pink-500 text-white shadow' : 'text-pink-600 hover:bg-pink-100'}`}>
            上传
          </button>
          <button onClick={() => setTab('download')} className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${tab === 'download' ? 'bg-pink-500 text-white shadow' : 'text-pink-600 hover:bg-pink-100'}`}>
            下载
          </button>
        </div>

        <div className="mt-4">{tab === 'upload' ? <BoothUploadCard onCreated={(next) => setCode(next)} /> : <BoothDownloadCard initialCode={code} />}</div>
      </section>

      <style jsx>{`
        .booth-page { background: radial-gradient(circle at 20% 20%, #ffe8f2 0%, #ffeef8 40%, #f9fbff 100%); position: relative; overflow: hidden; }
        .petal-layer { position: fixed; inset: 0; z-index: 1; }
        .petal { position: absolute; width: 14px; height: 10px; background: linear-gradient(135deg, #ff8cc7, #ffb0d9); border-radius: 80% 20% 80% 20%; opacity: 0.7; animation-name: petal-fall; animation-timing-function: linear; animation-iteration-count: infinite; filter: blur(0.2px); }
        @keyframes petal-fall { 0% { transform: translate3d(0, -5vh, 0) rotate(0deg);} 100% { transform: translate3d(-120vw, 120vh, 0) rotate(360deg);} }
      `}</style>
    </main>
  );
}
