'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from 'animal-island-ui';
import { cn } from '../utils/cn';
import { useLessonReaderSettings } from '../hooks/useLessonReaderSettings';
import {
  archiveWorkspaceViaApi,
  importWorkspaceZip,
} from '../services/teachHubClient';
import {
  LESSON_READER_POSITION_OPTIONS,
  type LessonReaderBarPosition,
} from '../utils/lessonReaderSettings';
import {
  thForm,
  thFormLabel,
  thPanel,
  thPanelTitle,
  thSettingsSection,
  thSettingsSectionDanger,
  thSettingsSelect,
  thTabPage,
  thTabPageDesc,
} from '../styles/tw';
import { TEACH_HUB_HOME } from '../utils/routes';

type SettingsPageProps = {
  workspaceId: string;
};

export function SettingsPage({ workspaceId }: SettingsPageProps) {
  const router = useRouter();
  const { settings, setBarPosition } = useLessonReaderSettings();
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const handleDelete = async () => {
    if (!confirm('确定删除此工作区？将从列表中移除，OSS 文件仍保留。')) return;
    setDeleting(true);
    setMessage('');
    try {
      await archiveWorkspaceViaApi(workspaceId);
      router.push(TEACH_HUB_HOME);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '删除失败');
      setDeleting(false);
    }
  };

  return (
    <div className={thTabPage}>
      <section className={cn(thPanel, thSettingsSection)}>
        <h2 className={thPanelTitle}>阅读进度条</h2>
        <p className={thTabPageDesc}>
          在课时阅读页显示阅读百分比与可拖动进度条。滚动正文时进度会自动更新；也可拖动进度条跳转位置。阅读页内可收起/展开进度条。
        </p>
        <div className={`${thForm} max-w-lg`}>
          <label className={thFormLabel}>
            进度条位置
            <select
              className={thSettingsSelect}
              value={settings.barPosition}
              onChange={(e) => setBarPosition(e.target.value as LessonReaderBarPosition)}
            >
              {LESSON_READER_POSITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className={cn(thPanel, thSettingsSection)}>
        <h2 className={thPanelTitle}>导入工作区</h2>
        <p className={thTabPageDesc}>
          上传 teach 工作区 zip（如 musicStudy 打包），自动写入当前工作区。
        </p>
        <div className={`${thForm} max-w-lg`}>
          <input
            type="file"
            accept=".zip,application/zip"
            onChange={(e) => setZipFile(e.target.files?.[0] ?? null)}
          />
          <Button type="primary" onClick={() => void handleImport()} disabled={importing}>
            {importing ? '导入中…' : '上传并导入'}
          </Button>
        </div>
      </section>

      <section className={cn(thPanel, thSettingsSection, thSettingsSectionDanger)}>
        <h2 className={`${thPanelTitle} text-red-700`}>删除工作区</h2>
        <p className={thTabPageDesc}>从列表中移除此工作区，不会删除 OSS 中已上传的文件。</p>
        <Button type="danger-primary" onClick={() => void handleDelete()} disabled={deleting}>
          {deleting ? '删除中…' : '删除此工作区'}
        </Button>
      </section>

      {message ? <p className="text-sm text-[#7a6f5c]">{message}</p> : null}
    </div>
  );
}
