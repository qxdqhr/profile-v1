import { db } from '@profile/db';
import { getApiSessionUser, isAdminRole } from '@profile/auth/session';
import type { SiteConfigRouteConfig } from 'sa2kit/business/showmasterpiece/routes';

export function createSiteConfigHostRouteConfig(): SiteConfigRouteConfig {
  return {
    db,
    getSessionUser: getApiSessionUser,
    isAdminUser: (user) => isAdminRole(user?.role),
  };
}
