import { db } from '@profile/db';
import { getApiSessionUser, isAdminRole } from '@profile/auth/session';
import type { PopupRouteConfig } from 'sa2kit/business/showmasterpiece/routes';
import { popupConfigService } from '../../popupConfigService';

export function createPopupHostRouteConfig(): PopupRouteConfig {
  return {
    db,
    popupConfigService,
    getSessionUser: getApiSessionUser,
    isAdminUser: (user) => isAdminRole(user?.role),
  };
}
