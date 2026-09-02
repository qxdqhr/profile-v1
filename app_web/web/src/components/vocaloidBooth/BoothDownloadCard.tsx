'use client';

import { useState } from 'react';

export function BoothDownloadCard({ initialCode = '' }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<any>(null);

  const redeem = async () => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await fetch('/api/vocaloid-booth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'redeem', matchCode: code, requesterKey: 'web-user' }),
      });
      setPayload(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const files = payload?.files ?? [];

  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
      <h3 className="text-lg font-semibold text-sky-600">下载组件（通用）</h3>
      <div className="mt-3 flex gap-2">
        <input className="w-full rounded border px-3 py-2" value={code} onChange={(e) => setCode(e.target.value)} placeholder="输入匹配码" />
        <button disabled={loading || !code} onClick={redeem} className="rounded-xl bg-sky-500 px-4 py-2 text-white disabled:opacity-50">
          {loading ? '查询中...' : '查询下载'}
        </button>
      </div>

      <ul className="mt-3 space-y-2 text-sm">
        {files.map((f: any) => (
          <li key={f.id} className="flex items-center justify-between rounded bg-white px-3 py-2">
            <span className="truncate">{f.fileName}</span>
            <a href={f.accessUrl || '#'} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">
              下载
            </a>
          </li>
        ))}
      </ul>

      {payload && <pre className="mt-3 max-h-56 overflow-auto rounded bg-white p-2 text-xs">{JSON.stringify(payload, null, 2)}</pre>}
    </div>
  );
}
