'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BoothUploadPanel,
  BoothRedeemPanel,
  BoothSuccessCard,
  type BoothUploadSubmitPayload,
} from 'sa2kit/business/vocaloidBooth/web';
import type { BoothUploadRecord } from 'sa2kit/business/vocaloidBooth';
import { uploadModuleFile } from 'sa2kit/common/file/client';

type TabKey = 'upload' | 'download';

function toIsoString(value: string | Date) {
  return value instanceof Date ? value.toISOString() : value;
}

export default function VocaloidBoothPage() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') ?? '';

  const [tab, setTab] = useState<TabKey>(initialCode ? 'download' : 'upload');
  const [uploading, setUploading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [success, setSuccess] = useState<{
    matchCode: string;
    expiresAt: string;
    downloadUrlPath: string;
  } | null>(null);

  const petals = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);

  const handleUpload = async (payload: BoothUploadSubmitPayload) => {
    setUploading(true);
    setSuccess(null);
    try {
      const uploaded = [];
      for (const file of payload.files) {
        const result = await uploadModuleFile({
          file,
          moduleId: 'vocaloid-booth',
          businessId: payload.boothId,
          permission: 'private',
        });
        uploaded.push({
          fileName: file.name,
          objectKey: result.fileId,
          size: file.size,
          mimeType: file.type,
          kind: 'other' as const,
        });
      }

      const res = await fetch('/api/vocaloid-booth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          boothId: payload.boothId,
          ttlHours: payload.ttlHours,
          nickname: payload.nickname,
          contactTail: payload.contactTail,
          files: uploaded,
        }),
      });

      const data = await res.json();
      const record = data?.data?.record;
      if (record?.matchCode) {
        setSuccess({
          matchCode: record.matchCode,
          expiresAt: toIsoString(record.expiresAt),
          downloadUrlPath: record.downloadUrlPath ?? `/vocaloid-booth?code=${record.matchCode}`,
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRedeem = async (matchCode: string): Promise<BoothUploadRecord | null> => {
    setRedeemLoading(true);
    try {
      const res = await fetch('/api/vocaloid-booth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'redeem', matchCode, requesterKey: 'web-user' }),
      });
      const payload = await res.json();
      const record = payload?.data;
      if (!record) return null;

      const filesWithUrls = ((payload.files ?? record.files ?? []) as Array<Record<string, unknown>>).map(
        (file, index) => ({
          id: String(file.id ?? `${file.fileName}-${index}`),
          fileName: String(file.fileName ?? ''),
          size: Number(file.size ?? 0),
          mimeType: file.mimeType ? String(file.mimeType) : undefined,
          objectKey: String(file.accessUrl ?? file.objectKey ?? ''),
          checksum: file.checksum ? String(file.checksum) : undefined,
          kind: file.kind as BoothUploadRecord['files'][number]['kind'],
        })
      );

      return {
        id: String(record.id),
        matchCode: String(record.matchCode),
        boothId: String(record.boothId),
        createdAt: toIsoString(record.createdAt),
        expiresAt: toIsoString(record.expiresAt),
        files: filesWithUrls,
        metadata: record.metadata ?? undefined,
        status: record.status,
        downloadCount: Number(record.downloadCount ?? 0),
      };
    } finally {
      setRedeemLoading(false);
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
        <h1 className="text-center text-2xl font-bold text-pink-600 md:text-3xl">🌸 Vocaloid Booth</h1>
        <p className="mt-2 text-center text-sm text-slate-500">页面：/vocaloid-booth · API：/api/vocaloid-booth</p>

        <div className="mt-4 flex rounded-2xl bg-pink-50 p-1">
          <button
            onClick={() => setTab('upload')}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${tab === 'upload' ? 'bg-pink-500 text-white shadow' : 'text-pink-600 hover:bg-pink-100'}`}
          >
            上传
          </button>
          <button
            onClick={() => setTab('download')}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${tab === 'download' ? 'bg-pink-500 text-white shadow' : 'text-pink-600 hover:bg-pink-100'}`}
          >
            下载
          </button>
        </div>

        <div className="mt-4">
          {tab === 'upload' ? (
            <div className="space-y-4">
              <BoothUploadPanel boothId="cp-production" uploading={uploading} onSubmit={handleUpload} />
              {success && (
                <BoothSuccessCard
                  matchCode={success.matchCode}
                  expiresAt={success.expiresAt}
                  downloadUrlPath={success.downloadUrlPath}
                />
              )}
            </div>
          ) : (
            <BoothRedeemPanel
              loading={redeemLoading}
              initialMatchCode={initialCode}
              onRedeem={handleRedeem}
            />
          )}
        </div>
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
