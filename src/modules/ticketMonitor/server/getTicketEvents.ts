import type { TicketEventsQuery, TicketEventsResult } from '../types';
import { ticketMonitorDb } from '../db/ticketMonitorDbService';

export async function getCachedTicketEvents(query: TicketEventsQuery): Promise<TicketEventsResult> {
  const events = await ticketMonitorDb.getCachedEvents(query);
  const lastSyncAt = await ticketMonitorDb.getLastSyncAt();

  return {
    events,
    errors: [],
    lastSyncAt: lastSyncAt ?? undefined,
  };
}
