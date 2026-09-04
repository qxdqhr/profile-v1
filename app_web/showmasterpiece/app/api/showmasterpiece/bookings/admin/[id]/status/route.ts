/**
 * 管理端更新预订状态
 */
import { createAdminUpdateBookingStatusHandler } from 'sa2kit/business/showmasterpiece/routes';
import { createBookingHostRouteConfig } from '@lib/bookingHostRouteConfig';

const config = createBookingHostRouteConfig();

export const PUT = createAdminUpdateBookingStatusHandler(config);
