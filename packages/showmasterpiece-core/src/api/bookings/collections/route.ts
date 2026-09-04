/**
 * 可预订画集列表
 */
import { createListBookableCollectionsHandler } from 'sa2kit/business/showmasterpiece/routes';
import { createBookingHostRouteConfig } from '../../lib/bookingHostRouteConfig';

const config = createBookingHostRouteConfig();

export const GET = createListBookableCollectionsHandler(config);
