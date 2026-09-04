import { db, forceRefreshDatabaseConnection, getDatabaseConnectionStatus } from '@profile/db';
import { getApiSessionUser, isAdminRole } from '@profile/auth/session';
import type { BookingRouteConfig } from 'sa2kit/business/showmasterpiece/routes';

/** profile 宿主共用的 showmasterpiece booking route config */
export function createBookingHostRouteConfig(): BookingRouteConfig {
  return {
    db,
    getSessionUser: getApiSessionUser,
    isAdminUser: (user) => isAdminRole(user?.role),
    forceRefreshDatabase: forceRefreshDatabaseConnection,
    getDatabaseConnectionStatus,
  };
}
