'use client';

import { useState } from 'react';
import { Button } from 'animal-island-ui';
import {
  thForm,
  thFormInput,
  thFormLabel,
  thFormTextarea,
  thListEditor,
  thListEditorRow,
} from '../styles/tw';
import type { MissionFormData } from '../types';
import { composeMissionMarkdown } from '../utils/workspaceTemplates';

type MissionEditorProps = {
  initial: MissionFormData;
  saving?: boolean;
  onSave: (markdown: string) => Promise<void>;
};

function ListField({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const update = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const add = () => onChange([...items, '']);
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className={thListEditor}>
      <span className="text-sm font-semibold">{label}</span>
      {items.map((item, index) => (
        <div key={`${label}-${index}`} className={thListEditorRow}>
          <input
            className={`${thFormInput} flex-1`}
            value={item}
            onChange={(e) => update(index, e.target.value)}
            placeholder="输入一条…"
          />
          <Button type="text" size="small" onClick={() => remove(index)}>
            删
          </Button>
        </div>
      ))}
      <Button type="default" size="small" onClick={add}>
        + 添加
      </Button>
    </div>
  );
}

export function MissionEditor({ initial, saving, onSave }: MissionEditorProps) {
  const [form, setForm] = useState<MissionFormData>(initial);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setMessage('');
    try {
      const markdown = composeMissionMarkdown(form);
      await onSave(markdown);
      setMessage('已保存');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '保存失败');
    }
  };

  return (
    <div className={thForm}>
      <label className={thFormLabel}>
        Why — 你为什么想学？
        <textarea
          className={thFormTextarea}
          value={form.why}
          onChange={(e) => setForm((f) => ({ ...f, why: e.target.value }))}
          rows={4}
        />
      </label>

      <ListField
        label="Success looks like"
        items={form.successLooksLike.length ? form.successLooksLike : ['']}
        onChange={(successLooksLike) =>
          setForm((f) => ({ ...f, successLooksLike: successLooksLike.filter(Boolean) }))
        }
      />

      <ListField
        label="Constraints"
        items={form.constraints.length ? form.constraints : ['']}
        onChange={(constraints) => setForm((f) => ({ ...f, constraints }))}
      />

      <ListField
        label="Out of scope"
        items={form.outOfScope.length ? form.outOfScope : ['']}
        onChange={(outOfScope) =>
          setForm((f) => ({ ...f, outOfScope: outOfScope.filter(Boolean) }))
        }
      />

      <div className="flex items-center gap-3">
        <Button type="primary" onClick={() => void handleSave()} disabled={saving}>
          {saving ? '保存中…' : '保存 Mission'}
        </Button>
        {message ? <span className="text-sm text-[#7a6f5c]">{message}</span> : null}
      </div>
    </div>
  );
}
