'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Title } from 'animal-island-ui';
import {
  archiveWorkspaceViaApi,
  importWorkspaceZip,
} from '../services/teachHubClient';
import { TEACH_HUB_BASE, workspacePath } from '../utils/routes';

type SettingsPageProps = {
  workspaceId: string;
};

export function SettingsPage({ workspaceId }: SettingsPageProps) {
  const router = useRouter();
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [message, setMessage] = useState('');

  const handleImport = async () => {
    if (!zipFile) {
      setMessage('请选择 zip 文件');
      return;
    }
    setImporting(true);
    setMessage('');
    try {
      const result = await importWorkspaceZip(workspaceId, zipFile);
      setMessage(
        `导入 ${result.importedFiles} 个文件，${result.lessonCount} 节课时` +
          (result.warnings.length ? `；提示：${result.warnings.join(' ')}` : ''),
      );
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '导入失败');
    } finally {
      setImporting(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('确定归档此工作区？归档后将从默认列表隐藏。')) return;
    setArchiving(true);
    try {
      await archiveWorkspaceViaApi(workspaceId);
      router.push(TEACH_HUB_BASE);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '归档失败');
      setArchiving(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Link href={workspacePath(workspaceId)} className="text-sm text-[#2c5282] hover:underline">
          ← 返回工作区
        </Link>
      </div>
      <Title size="middle" color="app-teal" className="mb-6">
        工作区设置
      </Title>

      <section className="th-form max-w-lg">
        <h3 className="text-sm font-semibold">导入 teach 工作区 zip</h3>
        <p className="text-sm text-[#7a6f5c]">
          可导入本地 musicStudy 等目录打包的 zip，自动写入当前工作区。
        </p>
        <input
          type="file"
          accept=".zip,application/zip"
          onChange={(e) => setZipFile(e.target.files?.[0] ?? null)}
        />
        <Button type="primary" onClick={() => void handleImport()} disabled={importing}>
          {importing ? '导入中…' : '上传并导入'}
        </Button>

        <hr className="border-[#eee8dc]" />

        <h3 className="text-sm font-semibold text-red-700">危险操作</h3>
        <Button type="text" onClick={() => void handleArchive()} disabled={archiving}>
          {archiving ? '归档中…' : '归档此工作区'}
        </Button>

        {message ? <p className="text-sm text-[#7a6f5c]">{message}</p> : null}
      </section>
    </div>
  );
}
