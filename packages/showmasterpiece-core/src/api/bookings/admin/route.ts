/**
 * 预订管理：GET 列表；POST 强制刷新后查询
 */
import {
  createAdminRefreshBookingsHandler,
  createListAdminBookingsHandler,
} from 'sa2kit/business/showmasterpiece/routes';
import { createBookingHostRouteConfig } from '../../lib/bookingHostRouteConfig';

const config = createBookingHostRouteConfig();

export const GET = createListAdminBookingsHandler(config);
export const POST = createAdminRefreshBookingsHandler(config);

export const dynamic = 'force-dynamic';
export const revalidate = 0;
