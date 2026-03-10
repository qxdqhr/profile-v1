'use client';

import { useState } from 'react';

export default function VocaloidBoothTestPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Vocaloid Booth 新功能测试</h1>
      <div className="text-sm text-gray-600">页面：/vocaloid-booth-test，API：/api/vocaloid-booth-test</div>

      <div className="flex gap-2">
        <button
          className="rounded bg-indigo-600 px-3 py-2 text-white"
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
          创建测试上传记录
        </button>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="输入匹配码"
          className="rounded border px-3 py-2 text-sm"
        />

        <button
          className="rounded bg-slate-900 px-3 py-2 text-white"
          disabled={loading || !code}
          onClick={() => callApi({ action: 'redeem', matchCode: code, requesterKey: 'web-test' })}
        >
          兑换下载
        </button>
      </div>

      <pre className="overflow-auto rounded bg-slate-100 p-3 text-xs">{JSON.stringify(result, null, 2)}</pre>
    </main>
  );
}
