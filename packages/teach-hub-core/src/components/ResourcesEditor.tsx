'use client';

import { useState } from 'react';
import { Button } from 'animal-island-ui';
import {
  thForm,
  thFormInput,
  thFormLabel,
  thListEditor,
  thPanel,
  thPanelTitle,
} from '../styles/tw';
import type { ResourceItem, ResourcesFormData } from '../types';
import { composeResourcesMarkdown, EMPTY_RESOURCE_ITEM } from '../utils/resourcesParser';
import { cn } from '../utils/cn';

type ResourcesEditorProps = {
  initial: ResourcesFormData;
  saving?: boolean;
  onSave: (markdown: string) => Promise<void>;
};

function ResourceItemEditor({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: ResourceItem;
  index: number;
  onChange: (item: ResourceItem) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[10px] border border-[#e8e2d6] bg-[#faf9f7] px-3.5 py-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-[#7a6f5c]">#{index + 1}</span>
        <Button type="text" size="small" onClick={onRemove}>
          删除
        </Button>
      </div>
      <label className={thFormLabel}>
        标题
        <input
          className={thFormInput}
          value={item.title}
          onChange={(e) => onChange({ ...item, title: e.target.value })}
          placeholder="资源名称，如 MDN Web Docs"
        />
      </label>
      <label className={thFormLabel}>
        链接（可选）
        <input
          className={thFormInput}
          value={item.url ?? ''}
          onChange={(e) => onChange({ ...item, url: e.target.value })}
          placeholder="https://..."
        />
      </label>
      <label className={thFormLabel}>
        备注（可选）
        <input
          className={thFormInput}
          value={item.note ?? ''}
          onChange={(e) => onChange({ ...item, note: e.target.value })}
          placeholder="简短说明，帮助回忆为何推荐"
        />
      </label>
    </div>
  );
}

function ResourceSection({
  title,
  description,
  items,
  onChange,
}: {
  title: string;
  description: string;
  items: ResourceItem[];
  onChange: (items: ResourceItem[]) => void;
}) {
  const displayItems = items.length ? items : [{ ...EMPTY_RESOURCE_ITEM }];

  const updateItem = (index: number, item: ResourceItem) => {
    const next = [...displayItems];
    next[index] = item;
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(displayItems.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onChange([...displayItems, { ...EMPTY_RESOURCE_ITEM }]);
  };

  return (
    <section className={cn(thPanel, 'flex flex-col gap-3')}>
      <div>
        <h3 className={thPanelTitle}>{title}</h3>
        <p className="mt-1 text-sm text-[#7a6f5c]">{description}</p>
      </div>
      <div className={thListEditor}>
        {displayItems.map((item, index) => (
          <ResourceItemEditor
            key={`${title}-${index}`}
            item={item}
            index={index}
            onChange={(next) => updateItem(index, next)}
            onRemove={() => removeItem(index)}
          />
        ))}
        <Button type="default" size="small" onClick={addItem}>
          + 添加资源
        </Button>
      </div>
    </section>
  );
}

function normalizeItems(items: ResourceItem[]): ResourceItem[] {
  return items
    .map((item) => ({
      title: item.title.trim(),
      url: item.url?.trim() || undefined,
      note: item.note?.trim() || undefined,
    }))
    .filter((item) => item.title);
}

export function ResourcesEditor({ initial, saving, onSave }: ResourcesEditorProps) {
  const [form, setForm] = useState<ResourcesFormData>(initial);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setMessage('');
    try {
      const normalized: ResourcesFormData = {
        knowledge: normalizeItems(form.knowledge),
        communities: normalizeItems(form.communities),
      };
      const markdown = composeResourcesMarkdown(normalized);
      await onSave(markdown);
      setForm(normalized);
      setMessage('已保存');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '保存失败');
    }
  };

  return (
    <div className={`${thForm} max-w-3xl gap-5`}>
      <ResourceSection
        title="Knowledge"
        description="书籍、文档、课程等高质量学习资源"
        items={form.knowledge}
        onChange={(knowledge) => setForm((f) => ({ ...f, knowledge }))}
      />
      <ResourceSection
        title="Wisdom (Communities)"
        description="相关社区、论坛与交流渠道"
        items={form.communities}
        onChange={(communities) => setForm((f) => ({ ...f, communities }))}
      />
      <div className="flex items-center gap-3">
        <Button type="primary" onClick={() => void handleSave()} disabled={saving}>
          {saving ? '保存中…' : '保存资源'}
        </Button>
        {message ? <span className="text-sm text-[#7a6f5c]">{message}</span> : null}
      </div>
    </div>
  );
}
