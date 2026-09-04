/**
 * 管理端导出 CSV
 */
import { createExportBookingsCsvHandler } from 'sa2kit/business/showmasterpiece/routes';
import { createBookingHostRouteConfig } from '@lib/bookingHostRouteConfig';

const config = createBookingHostRouteConfig();

export const GET = createExportBookingsCsvHandler(config);
