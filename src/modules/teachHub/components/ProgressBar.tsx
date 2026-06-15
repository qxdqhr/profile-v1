'use client';

type ProgressBarProps = {
  completed: number;
  total: number;
  className?: string;
};

export function ProgressBar({ completed, total, className = '' }: ProgressBarProps) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.min(100, Math.round((completed / safeTotal) * 100));
  return (
    <div className={className}>
      <div className="mb-1 flex justify-between text-xs text-[#7a6f5c]">
        <span>
          {completed} / {total} 课已完成
        </span>
        <span>{pct}%</span>
      </div>
      <div className="th-progress" aria-hidden>
        <div className="th-progress__bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
