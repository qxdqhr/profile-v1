/**
 * ShowMasterpiece — 单条预订
 */
import { db } from '@profile/db';
import { getApiSessionUser, isAdminRole } from '@profile/auth/session';
import {
  createDeleteBookingHandler,
  createGetBookingHandler,
  createUpdateBookingHandler,
} from 'sa2kit/business/showmasterpiece/routes';

const config = {
  db,
  getSessionUser: getApiSessionUser,
  isAdminUser: (user: { role?: string | null } | null) => isAdminRole(user?.role),
};

export const GET = createGetBookingHandler(config);
export const PUT = createUpdateBookingHandler(config);
export const DELETE = createDeleteBookingHandler(config);
