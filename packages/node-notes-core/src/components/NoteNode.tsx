'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeNoteNode } from '../types';

export type NoteNodeData = {
  node: NodeNoteNode;
  selected: boolean;
};

function NoteNodeComponent({ data }: NodeProps & { data: NoteNodeData }) {
  const { node, selected } = data;
  const preview = node.contentMd.trim().slice(0, 120);

  return (
    <div
      className={`rounded-xl border-2 bg-white shadow-sm transition-shadow duration-200 ${
        selected ? 'border-[var(--nn-node-selected)] shadow-md' : 'border-[var(--nn-node-border)]'
      }`}
      style={{ width: node.width, minHeight: node.height }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-[var(--nn-accent)] !bg-white"
        aria-label="连入"
      />
      <div className="border-b border-slate-100 px-3 py-2">
        <h3 className="truncate text-sm font-semibold text-slate-900">{node.title}</h3>
      </div>
      <div className="px-3 py-2 text-xs leading-relaxed text-slate-600">
        {preview || <span className="text-slate-400">空节点，点击编辑</span>}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-[var(--nn-primary)] !bg-white"
        aria-label="连出"
      />
    </div>
  );
}

export const NoteNode = memo(NoteNodeComponent);
