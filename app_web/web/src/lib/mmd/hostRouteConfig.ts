import { db } from '@/db';
import { getApiSessionUser, isAdminRole } from '@/lib/auth/session';
import type { MmdResourceRouteConfig } from 'sa2kit/business/mmd/routes';
import {
  createMMDModelsDbService,
  createMMDAnimationsDbService,
  createMMDAudiosDbService,
  createMMDScenesDbService,
} from 'sa2kit/business/mmd/server';

export function createMmdResourceHostRouteConfig(): MmdResourceRouteConfig {
  return {
    db,
    getSessionUser: getApiSessionUser,
    isAdminRole,
  };
}

export function createMmdResourceServices() {
  return {
    models: createMMDModelsDbService(db),
    animations: createMMDAnimationsDbService(db),
    audios: createMMDAudiosDbService(db),
    scenes: createMMDScenesDbService(db),
  };
}
