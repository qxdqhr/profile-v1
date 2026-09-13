import { createGetEventsHandler } from 'sa2kit/business/ticketMonitor/routes';
import { createTicketMonitorHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createTicketMonitorHostRouteConfig();
export const GET = createGetEventsHandler(config);
