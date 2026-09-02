/**
 * 票务预定 MVP（无数据库）：演出列表 → 选座 → 模拟支付
 */

export type { BookingStep, Performance, Seat, SeatInventoryStatus } from './types'

export { PerformanceList, SeatMapGrid } from './components'

export {
  MOCK_PERFORMANCES,
  buildSeatGrid,
  getPerformanceById,
  MAX_SEATS_PER_ORDER,
  SERVICE_FEE_CNY,
} from './utils/mockData'

export { default as TicketBookingMvpPage } from './pages/TicketBookingMvpPage'
