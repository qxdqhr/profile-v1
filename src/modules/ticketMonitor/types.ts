export type TicketSource = 'eplus' | 'asobistore' | 'piapro' | 'lawsonticket';

export type TicketStatus = 'upcoming' | 'on_sale' | 'ended' | 'unknown';

export interface TicketEvent {
  id: string;
  title: string;
  receptionTitle?: string;
  seatInfo?: string;
  source: TicketSource;
  ticketOpenAt: string;
  ticketEndAt?: string;
  status: TicketStatus;
  eventUrl: string;
  coverImage?: string;
  location?: string;
  tags?: string[];
  fetchedAt: string;
}

export interface TicketEventsQuery {
  q?: string;
  sources?: TicketSource[];
  status?: TicketStatus;
  sortByEndAtDesc?: boolean;
  limit?: number;
}

export interface TicketEventsResult {
  events: TicketEvent[];
  errors: string[];
}
