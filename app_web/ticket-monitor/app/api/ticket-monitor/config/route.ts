import {
  createGetConfigHandler,
  createUpdateConfigHandler,
} from 'sa2kit/business/ticketMonitor/routes';
import { createTicketMonitorHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createTicketMonitorHostRouteConfig();
export const GET = createGetConfigHandler(config);
export const PUT = createUpdateConfigHandler(config);
