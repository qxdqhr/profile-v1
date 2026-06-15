'use client';

import { useEffect, useState } from 'react';
import { Button } from 'animal-island-ui';
import { fetchWorkspaceFileText, putWorkspaceFileText } from '../services/teachHubClient';
import { thForm, thTabPage } from '../styles/tw';
import { DEFAULT_RESOURCES_MD } from '../utils/workspaceTemplates';

type ResourcesPageProps = {
  workspaceId: string;
};

export function ResourcesPage({ workspaceId }: ResourcesPageProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    void fetchWorkspaceFileText(workspaceId, 'RESOURCES.md')
      .then((md) => {
        if (mounted) setContent(md);
      })
      .catch(() => {
        if (mounted) setContent(DEFAULT_RESOURCES_MD);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [workspaceId]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await putWorkspaceFileText(workspaceId, 'RESOURCES.md', content);
      setMessage('已保存');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={thTabPage}>
      {loading ? (
        <p className="text-sm text-[#7a6f5c]">加载中…</p>
      ) : (
        <div className={`${thForm} max-w-3xl`}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="font-mono text-sm"
          />
          <div className="flex items-center gap-3">
            <Button type="primary" onClick={() => void handleSave()} disabled={saving}>
              {saving ? '保存中…' : '保存'}
            </Button>
            {message ? <span className="text-sm text-[#7a6f5c]">{message}</span> : null}
          </div>
        </div>
      )}
    </div>
  );
}
