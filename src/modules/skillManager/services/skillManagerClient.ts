import type { SkillDetail, SkillListResponse, SkillSource, SkillStatus } from '../types';
import { universalFileClient } from 'sa2kit/universalFile';

export type ConflictPolicy = 'skip' | 'overwrite';

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `请求失败: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchSkillList(filters?: {
  query?: string;
  source?: SkillSource | 'all';
  status?: SkillStatus | 'all';
}): Promise<SkillListResponse> {
  const params = new URLSearchParams();
  if (filters?.query?.trim()) {
    params.set('q', filters.query.trim());
  }
  if (filters?.source && filters.source !== 'all') {
    params.set('source', filters.source);
  }
  if (filters?.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }

  const url = params.toString() ? `/api/skill-manager/skills?${params.toString()}` : '/api/skill-manager/skills';
  const response = await fetch(url, { cache: 'no-store' });
  return parseJson<SkillListResponse>(response);
}

export async function fetchSkillDetail(id: string): Promise<SkillDetail> {
  const response = await fetch(`/api/skill-manager/skills/${encodeURIComponent(id)}`, {
    cache: 'no-store'
  });
  return parseJson<SkillDetail>(response);
}

export async function saveSkillContent(
  id: string,
  content: string,
  options?: { status?: SkillStatus; source?: SkillSource }
): Promise<{ ok: boolean; updatedAt: string; status: SkillStatus; source: SkillSource }> {
  const response = await fetch(`/api/skill-manager/skills/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content, ...options })
  });

  return parseJson<{ ok: boolean; updatedAt: string; status: SkillStatus; source: SkillSource }>(response);
}

export async function uploadSkillMarkdown(
  skillId: string,
  file: File,
  policy: ConflictPolicy
): Promise<{ ok: boolean; id: string; skipped?: boolean; fileId: string; accessUrl?: string }> {
  void policy;
  const meta = await universalFileClient.uploadFile({
    file,
    moduleId: 'skill-manager',
    businessId: skillId,
    folderPath: `skill-manager/${skillId}/SKILL.md`,
    permission: 'private'
  });

  return {
    ok: true,
    id: skillId,
    skipped: false,
    fileId: meta.id,
    accessUrl: (meta as { accessUrl?: string; cdnUrl?: string }).accessUrl || (meta as { cdnUrl?: string }).cdnUrl
  };
}

export async function importSkillDirectory(
  files: File[],
  policy: ConflictPolicy
): Promise<{
  ok: boolean;
  importedFiles: number;
  skippedFiles: number;
  details: Array<{ path: string; status: 'imported' | 'skipped'; reason?: string; fileId?: string; accessUrl?: string }>;
}> {
  void policy;
  const details: Array<{ path: string; status: 'imported' | 'skipped'; reason?: string; fileId?: string; accessUrl?: string }> = [];

  for (const file of files) {
    const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
    const normalized = rel.replaceAll('\\', '/');
    const parts = normalized.split('/').filter(Boolean);
    if (parts.length < 2) {
      details.push({ path: normalized, status: 'skipped', reason: '路径层级不足' });
      continue;
    }
    const skillId = parts[0];
    try {
      const meta = await universalFileClient.uploadFile({
        file,
        moduleId: 'skill-manager',
        businessId: skillId,
        folderPath: `skill-manager/${skillId}/${parts.slice(1).join('/')}`,
        permission: 'private'
      });
      details.push({
        path: normalized,
        status: 'imported',
        fileId: meta.id,
        accessUrl: (meta as { accessUrl?: string; cdnUrl?: string }).accessUrl || (meta as { cdnUrl?: string }).cdnUrl
      });
    } catch (error) {
      details.push({
        path: normalized,
        status: 'skipped',
        reason: error instanceof Error ? error.message : '上传失败'
      });
    }
  }

  const importedFiles = details.filter((x) => x.status === 'imported').length;
  const skippedFiles = details.length - importedFiles;
  return { ok: true, importedFiles, skippedFiles, details };
}

export function getSkillDownloadUrl(id: string): string {
  return `/api/skill-manager/skills/${encodeURIComponent(id)}/download`;
}

export async function downloadBatchSkills(ids: string[]): Promise<Blob> {
  const response = await fetch('/api/skill-manager/skills/download-batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ids })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `请求失败: ${response.status}`);
  }

  return response.blob();
}


export async function preflightBatchDownload(ids: string[]): Promise<{ ok: boolean; exists: string[]; missing: string[]; invalid: string[] }> {
  const response = await fetch('/api/skill-manager/skills/download-batch/preflight', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ids })
  });

  return parseJson<{ ok: boolean; exists: string[]; missing: string[]; invalid: string[] }>(response);
}
