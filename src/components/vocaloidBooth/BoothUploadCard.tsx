'use client';

import { useState } from 'react';
import { universalFileClient } from 'sa2kit/universalFile';

interface Props {
  onCreated?: (matchCode: string) => void;
}

export function BoothUploadCard({ onCreated }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [boothId, setBoothId] = useState('cp-production');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const uploadAndCreate = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const uploaded = [] as any[];
      for (const file of files) {
        const meta = await universalFileClient.uploadFile({
          file,
          moduleId: 'vocaloid-booth',
          businessId: boothId,
          permission: 'private',
        });
        uploaded.push({
          fileName: meta.originalName,
          objectKey: meta.id,
          size: meta.size,
          mimeType: meta.mimeType,
          checksum: meta.hash,
          kind: 'other',
        });
      }

      const res = await fetch('/api/vocaloid-booth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          boothId,
          files: uploaded,
        }),
      });

      const data = await res.json();
      setResult(data);
      const code = data?.data?.record?.matchCode;
      if (code) onCreated?.(code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-pink-100 bg-pink-50/70 p-4">
      <h3 className="text-lg font-semibold text-pink-600">上传文件（UniversalFile）</h3>
      <input className="mt-3 w-full rounded border px-3 py-2" value={boothId} onChange={(e) => setBoothId(e.target.value)} placeholder="boothId" />
      <input
        className="mt-3 block w-full text-sm"
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
      />
      <button disabled={loading || files.length === 0} onClick={uploadAndCreate} className="mt-3 rounded-xl bg-pink-500 px-4 py-2 text-white disabled:opacity-50">
        {loading ? '上传中...' : '上传并生成匹配码'}
      </button>
      {result && <pre className="mt-3 max-h-56 overflow-auto rounded bg-white p-2 text-xs">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
