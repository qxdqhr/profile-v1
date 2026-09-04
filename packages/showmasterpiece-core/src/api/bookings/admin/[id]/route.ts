/**
 * 管理端删单
 */
import { createAdminDeleteBookingHandler } from 'sa2kit/business/showmasterpiece/routes';
import { createBookingHostRouteConfig } from '../../../lib/bookingHostRouteConfig';

const config = createBookingHostRouteConfig();

export const DELETE = createAdminDeleteBookingHandler(config);
