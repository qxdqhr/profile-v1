'use client';

import { useCallback, useState } from 'react';
import type { ComfyJob, ComfyServer, ServerFormData, SubmitJobFormData } from '../types';

type ApiResult<T> = { success: boolean; data?: T; message?: string };

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const json = (await response.json()) as ApiResult<T>;
  if (!json.success) {
    throw new Error(json.message ?? '请求失败');
  }
  return json.data as T;
}

export function useComfyRemote() {
  const [servers, setServers] = useState<ComfyServer[]>([]);
  const [jobs, setJobs] = useState<ComfyJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshServers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<ComfyServer[]>('/api/comfyPrompt/servers');
      setServers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载服务器失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshJobs = useCallback(async () => {
    try {
      const data = await apiJson<ComfyJob[]>('/api/comfyPrompt/jobs');
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载任务失败');
    }
  }, []);

  const createServer = useCallback(async (data: ServerFormData) => {
    const created = await apiJson<ComfyServer>('/api/comfyPrompt/servers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setServers((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateServer = useCallback(async (id: number, data: Partial<ServerFormData>) => {
    const updated = await apiJson<ComfyServer>(`/api/comfyPrompt/servers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setServers((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  const deleteServer = useCallback(async (id: number) => {
    await apiJson(`/api/comfyPrompt/servers/${id}`, { method: 'DELETE' });
    setServers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const checkServerHealth = useCallback(async (id: number) => {
    const result = await apiJson<{ ok: boolean; error?: string }>(
      `/api/comfyPrompt/servers/${id}/health`,
      { method: 'POST' },
    );
    await refreshServers();
    return result;
  }, [refreshServers]);

  const submitJob = useCallback(async (data: SubmitJobFormData) => {
    const job = await apiJson<ComfyJob>('/api/comfyPrompt/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setJobs((prev) => [job, ...prev]);
    return job;
  }, []);

  const refreshJob = useCallback(async (id: number) => {
    const job = await apiJson<ComfyJob>(`/api/comfyPrompt/jobs/${id}`);
    setJobs((prev) => prev.map((j) => (j.id === id ? job : j)));
    return job;
  }, []);

  const deleteJobOutputs = useCallback(async (jobId: number, indices: number[]) => {
    const job = await apiJson<ComfyJob>(`/api/comfyPrompt/jobs/${jobId}/outputs`, {
      method: 'DELETE',
      body: JSON.stringify({ indices }),
    });
    setJobs((prev) => prev.map((j) => (j.id === jobId ? job : j)));
    return job;
  }, []);

  return {
    servers,
    jobs,
    loading,
    error,
    setError,
    refreshServers,
    refreshJobs,
    createServer,
    updateServer,
    deleteServer,
    checkServerHealth,
    submitJob,
    refreshJob,
    deleteJobOutputs,
  };
}
