'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Server,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useComfyPromptData } from '../hooks/useComfyPromptData';
import { useComfyRemote } from '../hooks/useComfyRemote';
import type { ComfyJob, ComfyJobStatus } from '../types';
import { COMFY_RUN_DRAFT_KEY, type ComfyRunDraft } from '../types';

const POLL_INTERVAL_MS = 3000;

const STATUS_LABEL: Record<ComfyJobStatus, string> = {
  pending: '等待中',
  queued: '排队中',
  running: '执行中',
  success: '已完成',
  failed: '失败',
  cancelled: '已取消',
};

function isActiveJob(status: ComfyJobStatus) {
  return status === 'pending' || status === 'queued' || status === 'running';
}

export default function RemoteRunPage() {
  const promptStore = useComfyPromptData();
  const remote = useComfyRemote();

  const [serverName, setServerName] = useState('');
  const [serverUrl, setServerUrl] = useState('http://127.0.0.1:8188');
  const [selectedServerId, setSelectedServerId] = useState<number | ''>('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | ''>('');
  const [positivePrompt, setPositivePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [seed, setSeed] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    void promptStore.refreshAll();
    void remote.refreshServers();
    void remote.refreshJobs();
  }, [promptStore.refreshAll, remote.refreshServers, remote.refreshJobs]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(COMFY_RUN_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as ComfyRunDraft;
      if (draft.positivePrompt) setPositivePrompt(draft.positivePrompt);
      if (draft.negativePrompt) setNegativePrompt(draft.negativePrompt);
      if (draft.workflowId) setSelectedWorkflowId(draft.workflowId);
      sessionStorage.removeItem(COMFY_RUN_DRAFT_KEY);
    } catch {
      // ignore invalid draft
    }
  }, []);

  useEffect(() => {
    if (selectedServerId) return;
    const defaultServer = remote.servers.find((s) => s.isDefault && s.enabled);
    const first = remote.servers.find((s) => s.enabled);
    const pick = defaultServer ?? first;
    if (pick) setSelectedServerId(pick.id);
  }, [remote.servers, selectedServerId]);

  const activeJobIds = useMemo(
    () => remote.jobs.filter((j) => isActiveJob(j.status)).map((j) => j.id),
    [remote.jobs],
  );

  const pollActiveJobs = useCallback(async () => {
    if (!activeJobIds.length) return;
    await Promise.all(activeJobIds.map((id) => remote.refreshJob(id)));
  }, [activeJobIds, remote.refreshJob]);

  useEffect(() => {
    if (!activeJobIds.length) return;
    const timer = setInterval(() => {
      void pollActiveJobs();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activeJobIds.length, pollActiveJobs]);

  const handleCreateServer = async () => {
    if (!serverName.trim() || !serverUrl.trim()) {
      showToast('请填写服务器名称与地址');
      return;
    }
    try {
      const created = await remote.createServer({
        name: serverName.trim(),
        baseUrl: serverUrl.trim(),
        isDefault: remote.servers.length === 0,
      });
      setSelectedServerId(created.id);
      setServerName('');
      showToast('服务器已添加');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '添加失败');
    }
  };

  const handleSubmit = async () => {
    if (!selectedServerId || !selectedWorkflowId) {
      showToast('请选择服务器与工作流');
      return;
    }
    setSubmitting(true);
    try {
      await remote.submitJob({
        serverId: Number(selectedServerId),
        workflowId: Number(selectedWorkflowId),
        positivePrompt: positivePrompt.trim() || undefined,
        negativePrompt: negativePrompt.trim() || undefined,
        seed: seed.trim() ? Number(seed) : undefined,
      });
      showToast('任务已提交');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '提交失败');
      await remote.refreshJobs();
    } finally {
      setSubmitting(false);
    }
  };

  const selectedWorkflow = promptStore.workflows.find((w) => w.id === selectedWorkflowId);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-violet-600 px-4 py-2 text-sm shadow-lg">
          {toast}
        </div>
      )}

      {(remote.error || promptStore.error) && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
          {remote.error ?? promptStore.error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Server size={18} /> ComfyUI 服务器
            </h2>
            <div className="space-y-2">
              {remote.servers.map((server) => (
                <label
                  key={server.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
                    selectedServerId === server.id
                      ? 'border-violet-400 bg-violet-500/10'
                      : 'border-white/10 bg-slate-900/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="server"
                    checked={selectedServerId === server.id}
                    onChange={() => setSelectedServerId(server.id)}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{server.name}</div>
                    <div className="truncate text-xs text-slate-400">{server.baseUrl}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      {server.lastCheckOk === true && (
                        <span className="text-emerald-400">连通正常</span>
                      )}
                      {server.lastCheckOk === false && (
                        <span className="text-red-400">{server.lastError ?? '不可用'}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => void remote.checkServerHealth(server.id)}
                      className="rounded bg-white/10 p-1"
                      title="检测连通性"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void remote.deleteServer(server.id)}
                      className="rounded bg-red-500/20 p-1"
                      title="删除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </label>
              ))}
              {!remote.servers.length && (
                <p className="text-sm text-slate-500">尚未配置 ComfyUI 服务器</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <h3 className="font-medium">添加服务器</h3>
            <input
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="名称，如 本机 Comfy"
              className={inputClass}
            />
            <input
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://127.0.0.1:8188"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => void handleCreateServer()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2 text-sm hover:bg-white/15"
            >
              <Plus size={16} /> 添加
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
            <h2 className="font-semibold">提交任务</h2>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-400">工作流</span>
              <select
                value={selectedWorkflowId}
                onChange={(e) =>
                  setSelectedWorkflowId(e.target.value ? Number(e.target.value) : '')
                }
                className={inputClass}
              >
                <option value="">选择已保存的工作流</option>
                {promptStore.workflows.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedWorkflow && (
              <p className="text-xs text-slate-500">
                正向节点: {selectedWorkflow.positiveNodeId ?? '未配置'} · 负向节点:{' '}
                {selectedWorkflow.negativeNodeId ?? '未配置'}
              </p>
            )}

            <label className="block text-sm">
              <span className="mb-1 block text-slate-400">正向 Prompt</span>
              <textarea
                value={positivePrompt}
                onChange={(e) => setPositivePrompt(e.target.value)}
                rows={4}
                className={inputClass}
                placeholder="1girl, masterpiece..."
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-400">负向 Prompt</span>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="low quality, blurry..."
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-400">Seed（可选）</span>
              <input
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                type="number"
                className={inputClass}
                placeholder="留空则使用工作流默认值"
              />
            </label>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmit()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 py-3 font-medium disabled:opacity-50"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
              提交到 ComfyUI
            </button>
            <p className="text-xs text-slate-500">
              v1 通过 HTTP 每 {POLL_INTERVAL_MS / 1000}s 轮询任务状态；实时进度见 v1.1 WebSocket。
            </p>
          </div>

          <JobHistoryPanel
            jobs={remote.jobs}
            onRefresh={() => void remote.refreshJobs()}
            loading={remote.loading}
          />
        </section>
      </div>
    </div>
  );
}

function JobHistoryPanel(props: {
  jobs: ComfyJob[];
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">任务历史</h2>
        <button
          type="button"
          onClick={props.onRefresh}
          className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"
        >
          <RefreshCw size={14} className={props.loading ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>
      <div className="space-y-4">
        {props.jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
        {!props.jobs.length && (
          <p className="text-sm text-slate-500">暂无任务记录，提交后将在此显示结果。</p>
        )}
      </div>
    </div>
  );
}

function JobCard({ job }: { job: ComfyJob }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <StatusIcon status={job.status} />
          <span>#{job.id}</span>
          <span className="text-slate-400">{STATUS_LABEL[job.status]}</span>
        </div>
        <span className="text-xs text-slate-500">{new Date(job.createdAt).toLocaleString()}</span>
      </div>
      {job.errorMessage && (
        <p className="mt-2 text-sm text-red-300">{job.errorMessage}</p>
      )}
      {job.outputImages.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {job.outputImages.map((_, index) => (
            <a
              key={`${job.id}-${index}`}
              href={`/api/comfyPrompt/jobs/${job.id}/output/${index}`}
              target="_blank"
              rel="noreferrer"
              className="overflow-hidden rounded-lg border border-white/10 bg-black/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/comfyPrompt/jobs/${job.id}/output/${index}`}
                alt={`输出 ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: ComfyJobStatus }) {
  if (status === 'success') return <CheckCircle2 size={16} className="text-emerald-400" />;
  if (status === 'failed') return <XCircle size={16} className="text-red-400" />;
  if (isActiveJob(status)) return <Loader2 size={16} className="animate-spin text-violet-400" />;
  return null;
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-violet-400';
