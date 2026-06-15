'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Title } from 'animal-island-ui';
import { fetchWorkspaceFileText, fetchWorkspaceFiles } from '../services/teachHubClient';
import { workspacePath } from '../utils/routes';

type RecordsPageProps = {
  workspaceId: string;
};

export function RecordsPage({ workspaceId }: RecordsPageProps) {
  const [records, setRecords] = useState<Array<{ path: string; content: string }>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const files = await fetchWorkspaceFiles(workspaceId);
        const paths = files
          .filter((f) => f.relativePath.startsWith('learning-records/') && f.relativePath.endsWith('.md'))
          .map((f) => f.relativePath)
          .sort();
        const contents = await Promise.all(
          paths.map(async (path) => ({
            path,
            content: await fetchWorkspaceFileText(workspaceId, path),
          })),
        );
        if (mounted) setRecords(contents);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : '加载失败');
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [workspaceId]);

  return (
    <div>
      <div className="mb-4">
        <Link href={workspacePath(workspaceId)} className="text-sm text-[#2c5282] hover:underline">
          ← 返回工作区
        </Link>
      </div>
      <Title size="middle" color="app-teal" className="mb-6">
        学习记录
      </Title>
      {error ? <p className="text-red-600">{error}</p> : null}
      {records.length === 0 ? (
        <p className="text-sm text-[#7a6f5c]">尚无学习记录。完成课时或生成新课后会出现在这里。</p>
      ) : (
        <div className="flex flex-col gap-4">
          {records.map((r) => (
            <article key={r.path} className="th-md-preview">
              <h3 className="mb-2 text-sm font-semibold text-[#5c4f3a]">{r.path}</h3>
              {r.content}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
