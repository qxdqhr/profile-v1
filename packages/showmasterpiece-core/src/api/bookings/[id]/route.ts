/**
 * ShowMasterpiece — 单条预订
 */
import {
  createDeleteBookingHandler,
  createGetBookingHandler,
  createUpdateBookingHandler,
} from 'sa2kit/business/showmasterpiece/routes';
import { createBookingHostRouteConfig } from '../../lib/bookingHostRouteConfig';

const config = createBookingHostRouteConfig();

export const GET = createGetBookingHandler(config);
export const PUT = createUpdateBookingHandler(config);
export const DELETE = createDeleteBookingHandler(config);
