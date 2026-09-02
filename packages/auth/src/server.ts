import type { Sa2kitAuthInstance } from 'sa2kit/common/auth/server';
import {
  diagnoseAppConfig,
  getAppConfig,
  logConfigDoctorReport,
  resolveAuthConfigFromAppConfig,
} from 'sa2kit/common/config/server';
import { ensureAppConfigLoaded } from '@profile/config';
import { db } from '@profile/db';
import { createProfileAuth } from './create-profile-auth';

let authInstance: Sa2kitAuthInstance | undefined;

export function getAuth(): Sa2kitAuthInstance {
  if (!authInstance) {
    ensureAppConfigLoaded();
    const appConfig = getAppConfig();
    logConfigDoctorReport(diagnoseAppConfig(appConfig));
    const authConfig = resolveAuthConfigFromAppConfig(appConfig, { db });
    authInstance = createProfileAuth(authConfig);
  }
  return authInstance;
}

/** 兼容现有 import { auth } */
export const auth = getAuth();
