export type BookingStep = 'list' | 'seats' | 'confirm' | 'done'

export interface Performance {
  id: string
  title: string
  subtitle?: string
  startsAt: string
  venue: string
  city?: string
  currency: 'CNY'
  basePrice: number
  posterGradient: string
}

export type SeatInventoryStatus = 'available' | 'sold'

export interface Seat {
  id: string
  rowLabel: string
  col: number
  status: SeatInventoryStatus
}
