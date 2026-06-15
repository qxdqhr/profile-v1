'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Title } from 'animal-island-ui';
import { MissionEditor } from '../components/MissionEditor';
import {
  fetchWorkspaceFileText,
  putWorkspaceFileText,
} from '../services/teachHubClient';
import { parseMissionMarkdown } from '../utils/missionParser';
import type { MissionFormData } from '../types';
import { DEFAULT_MISSION_TEMPLATE } from '../utils/workspaceTemplates';
import { workspacePath } from '../utils/routes';

type MissionPageProps = {
  workspaceId: string;
};

export function MissionPage({ workspaceId }: MissionPageProps) {
  const [initial, setInitial] = useState<MissionFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    void fetchWorkspaceFileText(workspaceId, 'MISSION.md')
      .then((md) => {
        if (mounted) setInitial(parseMissionMarkdown(md));
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : '加载失败');
          setInitial(DEFAULT_MISSION_TEMPLATE);
        }
      });
    return () => {
      mounted = false;
    };
  }, [workspaceId]);

  const handleSave = async (markdown: string) => {
    setSaving(true);
    try {
      await putWorkspaceFileText(workspaceId, 'MISSION.md', markdown);
    } finally {
      setSaving(false);
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
        编辑 Mission
      </Title>
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {initial ? (
        <MissionEditor initial={initial} saving={saving} onSave={handleSave} />
      ) : (
        <p className="text-sm text-[#7a6f5c]">加载中…</p>
      )}
    </div>
  );
}
