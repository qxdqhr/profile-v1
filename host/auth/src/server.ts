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

/** 兼容现有 import { auth } — 首次访问属性时才连库，避免 import 即初始化 */
export const auth: Sa2kitAuthInstance = new Proxy({} as Sa2kitAuthInstance, {
  get(_target, prop) {
    const instance = getAuth();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
  // `"handler" in auth` 走 has，不能只靠 get（否则 better-auth 会把 proxy 当函数调用）
  has(_target, prop) {
    return Reflect.has(getAuth() as object, prop);
  },
});
