import type {
  CreateWorkspaceInput,
  TeachGenerateJob,
  TeachLessonProgress,
  TeachStoredFile,
  TeachWorkspace,
  TeachWorkspaceSummary,
  UpdateProgressInput,
  WorkspaceStatus,
} from '../types';

export type GenerateLessonTrigger = 'first_lesson' | 'next_lesson';

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: string };

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiEnvelope<T> | T;
  if (!response.ok) {
    const err =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: string }).error)
        : `请求失败: ${response.status}`;
    throw new Error(err);
  }
  if (payload && typeof payload === 'object' && 'success' in payload) {
    const wrapped = payload as ApiEnvelope<T>;
    if (!wrapped.success) {
      throw new Error(wrapped.error || '请求失败');
    }
    return wrapped.data;
  }
  return payload as T;
}

export async function fetchWorkspaces(filters?: {
  status?: WorkspaceStatus;
}): Promise<TeachWorkspaceSummary[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  const url = params.toString()
    ? `/api/teach-hub/workspaces?${params.toString()}`
    : '/api/teach-hub/workspaces';
  const response = await fetch(url, { cache: 'no-store' });
  const data = await parseJson<{ items: TeachWorkspaceSummary[] }>(response);
  return data.items;
}

export async function createWorkspace(input: CreateWorkspaceInput): Promise<TeachWorkspace> {
  const response = await fetch('/api/teach-hub/workspaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseJson<TeachWorkspace>(response);
}

/** @deprecated 使用 createWorkspace */
export const createWorkspaceViaApi = createWorkspace;

export async function fetchWorkspaceDetail(workspaceId: string): Promise<{
  workspace: TeachWorkspace | null;
  lessons: Array<{ order: number; slug: string; filename: string; title?: string }>;
  progress: TeachLessonProgress[];
}> {
  const response = await fetch(`/api/teach-hub/workspaces/${encodeURIComponent(workspaceId)}`, {
    cache: 'no-store',
  });
  return parseJson(response);
}

export async function updateWorkspace(
  workspaceId: string,
  patch: { title?: string; status?: WorkspaceStatus; missionSummary?: string | null },
): Promise<TeachWorkspace> {
  const response = await fetch(`/api/teach-hub/workspaces/${encodeURIComponent(workspaceId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return parseJson<TeachWorkspace>(response);
}

export async function archiveWorkspace(workspaceId: string): Promise<TeachWorkspace> {
  const response = await fetch(`/api/teach-hub/workspaces/${encodeURIComponent(workspaceId)}`, {
    method: 'DELETE',
  });
  return parseJson<TeachWorkspace>(response);
}

/** @deprecated 使用 archiveWorkspace */
export const archiveWorkspaceViaApi = archiveWorkspace;

export async function fetchWorkspaceFiles(workspaceId: string): Promise<TeachStoredFile[]> {
  const response = await fetch(
    `/api/teach-hub/workspaces/${encodeURIComponent(workspaceId)}/files`,
    { cache: 'no-store' },
  );
  const data = await parseJson<{ files: TeachStoredFile[] }>(response);
  return data.files;
}

export function getWorkspaceFileUrl(workspaceId: string, relativePath: string, raw = false): string {
  const encoded = relativePath
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
  const base = `/api/teach-hub/workspaces/${encodeURIComponent(workspaceId)}/files/${encoded}`;
  return raw ? `${base}?raw=1` : base;
}

export async function fetchWorkspaceFileText(
  workspaceId: string,
  relativePath: string,
  options?: { raw?: boolean },
): Promise<string> {
  const response = await fetch(getWorkspaceFileUrl(workspaceId, relativePath, options?.raw), {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`读取文件失败: ${response.status}`);
  }
  return response.text();
}

export async function putWorkspaceFileText(
  workspaceId: string,
  relativePath: string,
  content: string,
): Promise<void> {
  const encoded = relativePath
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
  const response = await fetch(
    `/api/teach-hub/workspaces/${encodeURIComponent(workspaceId)}/files/${encoded}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    },
  );
  await parseJson(response);
}

export async function importWorkspaceZip(workspaceId: string, file: File): Promise<{
  importedFiles: number;
  skippedFiles: number;
  warnings: string[];
  lessonCount: number;
}> {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(
    `/api/teach-hub/workspaces/${encodeURIComponent(workspaceId)}/import`,
    { method: 'POST', body: form },
  );
  return parseJson(response);
}

export async function fetchLessonProgress(workspaceId: string): Promise<TeachLessonProgress[]> {
  const response = await fetch(
    `/api/teach-hub/workspaces/${encodeURIComponent(workspaceId)}/progress`,
    { cache: 'no-store' },
  );
  const data = await parseJson<{ items: TeachLessonProgress[] }>(response);
  return data.items;
}

export async function updateLessonProgress(
  workspaceId: string,
  input: UpdateProgressInput,
): Promise<TeachLessonProgress> {
  const response = await fetch(
    `/api/teach-hub/workspaces/${encodeURIComponent(workspaceId)}/progress`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );
  return parseJson<TeachLessonProgress>(response);
}

export async function generateLesson(
  workspaceId: string,
  trigger: GenerateLessonTrigger,
): Promise<TeachGenerateJob> {
  const response = await fetch(
    `/api/teach-hub/workspaces/${encodeURIComponent(workspaceId)}/generate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger }),
    },
  );
  return parseJson<TeachGenerateJob>(response);
}

export async function fetchGenerateJobs(workspaceId: string): Promise<TeachGenerateJob[]> {
  const response = await fetch(
    `/api/teach-hub/workspaces/${encodeURIComponent(workspaceId)}/generate`,
    { cache: 'no-store' },
  );
  const data = await parseJson<{ items: TeachGenerateJob[] }>(response);
  return data.items;
}

export async function fetchGenerateJob(
  workspaceId: string,
  jobId: string,
): Promise<TeachGenerateJob> {
  const response = await fetch(
    `/api/teach-hub/workspaces/${encodeURIComponent(workspaceId)}/generate/${encodeURIComponent(jobId)}`,
    { cache: 'no-store' },
  );
  return parseJson<TeachGenerateJob>(response);
}
