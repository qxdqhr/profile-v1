import { createCronSyncHandler } from 'sa2kit/business/ticketMonitor/routes';
import { createTicketMonitorHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createTicketMonitorHostRouteConfig();
export const POST = createCronSyncHandler(config);
