'use client';

import { Loader2, Plus, X } from 'lucide-react';

interface AddNodeDraftBarProps {
  creating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

export function AddNodeDraftBar({ creating, onConfirm, onCancel, className = '' }: AddNodeDraftBarProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-30 flex justify-center px-3 ${className}`}
      role="region"
      aria-label="添加节点确认"
    >
      <div className="pointer-events-auto w-full max-w-lg rounded-2xl border border-[var(--nn-shell-border)] bg-[var(--nn-shell-surface)]/95 p-3 shadow-xl backdrop-blur-sm">
        <p className="mb-3 text-center text-sm text-[var(--nn-shell-muted)] sm:text-left">
          拖动或缩放画布调整位置，节点将添加在当前视图中心
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={creating}
            onClick={onConfirm}
            className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--nn-primary)] px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-[var(--nn-primary-hover)] disabled:opacity-60"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
            确定添加节点
          </button>
          <button
            type="button"
            disabled={creating}
            onClick={onCancel}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--nn-shell-border)] px-4 text-sm text-[var(--nn-shell-text)] transition-colors duration-200 hover:bg-[var(--nn-shell-bg)] disabled:opacity-60"
          >
            <X className="h-4 w-4" aria-hidden />
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
