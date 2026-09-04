import { db } from '@profile/db';
import { getApiSessionUser, isAdminRole } from '@profile/auth/session';
import type { ConfigItemsRouteConfig } from 'sa2kit/business/showmasterpiece/routes';
import { showmasterConfigService } from './configService';
import {
  defaultConfigEnvironment,
  resolveConfigEnvironment,
} from './configEnvironment';

export function createConfigItemsHostRouteConfig(): ConfigItemsRouteConfig {
  return {
    db,
    showmasterConfigService,
    getSessionUser: getApiSessionUser,
    isAdminUser: (user) => isAdminRole(user?.role),
    resolveEnvironment: resolveConfigEnvironment,
    defaultEnvironment: defaultConfigEnvironment,
  };
}
