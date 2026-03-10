'use client';

import { useMemo, useState } from 'react';

type TabKey = 'upload' | 'download';

export default function VocaloidBoothTestPage() {
  const [tab, setTab] = useState<TabKey>('upload');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const petals = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);

  const callApi = async (payload: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/vocaloid-booth-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
      if (payload.action === 'create' && data?.data?.record?.matchCode) {
        setCode(data.data.record.matchCode);
      }
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-center text-2xl font-bold text-pink-600 md:text-3xl">🌸 Vocaloid Booth 测试页</h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          页面：/vocaloid-booth-test · API：/api/vocaloid-booth-test
        </p>

        <div className="mt-4 flex rounded-2xl bg-pink-50 p-1">
          <button
            onClick={() => setTab('upload')}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
              tab === 'upload' ? 'bg-pink-500 text-white shadow' : 'text-pink-600 hover:bg-pink-100'
            }`}
          >
            上传
          </button>
          <button
            onClick={() => setTab('download')}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
              tab === 'download' ? 'bg-pink-500 text-white shadow' : 'text-pink-600 hover:bg-pink-100'
            }`}
          >
            下载
          </button>
        </div>

        {tab === 'upload' ? (
          <div className="mt-4 rounded-2xl border border-pink-100 bg-pink-50/60 p-4">
            <h2 className="text-lg font-semibold text-pink-600">上传并生成匹配码</h2>
            <p className="mt-1 text-sm text-slate-500">点击后会创建一条测试记录并返回匹配码。</p>
            <button
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow hover:opacity-95 md:w-auto"
              disabled={loading}
              onClick={() =>
                callApi({
                  action: 'create',
                  boothId: 'cp-test',
                  nickname: 'tester',
                  files: [
                    {
                      fileName: 'song.vsqx',
                      objectKey: 'booth/cp-test/song.vsqx',
                      size: 2048,
                      kind: 'project',
                    },
                  ],
                })
              }
            >
              {loading ? '处理中...' : '创建测试上传记录'}
            </button>
            {code && (
              <div className="mt-4 rounded-xl bg-white p-3 text-sm text-pink-700">
                当前匹配码：<span className="font-bold tracking-widest">{code}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
            <h2 className="text-lg font-semibold text-sky-600">凭匹配码下载</h2>
            <p className="mt-1 text-sm text-slate-500">输入上传后获得的匹配码，测试兑换接口。</p>
            <div className="mt-4 flex flex-col gap-2 md:flex-row">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="输入匹配码"
                className="w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none ring-sky-200 focus:ring"
              />
              <button
                className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || !code}
                onClick={() => callApi({ action: 'redeem', matchCode: code, requesterKey: 'web-test' })}
              >
                {loading ? '处理中...' : '兑换下载'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-4">
          <a href="/vocaloid-booth-config" className="inline-block rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-pink-600 hover:bg-pink-50">
            打开配置入口 /vocaloid-booth-config
          </a>
        </div>

        <pre className="mt-4 max-h-72 overflow-auto rounded-2xl bg-slate-900 p-3 text-xs text-pink-100">
          {JSON.stringify(result, null, 2)}
        </pre>
      </section>

      <style jsx>{`
        .booth-page {
          background: radial-gradient(circle at 20% 20%, #ffe8f2 0%, #ffeef8 40%, #f9fbff 100%);
          position: relative;
          overflow: hidden;
        }
        .petal-layer {
          position: fixed;
          inset: 0;
          z-index: 1;
        }
        .petal {
          position: absolute;
          width: 14px;
          height: 10px;
          background: linear-gradient(135deg, #ff8cc7, #ffb0d9);
          border-radius: 80% 20% 80% 20%;
          opacity: 0.7;
          animation-name: petal-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          filter: blur(0.2px);
        }
        @keyframes petal-fall {
          0% {
            transform: translate3d(0, -5vh, 0) rotate(0deg);
          }
          100% {
            transform: translate3d(-120vw, 120vh, 0) rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
