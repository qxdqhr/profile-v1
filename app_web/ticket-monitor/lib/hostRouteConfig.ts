import { db } from '@profile/db';
import { getApiSessionUser } from '@profile/auth/session';
import type { TicketMonitorRouteConfig } from 'sa2kit/business/ticketMonitor/routes';

export function createTicketMonitorHostRouteConfig(): TicketMonitorRouteConfig {
  return { db, getSessionUser: getApiSessionUser };
}
