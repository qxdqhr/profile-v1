'use client'

import type { Performance } from '../types'

interface PerformanceListProps {
  performances: Performance[]
  onPick: (p: Performance) => void
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('zh-CN', {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return iso
  }
}

export function PerformanceList({ performances, onPick }: PerformanceListProps) {
  return (
    <ul className="flex flex-col gap-4">
      {performances.map((p) => (
        <li
          key={p.id}
          className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-stretch"
        >
          <div
            className={`h-28 shrink-0 rounded-xl bg-gradient-to-br ${p.posterGradient} sm:h-auto sm:w-32`}
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{p.title}</h3>
              {p.subtitle && (
                <p className="mt-0.5 text-sm text-slate-500">{p.subtitle}</p>
              )}
              <p className="mt-2 text-sm text-slate-600">{formatDate(p.startsAt)}</p>
              <p className="text-sm text-slate-500">
                {p.venue}
                {p.city ? ` · ${p.city}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="text-base font-medium text-red-600">¥{p.basePrice} 起 / 座</p>
              <button
                type="button"
                onClick={() => onPick(p)}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                选座购票
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
