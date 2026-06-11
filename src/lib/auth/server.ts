import { createSa2kitAuthFromAppConfig, type Sa2kitAuthInstance } from 'sa2kit/common/auth/server';
import { ensureAppConfigLoaded } from '@/lib/config/init';
import { db } from '@/db/index';

let authInstance: Sa2kitAuthInstance | undefined;

export function getAuth(): Sa2kitAuthInstance {
  if (!authInstance) {
    ensureAppConfigLoaded();
    authInstance = createSa2kitAuthFromAppConfig({ db }, { logDoctor: false });
  }
  return authInstance;
}

/** 兼容现有 import { auth } */
export const auth = getAuth();
