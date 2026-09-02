'use client'

import { Fragment } from 'react'
import type { Performance, Seat } from '../types'

interface SeatMapGridProps {
  performance: Performance
  seats: Seat[]
  selectedSeatIds: Set<string>
  onToggleSeat: (seatId: string) => void
  maxSeats: number
}

function seatAriaLabel(seat: Seat, isSelected: boolean) {
  const pos = `${seat.rowLabel} 排 ${seat.col} 号`
  if (seat.status === 'sold') return `${pos}，已售`
  if (isSelected) return `${pos}，已选，点击取消`
  return `${pos}，可选，点击选择`
}

export function SeatMapGrid({
  performance,
  seats,
  selectedSeatIds,
  onToggleSeat,
  maxSeats,
}: SeatMapGridProps) {
  const rows = Array.from(new Set(seats.map((s) => s.rowLabel))).sort()
  const cols = seats.length > 0 ? Math.max(...seats.map((s) => s.col)) : 0

  const selectedCount = selectedSeatIds.size
  const subtotal = selectedCount * performance.basePrice

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <span className="font-medium text-slate-900">{performance.title}</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>{performance.venue}</span>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium tracking-widest text-slate-500">
        舞 台
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          className="mx-auto inline-grid gap-y-2 gap-x-1.5 p-2 sm:gap-x-2"
          style={{
            gridTemplateColumns: `2rem repeat(${cols}, minmax(2rem, 2.25rem))`,
          }}
        >
          <div />
          {Array.from({ length: cols }, (_, i) => (
            <div
              key={i}
              className="text-center text-[10px] font-medium text-slate-400 sm:text-xs"
            >
              {i + 1}
            </div>
          ))}
          {rows.map((row) => (
            <Fragment key={row}>
              <div className="flex items-center justify-end pr-1 text-xs font-semibold text-slate-500">
                {row}
              </div>
              {Array.from({ length: cols }, (_, colIdx) => {
                const col = colIdx + 1
                const seat = seats.find((s) => s.rowLabel === row && s.col === col)
                if (!seat) return <div key={`${row}-${col}-empty`} />
                const isSelected = selectedSeatIds.has(seat.id)
                const isSold = seat.status === 'sold'
                const base =
                  'flex h-9 w-full min-w-[2rem] items-center justify-center rounded-md text-[10px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-1 sm:h-10 sm:text-xs'
                let cls = `${base} bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25`
                if (isSold) {
                  cls = `${base} cursor-not-allowed bg-slate-200 text-slate-400 ring-1 ring-slate-300`
                } else if (isSelected) {
                  cls = `${base} bg-amber-400 text-amber-950 ring-2 ring-amber-500 hover:bg-amber-500`
                }
                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={isSold}
                    aria-label={seatAriaLabel(seat, isSelected)}
                    aria-pressed={isSelected}
                    onClick={() => onToggleSeat(seat.id)}
                    className={cls}
                  >
                    {col}
                  </button>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-emerald-500/20 ring-1 ring-emerald-500/40" />
          可选
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-amber-400 ring-2 ring-amber-500" />
          已选
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-slate-200 ring-1 ring-slate-300" />
          已售
        </span>
        <span className="text-slate-400">单场最多选 {maxSeats} 座</span>
      </div>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-col gap-3 rounded-t-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-700">
          已选 <span className="font-semibold text-slate-900">{selectedCount}</span> 个座位
          <span className="mx-2 text-slate-300">·</span>
          合计 <span className="font-semibold text-red-600">¥{subtotal}</span>
        </p>
      </div>
    </div>
  )
}
