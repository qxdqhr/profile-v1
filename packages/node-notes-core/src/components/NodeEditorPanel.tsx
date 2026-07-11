'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import type { NodeLinkItem, NodeNoteNode } from '../types';
import { nodeNotesApi } from '../services/nodeNotesApi';

interface NodeEditorPanelProps {
  node: NodeNoteNode;
  onChange: (patch: Partial<Pick<NodeNoteNode, 'title' | 'contentMd'>>) => void;
  onFocusNode: (nodeId: string) => void;
}

export function NodeEditorPanel({ node, onChange, onFocusNode }: NodeEditorPanelProps) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [incoming, setIncoming] = useState<NodeLinkItem[]>([]);
  const [outgoing, setOutgoing] = useState<NodeLinkItem[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLinksLoading(true);
    nodeNotesApi
      .getNodeLinks(node.id)
      .then((links) => {
        if (!cancelled) {
          setIncoming(links.incoming);
          setOutgoing(links.outgoing);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIncoming([]);
          setOutgoing([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLinksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [node.id]);

  return (
    <aside className="flex h-full w-full flex-col border-l border-[var(--nn-shell-border)] bg-[var(--nn-shell-surface)] text-[var(--nn-shell-text)] lg:w-80">
      <div className="border-b border-[var(--nn-shell-border)] px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--nn-shell-muted)]">
          节点编辑
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <label htmlFor="node-title" className="mb-1 block text-sm font-medium">
            标题
          </label>
          <input
            id="node-title"
            value={node.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="min-h-11 w-full rounded-lg border border-[var(--nn-shell-border)] bg-[var(--nn-shell-bg)] px-3 text-sm text-[var(--nn-shell-text)]"
          />
        </div>

        <div>
          <div className="mb-2 flex gap-2">
            <button
              type="button"
              onClick={() => setTab('edit')}
              className={`min-h-11 flex-1 rounded-lg px-3 text-sm font-medium transition-colors duration-200 ${
                tab === 'edit'
                  ? 'bg-[var(--nn-primary)] text-white'
                  : 'bg-[var(--nn-shell-bg)] text-[var(--nn-shell-muted)] hover:text-[var(--nn-shell-text)]'
              }`}
            >
              编辑
            </button>
            <button
              type="button"
              onClick={() => setTab('preview')}
              className={`min-h-11 flex-1 rounded-lg px-3 text-sm font-medium transition-colors duration-200 ${
                tab === 'preview'
                  ? 'bg-[var(--nn-primary)] text-white'
                  : 'bg-[var(--nn-shell-bg)] text-[var(--nn-shell-muted)] hover:text-[var(--nn-shell-text)]'
              }`}
            >
              预览
            </button>
          </div>

          {tab === 'edit' ? (
            <textarea
              value={node.contentMd}
              onChange={(e) => onChange({ contentMd: e.target.value })}
              rows={12}
              className="w-full resize-y rounded-lg border border-[var(--nn-shell-border)] bg-[var(--nn-shell-bg)] px-3 py-2 font-mono text-sm text-[var(--nn-shell-text)]"
              placeholder="Markdown 正文…"
            />
          ) : (
            <div className="prose prose-sm max-w-none rounded-lg border border-[var(--nn-shell-border)] bg-white p-3 text-slate-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {node.contentMd || '*暂无内容*'}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-[var(--nn-shell-border)] pt-3">
          <p className="text-sm font-medium">有向链接</p>
          {linksLoading ? (
            <div className="flex items-center gap-2 text-sm text-[var(--nn-shell-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              加载中…
            </div>
          ) : (
            <>
              <LinkGroup
                title="入边（反向链接）"
                icon={<ArrowLeft className="h-3.5 w-3.5" aria-hidden />}
                items={incoming}
                onFocus={onFocusNode}
                emptyText="暂无入边"
              />
              <LinkGroup
                title="出边（正向链接）"
                icon={<ArrowRight className="h-3.5 w-3.5" aria-hidden />}
                items={outgoing}
                onFocus={onFocusNode}
                emptyText="暂无出边"
              />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function LinkGroup({
  title,
  icon,
  items,
  onFocus,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  items: NodeLinkItem[];
  onFocus: (id: string) => void;
  emptyText: string;
}) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1 text-xs text-[var(--nn-shell-muted)]">
        {icon}
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-[var(--nn-shell-muted)]">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.edgeId}>
              <button
                type="button"
                onClick={() => onFocus(item.nodeId)}
                className="min-h-11 w-full cursor-pointer rounded-lg px-2 py-2 text-left text-sm transition-colors duration-200 hover:bg-[var(--nn-shell-bg)]"
              >
                <span className="font-medium">{item.title}</span>
                {item.label ? (
                  <span className="ml-1 text-xs text-[var(--nn-accent)]">[{item.label}]</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
