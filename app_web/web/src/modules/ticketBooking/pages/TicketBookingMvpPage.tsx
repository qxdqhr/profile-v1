'use client'

import { useCallback, useMemo, useState } from 'react'
import type { BookingStep, Performance } from '../types'
import { PerformanceList, SeatMapGrid } from '../components'
import {
  MOCK_PERFORMANCES,
  buildSeatGrid,
  getPerformanceById,
  MAX_SEATS_PER_ORDER,
  SERVICE_FEE_CNY,
} from '../utils/mockData'

function formatSeatLabel(seatId: string) {
  const [row, col] = seatId.split('-')
  if (!row || !col) return seatId
  return `${row} 排 ${col} 号`
}

function sortSeatIds(ids: string[]) {
  return [...ids].sort((a, b) => {
    const [ar, ac] = a.split('-')
    const [br, bc] = b.split('-')
    if (ar !== br) return ar.localeCompare(br)
    return Number(ac) - Number(bc)
  })
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

const STEPS: { key: BookingStep; label: string }[] = [
  { key: 'list', label: '选择演出' },
  { key: 'seats', label: '选择座位' },
  { key: 'confirm', label: '确认订单' },
]

export default function TicketBookingMvpPage() {
  const [step, setStep] = useState<BookingStep>('list')
  const [performanceId, setPerformanceId] = useState<string | null>(null)
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(() => new Set())
  const [seatHint, setSeatHint] = useState<string | null>(null)

  const performance = performanceId ? getPerformanceById(performanceId) : undefined
  const seats = useMemo(
    () => (performanceId ? buildSeatGrid(performanceId) : []),
    [performanceId],
  )

  const resetFlow = useCallback(() => {
    setStep('list')
    setPerformanceId(null)
    setSelectedSeatIds(new Set())
    setSeatHint(null)
  }, [])

  const pickPerformance = useCallback((p: Performance) => {
    setPerformanceId(p.id)
    setSelectedSeatIds(new Set())
    setSeatHint(null)
    setStep('seats')
  }, [])

  const toggleSeat = useCallback(
    (seatId: string) => {
      setSeatHint(null)
      const seat = seats.find((s) => s.id === seatId)
      if (!seat || seat.status === 'sold') return

      setSelectedSeatIds((prev) => {
        const next = new Set(prev)
        if (next.has(seatId)) {
          next.delete(seatId)
          return next
        }
        if (next.size >= MAX_SEATS_PER_ORDER) {
          setSeatHint(`单场最多选择 ${MAX_SEATS_PER_ORDER} 个座位`)
          return prev
        }
        next.add(seatId)
        return next
      })
    },
    [seats],
  )

  const goConfirm = useCallback(() => {
    if (selectedSeatIds.size === 0) {
      setSeatHint('请至少选择一个座位')
      return
    }
    setSeatHint(null)
    setStep('confirm')
  }, [selectedSeatIds.size])

  const mockPay = useCallback(() => {
    setStep('done')
  }, [])

  const subtotal = performance ? selectedSeatIds.size * performance.basePrice : 0
  const total = subtotal + (selectedSeatIds.size > 0 ? SERVICE_FEE_CNY : 0)

  const stepIndex =
    step === 'list' ? 0 : step === 'seats' ? 1 : step === 'confirm' || step === 'done' ? 2 : 0

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
            实验田 · 票务 MVP
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">演出票务预定</h1>
          <p className="mt-2 text-sm text-slate-600">
            演示流程：选演出 → 选座 → 模拟支付（无真实扣款与库存）。
          </p>
        </header>

        {step !== 'done' && (
          <nav className="mb-8 flex items-center gap-2 text-sm" aria-label="购票步骤">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    i <= stepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {i + 1}
                </span>
                <span className={i <= stepIndex ? 'font-medium text-slate-900' : 'text-slate-400'}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="mx-1 hidden text-slate-300 sm:inline">—</span>
                )}
              </div>
            ))}
          </nav>
        )}

        {step === 'list' && (
          <section aria-labelledby="list-heading">
            <h2 id="list-heading" className="mb-4 text-lg font-semibold">
              热门演出
            </h2>
            <PerformanceList performances={MOCK_PERFORMANCES} onPick={pickPerformance} />
          </section>
        )}

        {step === 'seats' && performance && (
          <section aria-labelledby="seats-heading" className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetFlow}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
              >
                ← 返回列表
              </button>
              <h2 id="seats-heading" className="text-lg font-semibold">
                选择座位
              </h2>
            </div>
            {seatHint && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
                {seatHint}
              </p>
            )}
            <SeatMapGrid
              performance={performance}
              seats={seats}
              selectedSeatIds={selectedSeatIds}
              onToggleSeat={toggleSeat}
              maxSeats={MAX_SEATS_PER_ORDER}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={goConfirm}
                disabled={selectedSeatIds.size === 0}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                确认选座
              </button>
            </div>
          </section>
        )}

        {step === 'confirm' && performance && (
          <section aria-labelledby="confirm-heading" className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('seats')}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
              >
                ← 修改座位
              </button>
              <h2 id="confirm-heading" className="text-lg font-semibold">
                订单确认
              </h2>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
              <div
                className={`h-24 shrink-0 rounded-xl bg-gradient-to-br ${performance.posterGradient} sm:h-auto sm:w-28`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold">{performance.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{formatDate(performance.startsAt)}</p>
                <p className="text-sm text-slate-600">{performance.venue}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-800">座位明细</h4>
              <ul className="mt-3 divide-y divide-slate-100">
                {sortSeatIds([...selectedSeatIds]).map((id) => (
                  <li
                    key={id}
                    className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0"
                  >
                    <span>{formatSeatLabel(id)}</span>
                    <span className="font-medium text-red-600">¥{performance.basePrice}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">小计</dt>
                  <dd className="font-medium">¥{subtotal}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">服务费（演示）</dt>
                  <dd className="font-medium">¥{SERVICE_FEE_CNY}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base">
                  <dt className="font-semibold">总计</dt>
                  <dd className="font-bold text-red-600">¥{total}</dd>
                </div>
              </dl>
            </div>

            <p className="text-xs text-slate-500">
              点击「模拟支付」不会产生任何真实交易；刷新页面后订单不会保留。
            </p>

            <button
              type="button"
              onClick={mockPay}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              模拟支付 ¥{total}
            </button>
          </section>
        )}

        {step === 'done' && performance && (
          <section
            className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center shadow-sm"
            aria-live="polite"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white">
              ✓
            </div>
            <h2 className="text-xl font-bold text-emerald-900">模拟支付成功</h2>
            <p className="mt-2 text-sm text-emerald-800">
              您已为「{performance.title}」完成演示支付，共 {selectedSeatIds.size} 座，合计 ¥
              {total}。
            </p>
            <button
              type="button"
              onClick={resetFlow}
              className="mt-8 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              返回演出列表
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
