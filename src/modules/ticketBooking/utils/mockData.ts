import type { Performance, Seat } from '../types'

const ROW_LABELS = ['A', 'B', 'C', 'D', 'E'] as const
const COLS = 8

/** 每场固定已售座位（演示用） */
const SOLD_BY_PERFORMANCE: Record<string, string[]> = {
  'perf-sw-lake': ['A-1', 'A-8', 'B-3', 'C-5', 'D-2', 'E-1', 'E-8'],
  'perf-dream': ['A-2', 'B-4', 'B-5', 'C-1', 'D-6', 'E-3'],
  'perf-green': ['A-3', 'B-2', 'C-4', 'C-8', 'D-1', 'E-4'],
  'perf-vienna': ['A-5', 'B-8', 'C-2', 'D-4', 'E-2', 'E-7'],
}

export const MOCK_PERFORMANCES: Performance[] = [
  {
    id: 'perf-sw-lake',
    title: '天鹅湖',
    subtitle: '经典芭蕾舞剧',
    startsAt: '2026-06-14T19:30:00',
    venue: '国家大剧院 · 歌剧院',
    city: '北京',
    currency: 'CNY',
    basePrice: 280,
    posterGradient: 'from-sky-400 via-indigo-500 to-violet-600',
  },
  {
    id: 'perf-dream',
    title: '红楼梦 · 舞台剧',
    subtitle: '民族舞剧',
    startsAt: '2026-06-21T19:00:00',
    venue: '上海大剧院',
    city: '上海',
    currency: 'CNY',
    basePrice: 320,
    posterGradient: 'from-rose-400 via-red-500 to-amber-700',
  },
  {
    id: 'perf-green',
    title: '只此青绿',
    subtitle: '舞蹈诗剧',
    startsAt: '2026-07-05T20:00:00',
    venue: '广州大剧院',
    city: '广州',
    currency: 'CNY',
    basePrice: 380,
    posterGradient: 'from-emerald-400 via-teal-500 to-cyan-700',
  },
  {
    id: 'perf-vienna',
    title: '维也纳新春音乐会',
    subtitle: '交响音乐会',
    startsAt: '2026-12-31T21:00:00',
    venue: '深圳音乐厅',
    city: '深圳',
    currency: 'CNY',
    basePrice: 480,
    posterGradient: 'from-amber-300 via-orange-500 to-red-800',
  },
]

export function getPerformanceById(id: string): Performance | undefined {
  return MOCK_PERFORMANCES.find((p) => p.id === id)
}

export function buildSeatGrid(performanceId: string): Seat[] {
  const sold = new Set(SOLD_BY_PERFORMANCE[performanceId] ?? [])
  const seats: Seat[] = []
  for (const row of ROW_LABELS) {
    for (let col = 1; col <= COLS; col++) {
      const id = `${row}-${col}`
      seats.push({
        id,
        rowLabel: row,
        col,
        status: sold.has(id) ? 'sold' : 'available',
      })
    }
  }
  return seats
}

export const MAX_SEATS_PER_ORDER = 6

/** 固定服务费（元），与产品文档一致 */
export const SERVICE_FEE_CNY = 15
