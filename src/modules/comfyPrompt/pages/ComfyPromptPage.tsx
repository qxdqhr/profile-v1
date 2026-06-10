'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Download,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tags,
  Trash2,
  Upload,
  Wand2,
  Workflow,
} from 'lucide-react';
import { useComfyPromptData } from '../hooks/useComfyPromptData';
import { buildPromptString, formatPromptSegment, parseTagsInput, tagsToInput } from '../utils/buildPrompt';
import type {
  ComfyPrompt,
  ComfyPromptGroup,
  ComfyPromptSet,
  ComfyWorkflow,
  ComfyRunDraft,
  PromptKind,
} from '../types';
import { COMFY_RUN_DRAFT_KEY } from '../types';

type TabId = 'prompts' | 'groups' | 'sets' | 'workflows' | 'builder';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'prompts', label: '提示词库', icon: <Sparkles size={16} /> },
  { id: 'groups', label: '分组', icon: <Layers size={16} /> },
  { id: 'sets', label: '提示词组', icon: <Tags size={16} /> },
  { id: 'workflows', label: '工作流', icon: <Workflow size={16} /> },
  { id: 'builder', label: '组装台', icon: <Wand2 size={16} /> },
];

function copyText(text: string) {
  void navigator.clipboard.writeText(text);
}

function ComfyPromptPageContent() {
  const router = useRouter();
  const store = useComfyPromptData();
  const [tab, setTab] = useState<TabId>('builder');
  const [kindFilter, setKindFilter] = useState<PromptKind | 'all'>('all');
  const [groupFilter, setGroupFilter] = useState<number | 'all'>('all');
  const [tagFilter, setTagFilter] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([]);
  const [selectedSetIds, setSelectedSetIds] = useState<number[]>([]);
  const [builderKind, setBuilderKind] = useState<PromptKind>('positive');
  const [separator, setSeparator] = useState(', ');
  const [wrapWeight, setWrapWeight] = useState(true);

  useEffect(() => {
    void store.refreshAll();
  }, [store.refreshAll]);

  const filteredPrompts = useMemo(
    () =>
      store.filterPrompts(
        kindFilter === 'all' ? undefined : kindFilter,
        groupFilter === 'all' ? undefined : groupFilter,
        tagFilter || undefined,
        search || undefined,
      ),
    [store, kindFilter, groupFilter, tagFilter, search],
  );

  const builderPrompts = useMemo(() => {
    const fromPrompts = store.prompts.filter(
      (p) => selectedPromptIds.includes(p.id) && p.kind === builderKind,
    );
    const fromSets: ComfyPrompt[] = [];
    for (const setId of selectedSetIds) {
      const set = store.sets.find((s) => s.id === setId && s.kind === builderKind);
      if (!set?.items) continue;
      for (const item of set.items) {
        if (item.enabled && item.prompt && item.prompt.kind === builderKind) {
          fromSets.push({
            ...item.prompt,
            content: `${item.customPrefix ?? ''}${item.prompt.content}${item.customSuffix ?? ''}`.trim(),
          });
        }
      }
    }
    const map = new Map<number, ComfyPrompt>();
    [...fromSets, ...fromPrompts].forEach((p) => map.set(p.id, p));
    return [...map.values()];
  }, [store.prompts, store.sets, selectedPromptIds, selectedSetIds, builderKind]);

  const builtPrompt = useMemo(
    () => buildPromptString(builderPrompts, { separator, wrapWeight }),
    [builderPrompts, separator, wrapWeight],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const togglePromptSelection = (id: number) => {
    setSelectedPromptIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSetSelection = (id: number) => {
    setSelectedSetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const sendToRemoteRun = () => {
    const draft: ComfyRunDraft = {};
    try {
      const existing = sessionStorage.getItem(COMFY_RUN_DRAFT_KEY);
      if (existing) Object.assign(draft, JSON.parse(existing) as ComfyRunDraft);
    } catch {
      // ignore
    }
    if (builderKind === 'positive') draft.positivePrompt = builtPrompt;
    else draft.negativePrompt = builtPrompt;
    sessionStorage.setItem(COMFY_RUN_DRAFT_KEY, JSON.stringify(draft));
    router.push('/testField/comfyPrompt/run');
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <nav className="flex gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                tab === t.id
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => void store.refreshAll()}
          className="shrink-0 rounded-lg border border-white/10 p-2 hover:bg-white/5"
          title="刷新"
        >
          <RefreshCw size={16} className={store.loading ? 'animate-spin' : ''} />
        </button>
      </div>
        {store.error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
            {store.error}
          </div>
        )}

        {tab === 'builder' && (
          <BuilderPanel
            builderKind={builderKind}
            setBuilderKind={setBuilderKind}
            separator={separator}
            setSeparator={setSeparator}
            wrapWeight={wrapWeight}
            setWrapWeight={setWrapWeight}
            builtPrompt={builtPrompt}
            prompts={store.prompts.filter((p) => p.kind === builderKind)}
            sets={store.sets.filter((s) => s.kind === builderKind)}
            selectedPromptIds={selectedPromptIds}
            selectedSetIds={selectedSetIds}
            onTogglePrompt={togglePromptSelection}
            onToggleSet={toggleSetSelection}
            onCopy={() => {
              copyText(builtPrompt);
              showToast('已复制到剪贴板');
            }}
            onSendToRun={sendToRemoteRun}
          />
        )}

        {tab === 'prompts' && (
          <PromptsPanel
            groups={store.groups}
            prompts={filteredPrompts}
            allTags={store.allTags()}
            kindFilter={kindFilter}
            setKindFilter={setKindFilter}
            groupFilter={groupFilter}
            setGroupFilter={setGroupFilter}
            tagFilter={tagFilter}
            setTagFilter={setTagFilter}
            search={search}
            setSearch={setSearch}
            onCreate={async (data) => {
              await store.createPrompt(data);
              showToast('提示词已创建');
            }}
            onUpdate={async (id, data) => {
              await store.updatePrompt(id, data);
              showToast('提示词已更新');
            }}
            onDelete={async (id) => {
              await store.deletePrompt(id);
              showToast('提示词已删除');
            }}
          />
        )}

        {tab === 'groups' && (
          <GroupsPanel
            groups={store.groups}
            onCreate={async (data) => {
              await store.createGroup(data);
              showToast('分组已创建');
            }}
            onUpdate={async (id, data) => {
              await store.updateGroup(id, data);
              showToast('分组已更新');
            }}
            onDelete={async (id) => {
              await store.deleteGroup(id);
              showToast('分组已删除');
            }}
          />
        )}

        {tab === 'sets' && (
          <SetsPanel
            sets={store.sets}
            prompts={store.prompts}
            onCreate={async (data) => {
              await store.createSet(data);
              showToast('提示词组已创建');
            }}
            onUpdate={async (id, data) => {
              await store.updateSet(id, data);
              showToast('提示词组已更新');
            }}
            onDelete={async (id) => {
              await store.deleteSet(id);
              showToast('提示词组已删除');
            }}
            onPreview={(set) => {
              const items = (set.items ?? [])
                .filter((i) => i.enabled && i.prompt)
                .map((i) => ({
                  ...i.prompt!,
                  content: `${i.customPrefix ?? ''}${i.prompt!.content}${i.customSuffix ?? ''}`.trim(),
                }));
              copyText(buildPromptString(items, { separator: set.separator, wrapWeight: true }));
              showToast('提示词组预览已复制');
            }}
          />
        )}

        {tab === 'workflows' && (
          <WorkflowsPanel
            workflows={store.workflows}
            onCreate={async (data) => {
              await store.createWorkflow(data);
              showToast('工作流已保存');
            }}
            onUpdate={async (id, data) => {
              await store.updateWorkflow(id, data);
              showToast('工作流已更新');
            }}
            onDelete={async (id) => {
              await store.deleteWorkflow(id);
              showToast('工作流已删除');
            }}
          />
        )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-violet-600 px-4 py-2 text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function BuilderPanel(props: {
  builderKind: PromptKind;
  setBuilderKind: (k: PromptKind) => void;
  separator: string;
  setSeparator: (s: string) => void;
  wrapWeight: boolean;
  setWrapWeight: (v: boolean) => void;
  builtPrompt: string;
  prompts: ComfyPrompt[];
  sets: ComfyPromptSet[];
  selectedPromptIds: number[];
  selectedSetIds: number[];
  onTogglePrompt: (id: number) => void;
  onToggleSet: (id: number) => void;
  onCopy: () => void;
  onSendToRun: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(['positive', 'negative'] as PromptKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => props.setBuilderKind(k)}
              className={`rounded-full px-4 py-2 text-sm ${
                props.builderKind === k ? 'bg-emerald-500 text-white' : 'bg-white/5'
              }`}
            >
              {k === 'positive' ? '正向 Prompt' : '负向 Prompt'}
            </button>
          ))}
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 font-medium">选择提示词组</h3>
          <div className="flex flex-wrap gap-2">
            {props.sets.map((set) => (
              <button
                key={set.id}
                type="button"
                onClick={() => props.onToggleSet(set.id)}
                className={`rounded-xl px-3 py-2 text-sm ${
                  props.selectedSetIds.includes(set.id)
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-800/80 hover:bg-slate-700'
                }`}
              >
                {set.name}
              </button>
            ))}
            {!props.sets.length && <span className="text-sm text-slate-500">暂无提示词组</span>}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 font-medium">选择单条提示词</h3>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {props.prompts.map((p) => (
              <label
                key={p.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
                  props.selectedPromptIds.includes(p.id)
                    ? 'border-violet-400 bg-violet-500/10'
                    : 'border-white/5 bg-slate-900/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={props.selectedPromptIds.includes(p.id)}
                  onChange={() => props.onTogglePrompt(p.id)}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{p.title}</div>
                  <div className="truncate text-sm text-slate-400">{p.content}</div>
                </div>
              </label>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
        <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">ComfyUI 输出</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={props.onSendToRun}
                disabled={!props.builtPrompt}
                className="flex items-center gap-1 rounded-lg border border-violet-400/40 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                前往远程运行
              </button>
              <button
                type="button"
                onClick={props.onCopy}
                disabled={!props.builtPrompt}
                className="flex items-center gap-1 rounded-lg bg-violet-500 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                <Copy size={14} /> 复制
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={props.builtPrompt}
            rows={12}
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 p-3 text-sm leading-relaxed text-slate-200"
            placeholder="选择提示词或提示词组后在此生成..."
          />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm space-y-3">
          <label className="block">
            <span className="text-slate-400">分隔符</span>
            <input
              value={props.separator}
              onChange={(e) => props.setSeparator(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={props.wrapWeight}
              onChange={(e) => props.setWrapWeight(e.target.checked)}
            />
            启用权重语法 (content:1.2)
          </label>
        </div>
      </aside>
    </div>
  );
}

function PromptsPanel(props: {
  groups: ComfyPromptGroup[];
  prompts: ComfyPrompt[];
  allTags: string[];
  kindFilter: PromptKind | 'all';
  setKindFilter: (v: PromptKind | 'all') => void;
  groupFilter: number | 'all';
  setGroupFilter: (v: number | 'all') => void;
  tagFilter: string;
  setTagFilter: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  onCreate: (data: import('../types').PromptFormData) => Promise<void>;
  onUpdate: (id: number, data: Partial<import('../types').PromptFormData>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ComfyPrompt | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [kind, setKind] = useState<PromptKind>('positive');
  const [groupId, setGroupId] = useState<number | ''>('');
  const [tagsInput, setTagsInput] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setEditing(null);
    setTitle('');
    setContent('');
    setKind('positive');
    setGroupId('');
    setTagsInput('');
    setWeight('');
    setNotes('');
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (p: ComfyPrompt) => {
    setEditing(p);
    setTitle(p.title);
    setContent(p.content);
    setKind(p.kind);
    setGroupId(p.groupId ?? '');
    setTagsInput(tagsToInput(p.tags));
    setWeight(p.weight ?? '');
    setNotes(p.notes ?? '');
    setFormOpen(true);
  };

  const submit = async () => {
    const payload = {
      title,
      content,
      kind,
      groupId: groupId === '' ? null : Number(groupId),
      tags: parseTagsInput(tagsInput),
      weight: weight ? Number(weight) : null,
      notes,
    };
    if (editing) await props.onUpdate(editing.id, payload);
    else await props.onCreate(payload);
    setFormOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          <input
            value={props.search}
            onChange={(e) => props.setSearch(e.target.value)}
            placeholder="搜索标题或内容..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3"
          />
        </div>
        <select
          value={props.kindFilter}
          onChange={(e) => props.setKindFilter(e.target.value as PromptKind | 'all')}
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
        >
          <option value="all">全部类型</option>
          <option value="positive">正向</option>
          <option value="negative">负向</option>
        </select>
        <select
          value={props.groupFilter}
          onChange={(e) =>
            props.setGroupFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
          }
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
        >
          <option value="all">全部分组</option>
          {props.groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <select
          value={props.tagFilter}
          onChange={(e) => props.setTagFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
        >
          <option value="">全部 Tag</option>
          {props.allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm"
        >
          <Plus size={16} /> 新建提示词
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {props.prompts.map((p) => (
          <article key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium">{p.title}</h3>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{p.kind}</span>
                  {(p.tags ?? []).map((t) => (
                    <span key={t} className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-200">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => openEdit(p)} className="rounded-lg px-2 py-1 text-xs bg-white/10">
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => {
                    copyText(formatPromptSegment(p, true));
                  }}
                  className="rounded-lg px-2 py-1 text-xs bg-white/10"
                >
                  复制
                </button>
                <button
                  type="button"
                  onClick={() => void props.onDelete(p.id)}
                  className="rounded-lg px-2 py-1 text-xs bg-red-500/20 text-red-200"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{p.content}</p>
          </article>
        ))}
      </div>

      {formOpen && (
        <Modal title={editing ? '编辑提示词' : '新建提示词'} onClose={() => setFormOpen(false)}>
          <FormField label="标题">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="内容">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className={inputClass} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="类型">
              <select value={kind} onChange={(e) => setKind(e.target.value as PromptKind)} className={inputClass}>
                <option value="positive">正向</option>
                <option value="negative">负向</option>
              </select>
            </FormField>
            <FormField label="分组">
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value ? Number(e.target.value) : '')}
                className={inputClass}
              >
                <option value="">无</option>
                {props.groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Tags（逗号分隔）">
            <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="权重（可选，如 1.2）">
            <input value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="备注">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
          </FormField>
          <button type="button" onClick={() => void submit()} className="mt-2 w-full rounded-xl bg-violet-500 py-2">
            保存
          </button>
        </Modal>
      )}
    </div>
  );
}

function GroupsPanel(props: {
  groups: ComfyPromptGroup[];
  onCreate: (data: import('../types').PromptGroupFormData) => Promise<void>;
  onUpdate: (id: number, data: Partial<import('../types').PromptGroupFormData>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState<PromptKind>('positive');
  const [description, setDescription] = useState('');

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <h3 className="font-medium">新建分组</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="分组名称" className={inputClass} />
        <select value={kind} onChange={(e) => setKind(e.target.value as PromptKind)} className={inputClass}>
          <option value="positive">正向</option>
          <option value="negative">负向</option>
        </select>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="描述"
          rows={3}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() =>
            void props.onCreate({ name, kind, description }).then(() => {
              setName('');
              setDescription('');
            })
          }
          className="w-full rounded-xl bg-violet-500 py-2"
        >
          创建分组
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {props.groups.map((g) => (
          <div key={g.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{g.name}</h3>
              <button type="button" onClick={() => void props.onDelete(g.id)} className="text-red-300">
                <Trash2 size={16} />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-400">{g.description || '无描述'}</p>
            <span className="mt-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs">{g.kind}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SetsPanel(props: {
  sets: ComfyPromptSet[];
  prompts: ComfyPrompt[];
  onCreate: (data: import('../types').PromptSetFormData) => Promise<void>;
  onUpdate: (id: number, data: Partial<import('../types').PromptSetFormData>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onPreview: (set: ComfyPromptSet) => void;
}) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState<PromptKind>('positive');
  const [separator, setSeparator] = useState(', ');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleId = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <h3 className="font-medium">新建提示词组</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="组名称" className={inputClass} />
          <select value={kind} onChange={(e) => setKind(e.target.value as PromptKind)} className={inputClass}>
            <option value="positive">正向</option>
            <option value="negative">负向</option>
          </select>
          <input value={separator} onChange={(e) => setSeparator(e.target.value)} placeholder="分隔符" className={inputClass} />
        </div>
        <div className="max-h-40 overflow-y-auto flex flex-wrap gap-2">
          {props.prompts
            .filter((p) => p.kind === kind)
            .map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleId(p.id)}
                className={`rounded-lg px-3 py-1 text-sm ${
                  selectedIds.includes(p.id) ? 'bg-violet-500' : 'bg-slate-800'
                }`}
              >
                {p.title}
              </button>
            ))}
        </div>
        <button
          type="button"
          onClick={() =>
            void props.onCreate({ name, kind, separator, promptIds: selectedIds }).then(() => {
              setName('');
              setSelectedIds([]);
            })
          }
          className="rounded-xl bg-violet-500 px-4 py-2 text-sm"
        >
          保存提示词组
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {props.sets.map((set) => (
          <div key={set.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{set.name}</h3>
              <div className="flex gap-2">
                <button type="button" onClick={() => props.onPreview(set)} className="text-xs bg-white/10 px-2 py-1 rounded">
                  复制组合
                </button>
                <button type="button" onClick={() => void props.onDelete(set.id)} className="text-red-300">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {(set.items ?? []).map((i) => i.prompt?.title).filter(Boolean).join(' · ') || '空组'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkflowsPanel(props: {
  workflows: ComfyWorkflow[];
  onCreate: (data: import('../types').WorkflowFormData) => Promise<void>;
  onUpdate: (id: number, data: Partial<import('../types').WorkflowFormData>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [positiveNodeId, setPositiveNodeId] = useState('');
  const [negativeNodeId, setNegativeNodeId] = useState('');
  const [seedNodeId, setSeedNodeId] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const importFile = async (file: File) => {
    const text = await file.text();
    setJsonText(text);
    if (!name) setName(file.name.replace(/\.json$/i, ''));
  };

  const save = async () => {
    const workflowJson = JSON.parse(jsonText) as Record<string, unknown>;
    const payload = {
      name,
      workflowJson,
      tags: parseTagsInput(tagsInput),
      positiveNodeId: positiveNodeId.trim() || null,
      negativeNodeId: negativeNodeId.trim() || null,
      seedNodeId: seedNodeId.trim() || null,
    };
    if (editingId) {
      await props.onUpdate(editingId, payload);
      setEditingId(null);
    } else {
      await props.onCreate(payload);
    }
    setName('');
    setJsonText('');
    setTagsInput('');
    setPositiveNodeId('');
    setNegativeNodeId('');
    setSeedNodeId('');
  };

  const startEdit = (workflow: ComfyWorkflow) => {
    setEditingId(workflow.id);
    setName(workflow.name);
    setJsonText(JSON.stringify(workflow.workflowJson, null, 2));
    setTagsInput(tagsToInput(workflow.tags));
    setPositiveNodeId(workflow.positiveNodeId ?? '');
    setNegativeNodeId(workflow.negativeNodeId ?? '');
    setSeedNodeId(workflow.seedNodeId ?? '');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-2 text-sm hover:bg-white/5">
            <Upload size={16} /> 导入 ComfyUI JSON
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importFile(f);
              }}
            />
          </label>
        </div>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={18}
          placeholder="粘贴 ComfyUI 工作流 JSON..."
          className={`${inputClass} font-mono text-xs`}
        />
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="工作流名称" className={inputClass} />
          <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Tags" className={inputClass} />
          <input
            value={positiveNodeId}
            onChange={(e) => setPositiveNodeId(e.target.value)}
            placeholder="正向 CLIP 节点 ID，如 6"
            className={inputClass}
          />
          <input
            value={negativeNodeId}
            onChange={(e) => setNegativeNodeId(e.target.value)}
            placeholder="负向 CLIP 节点 ID，如 7"
            className={inputClass}
          />
          <input
            value={seedNodeId}
            onChange={(e) => setSeedNodeId(e.target.value)}
            placeholder="Seed 节点 ID（可选）"
            className={inputClass}
          />
          <button type="button" onClick={() => void save()} className="w-full rounded-xl bg-violet-500 py-2">
            {editingId ? '更新工作流' : '保存工作流'}
          </button>
        </div>
        <div className="space-y-2">
          {props.workflows.map((w) => (
            <div key={w.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium truncate">{w.name}</div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      copyText(JSON.stringify(w.workflowJson, null, 2));
                    }}
                    className="rounded bg-white/10 p-1"
                    title="复制 JSON"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(w.workflowJson, null, 2)], {
                        type: 'application/json',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${w.name}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="rounded bg-white/10 p-1"
                    title="下载 JSON"
                  >
                    <Download size={14} />
                  </button>
                  <button type="button" onClick={() => void props.onDelete(w.id)} className="rounded bg-red-500/20 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                节点 {w.positiveNodeId ?? '-'} / {w.negativeNodeId ?? '-'} ·{' '}
                {new Date(w.updatedAt).toLocaleString()}
              </div>
              <button
                type="button"
                onClick={() => startEdit(w)}
                className="mt-2 text-xs text-violet-300 hover:text-violet-200"
              >
                编辑映射
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-violet-400';

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            关闭
          </button>
        </div>
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
}

export default function ComfyPromptPage() {
  return <ComfyPromptPageContent />;
}

export { ComfyPromptPageContent as PromptManagePage };
